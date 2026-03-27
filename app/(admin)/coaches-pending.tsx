import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PendingCoach {
  id: string;
  name: string;
  specialty: string;
  email: string;
  requestedAt: string;
}

const PENDING_COACHES: PendingCoach[] = [
  {
    id: 'PCH-401',
    name: 'Rukshan Dilshan',
    specialty: 'Bodybuilding',
    email: 'rukshan.dilshan@example.com',
    requestedAt: '2026-03-20',
  },
  {
    id: 'PCH-402',
    name: 'Nadeesha Iddamalgoda',
    specialty: 'Functional Training',
    email: 'nadeesha.iddamalgoda@example.com',
    requestedAt: '2026-03-22',
  },
  {
    id: 'PCH-403',
    name: 'Heshani Kumarasinghe',
    specialty: 'Pilates',
    email: 'heshani.kumarasinghe@example.com',
    requestedAt: '2026-03-24',
  },
];

export default function AdminCoachesPendingScreen() {
  const onAccept = () => {};
  const onReject = () => {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Pending Coach Requests</Text>

      <View style={styles.list}>
        {PENDING_COACHES.map((coach) => (
          <View key={coach.id} style={styles.card}>
            <Text style={styles.name}>{coach.name}</Text>
            <Text style={styles.meta}>Specialty: {coach.specialty}</Text>
            <Text style={styles.meta}>{coach.email}</Text>
            <Text style={styles.meta}>Request ID: {coach.id}</Text>
            <Text style={styles.meta}>
              Requested: {new Date(coach.requestedAt).toLocaleDateString()}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
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
