import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
} from 'react-native';
import { ptAPI } from '../../services/api';

interface PTRequest {
  id: string;
  customerId: string;
  coachId: string;
  gymId: string;
  status: string;
  createdAt: string;
  preferredDays?: string;
  preferredTime?: string;
  notes?: string;
}

export default function AdminPTRequestsScreen() {
  const [requests, setRequests] = useState<PTRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [gymId, setGymId] = useState('');
  const [searchedGymId, setSearchedGymId] = useState('');

  const fetchRequests = async (id: string) => {
    if (!id.trim()) {
      window.alert('Please enter a Gym ID');
      return;
    }
    try {
      setLoading(true);
      const res = await ptAPI.getCoachApprovedByGym(id.trim());
      setRequests(res.data);
      setSearchedGymId(id.trim());
    } catch (err) {
      window.alert('Failed to load PT requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'ACTIVE' | 'DENIED') => {
    const action = status === 'ACTIVE' ? 'activate' : 'deny';
    const confirmed = window.confirm(`Are you sure you want to ${action} this PT request?`);
    if (!confirmed) return;

    try {
      await ptAPI.updateStatusByAdmin(id, status);
      fetchRequests(searchedGymId);
      window.alert(`PT request ${action}d successfully!`);
    } catch (err) {
      window.alert(`Failed to ${action} PT request`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PT Requests</Text>
        <Text style={styles.headerSubtitle}>Final approval for personal training</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter Gym ID..."
          value={gymId}
          onChangeText={setGymId}
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => fetchRequests(gymId)}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🤝</Text>
              <Text style={styles.emptyTitle}>No coach-approved requests</Text>
              <Text style={styles.emptySubtitle}>
                {searchedGymId ? 'No PT requests awaiting your approval' : 'Enter a gym ID to search'}
              </Text>
            </View>
          ) : (
            requests.map((req) => (
              <View key={req.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {req.customerId.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>PT Request</Text>
                    <Text style={styles.cardSubtitle}>
                      Customer: {req.customerId.slice(0, 16)}...
                    </Text>
                  </View>
                  <View style={styles.coachApprovedBadge}>
                    <Text style={styles.coachApprovedText}>Coach Approved</Text>
                  </View>
                </View>
                <View style={styles.cardMeta}>
                <Text style={styles.metaText}>
                    🏋️ Coach: {req.coachId.slice(0, 16)}...
                </Text>
                <Text style={styles.metaText}>
                    📅 {new Date(req.createdAt).toLocaleDateString()}
                </Text>
                </View>

                {/* Schedule Details */}
                {(req.preferredDays || req.preferredTime || req.notes) && (
                <View style={styles.scheduleBox}>
                    {req.preferredDays && (
                    <View style={styles.scheduleRow}>
                        <Text style={styles.scheduleIcon}>📆</Text>
                        <Text style={styles.scheduleText}>Days: {req.preferredDays}</Text>
                    </View>
                    )}
                    {req.preferredTime && (
                    <View style={styles.scheduleRow}>
                        <Text style={styles.scheduleIcon}>🕐</Text>
                        <Text style={styles.scheduleText}>Time: {req.preferredTime}</Text>
                    </View>
                    )}
                    {req.notes && (
                    <View style={styles.scheduleRow}>
                        <Text style={styles.scheduleIcon}>📝</Text>
                        <Text style={styles.scheduleText}>Notes: {req.notes}</Text>
                    </View>
                    )}
                </View>
                )}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleUpdateStatus(req.id, 'DENIED')}
                  >
                    <Text style={styles.rejectButtonText}>✕ Deny</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleUpdateStatus(req.id, 'ACTIVE')}
                  >
                    <Text style={styles.approveButtonText}>✓ Activate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  searchSection: {
    flexDirection: 'row', padding: 16, gap: 10,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1E293B',
  },
  searchButton: {
    backgroundColor: '#2563EB', paddingHorizontal: 16,
    borderRadius: 8, justifyContent: 'center',
  },
  searchButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EFF6FF', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  cardSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  coachApprovedBadge: {
    backgroundColor: '#DBEAFE', paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 20,
  },
  coachApprovedText: { fontSize: 11, fontWeight: '600', color: '#2563EB' },
  cardMeta: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
  },
  metaText: { fontSize: 12, color: '#94A3B8' },
  actions: { flexDirection: 'row', gap: 10 },
  rejectButton: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#FCA5A5',
    alignItems: 'center', backgroundColor: '#FFF5F5',
  },
  rejectButtonText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  approveButton: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#2563EB', alignItems: 'center',
  },
  approveButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  
  scheduleBox: {
  backgroundColor: '#F8FAFC', borderRadius: 8,
  padding: 10, marginBottom: 12, gap: 6,
},
scheduleRow: {
  flexDirection: 'row', alignItems: 'center', gap: 6,
},
scheduleIcon: { fontSize: 13 },
scheduleText: { fontSize: 13, color: '#475569', fontWeight: '500' },
});