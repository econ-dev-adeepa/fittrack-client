import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { affiliationsAPI } from '../../services/api';
import useGymStore from '../../stores/useGymStore';

interface PendingCustomer {
  id: string;
  userId: string;
  gymId: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function AdminCustomersPendingScreen() {
  const [customers, setCustomers] = useState<PendingCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const selectedGym = useGymStore((state) => state.selectedGym);

  const fetchPendingCustomers = async (gymId: string) => {
    try {
      setLoading(true);
      const res = await affiliationsAPI.getPendingCustomersByGym(gymId);
      setCustomers(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load pending customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGym) {
      fetchPendingCustomers(selectedGym.id);
    }
  }, [selectedGym]);

  const handleUpdateStatus = (customer: PendingCustomer, status: 'APPROVED' | 'REJECTED') => {
    if (!selectedGym) {
      Alert.alert('Error', 'No gym selected');
      return;
    }

    const action = status === 'APPROVED' ? 'approve' : 'reject';

    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${action} this customer request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: status === 'REJECTED' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setProcessingId(customer.id);
              await affiliationsAPI.updateStatus(customer.id, status);
              await fetchPendingCustomers(selectedGym.id);
              Alert.alert('Success', `Customer request ${action}d successfully`);
            } catch (err) {
              Alert.alert('Error', `Failed to ${action} customer request`);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Pending Customer Requests</Text>

          {customers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No pending customer requests.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {customers.map((customer) => (
                <View key={customer.id} style={styles.card}>
                  <Text style={styles.name}>Customer {customer.userId.slice(0, 8)}</Text>
                  <Text style={styles.meta}>Request ID: {customer.id}</Text>
                  <Text style={styles.meta}>
                    Requested: {new Date(customer.createdAt).toLocaleDateString()}
                  </Text>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleUpdateStatus(customer, 'REJECTED')}
                      disabled={processingId === customer.id}
                    >
                      {processingId === customer.id ? (
                        <ActivityIndicator size="small" color="#DC2626" />
                      ) : (
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleUpdateStatus(customer, 'APPROVED')}
                      disabled={processingId === customer.id}
                    >
                      {processingId === customer.id ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      )}
                    </TouchableOpacity>
                  </View>
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
  sectionTitle: {
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
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 10,
  },
  rejectButtonText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    paddingVertical: 10,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
