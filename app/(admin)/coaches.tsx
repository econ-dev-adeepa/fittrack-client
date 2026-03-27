import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Coach {
  id: string;
  name: string;
  specialty: string;
  email: string;
  joinedAt: string;
}

const ACTIVE_COACHES: Coach[] = [
  {
    id: 'COACH-201',
    name: 'Kasun Wijesinghe',
    specialty: 'Strength Training',
    email: 'kasun.wijesinghe@example.com',
    joinedAt: '2025-12-15',
  },
  {
    id: 'COACH-207',
    name: 'Dinithi Gunawardena',
    specialty: 'Weight Loss',
    email: 'dinithi.gunawardena@example.com',
    joinedAt: '2026-01-20',
  },
  {
    id: 'COACH-214',
    name: 'Sahan de Alwis',
    specialty: 'Mobility & Rehab',
    email: 'sahan.alwis@example.com',
    joinedAt: '2026-02-14',
  },
  {
    id: 'COACH-219',
    name: 'Madhavi Peris',
    specialty: 'Athletic Performance',
    email: 'madhavi.peris@example.com',
    joinedAt: '2026-03-03',
  },
];

export default function AdminCoachesScreen() {
  const router = useRouter();
  const onPendingRequestsPress = () => router.push('/(admin)/coaches-pending');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.menuItem} onPress={onPendingRequestsPress}>
        <Text style={styles.menuItemText}>View Pending Requests</Text>
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Active Coaches</Text>

      <View style={styles.list}>
        {ACTIVE_COACHES.map((coach) => (
          <View key={coach.id} style={styles.card}>
            <Text style={styles.name}>{coach.name}</Text>
            <Text style={styles.meta}>Specialty: {coach.specialty}</Text>
            <Text style={styles.meta}>{coach.email}</Text>
            <Text style={styles.meta}>Coach ID: {coach.id}</Text>
            <Text style={styles.meta}>Joined: {new Date(coach.joinedAt).toLocaleDateString()}</Text>
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
