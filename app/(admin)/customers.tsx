import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { affiliationsAPI, usersAPI } from '../../services/api';
import useGymStore from '../../stores/useGymStore';

interface ActiveCustomer {
  id: string;
  userId: string;
  gymId: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function AdminCustomersScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState<ActiveCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [userCache, setUserCache] = useState<{ [key: string]: string }>({});
  const selectedGym = useGymStore((state) => state.selectedGym);

  const fetchUserDetails = async (userIds: string[]) => {
    const uncachedIds = userIds.filter(id => !userCache[id]);
    
    if (uncachedIds.length === 0) return;

    try {
      const userDataPromises = uncachedIds.map(id => 
        usersAPI.getUserById(id)
          .then(res => ({ id, username: res.data.username }))
          .catch(() => ({ id, username: 'Unknown' }))
      );
      
      const results = await Promise.all(userDataPromises);
      const newCache = { ...userCache };
      
      results.forEach(({ id, username }) => {
        newCache[id] = username;
      });
      
      setUserCache(newCache);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  const fetchActiveCustomers = async (gymId: string) => {
    try {
      setLoading(true);
      const res = await affiliationsAPI.getActiveCustomersByGym(gymId);
      setCustomers(res.data);
      
      // Fetch user details for all active customers
      const userIds = res.data.map((c: ActiveCustomer) => c.userId);
      await fetchUserDetails(userIds);
    } catch (err) {
      console.error('Failed to fetch active customers:', err);
      Alert.alert('Error', 'Failed to load active customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGym) {
      fetchActiveCustomers(selectedGym.id);
    }
  }, [selectedGym]);

  const onPendingRequestsPress = () => router.push('/(admin)/customers-pending');

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.menuItem} onPress={onPendingRequestsPress}>
            <Text style={styles.menuItemText}>View Pending Requests</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Active Customers</Text>

          {customers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No active customers yet.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {customers.map((customer) => (
                <View key={customer.id} style={styles.card}>
                  <Text style={styles.name}>{userCache[customer.userId] || 'Loading...'}</Text>
                  <Text style={styles.meta}>Joined: {new Date(customer.createdAt).toLocaleDateString()}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyState: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
  },
  menuItem: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
});
