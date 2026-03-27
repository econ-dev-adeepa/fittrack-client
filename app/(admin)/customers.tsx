import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Customer {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

const ACTIVE_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-1021',
    name: 'Nimal Perera',
    email: 'nimal.perera@example.com',
    joinedAt: '2026-01-11',
  },
  {
    id: 'CUST-1034',
    name: 'Ama Fernando',
    email: 'ama.fernando@example.com',
    joinedAt: '2026-02-02',
  },
  {
    id: 'CUST-1047',
    name: 'Ravindu Silva',
    email: 'ravindu.silva@example.com',
    joinedAt: '2026-02-28',
  },
  {
    id: 'CUST-1059',
    name: 'Tharushi Jayasena',
    email: 'tharushi.jayasena@example.com',
    joinedAt: '2026-03-06',
  },
];

export default function AdminCustomersScreen() {
  const router = useRouter();
  const onPendingRequestsPress = () => router.push('/(admin)/customers-pending');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.menuItem} onPress={onPendingRequestsPress}>
        <Text style={styles.menuItemText}>View Pending Requests</Text>
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Active Customers</Text>

      <View style={styles.list}>
        {ACTIVE_CUSTOMERS.map((customer) => (
          <View key={customer.id} style={styles.card}>
            <Text style={styles.name}>{customer.name}</Text>
            <Text style={styles.meta}>{customer.email}</Text>
            <Text style={styles.meta}>Customer ID: {customer.id}</Text>
            <Text style={styles.meta}>Joined: {new Date(customer.joinedAt).toLocaleDateString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
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
