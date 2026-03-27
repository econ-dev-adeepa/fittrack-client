import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useGymStore from '../../stores/useGymStore';
import awaitable from '../../lib/awaitable';
import { gymsAPI } from '../../services/api';
import { useEffect } from 'react';

function Menu() {
  const router = useRouter();
  return (
    <TouchableOpacity 
      style={{ marginRight: 16, justifyContent: 'center', alignItems: 'center', height: 120 }}
      onPress={() => router.push('/(admin)/settings')}
    >
      <Ionicons name="menu-outline" size={24} color="#1E293B" />
    </TouchableOpacity>
  );
}

export function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: { backgroundColor: '#FFFFFF', height: 120 },
        headerTintColor: '#1E293B',
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => <Menu />,
      }}
    >
      <Tabs.Screen
        name="programs"
        options={{
          title: 'Programs',
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>Programs</Text>
              <Text style={styles.headerSubtitle}>Review & approve coach programs</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pt-requests"
        options={{
          title: 'PT Requests',
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>PT Requests</Text>
              <Text style={styles.headerSubtitle}>Final approval for personal training</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          href: null,
          headerRight: () => {
            const router = useRouter();
            return (
              <TouchableOpacity 
                style={{ marginRight: 16, justifyContent: 'center', alignItems: 'center', height: 120 }}
                onPress={() => router.back()}
              >
                <Ionicons name="close-outline" size={32} color="#1E293B" />
              </TouchableOpacity>
            );
          },
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.headerSubtitle}>Manage Gym Details</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings/register-gym"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          title: 'Logout',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.loadingText}>Loading gym data...</Text>
    </View>
  );
}

async function fetchGyms() {
  const [err, res] = await awaitable(gymsAPI.getAdminGyms());
  if (err) {
    throw new Error('Failed to fetch gyms');
  }

  return res.data;
}

export default function AdminLayoutWrapper() {
  const gyms = useGymStore((state) => state.gyms);
  const selectedGym = useGymStore((state) => state.selectedGym);

  useEffect(() => {
    if (gyms === undefined) {
      fetchGyms().then((fetchedGyms) => {
        useGymStore.setState({ gyms: fetchedGyms });
        if (fetchedGyms.length > 0) {
          const defaultGym = fetchedGyms[0];
          useGymStore.setState({ selectedGym: defaultGym });
        }
      })
    }
  }, [gyms]);

  if (gyms === undefined || selectedGym === null) {
    return <LoadingScreen />;
  }

  return <AdminLayout />;
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
});