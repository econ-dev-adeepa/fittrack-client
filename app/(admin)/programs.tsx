import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
  Alert,
} from 'react-native';
import { programsAPI } from '../../services/api';

interface Program {
  id: string;
  title: string;
  description?: string;
  coachId: string;
  gymId: string;
  status: string;
  schedule?: string;
  createdAt: string;
}

export default function AdminProgramsScreen() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [gymId, setGymId] = useState('');
  const [searchedGymId, setSearchedGymId] = useState('');

  const fetchPrograms = async (id: string) => {
    if (!id.trim()) {
      Alert.alert('Please enter a Gym ID');
      return;
    }
    try {
      setLoading(true);
      const res = await programsAPI.getPendingByGym(id.trim());
      setPrograms(res.data);
      setSearchedGymId(id.trim());
    } catch (err) {
      Alert.alert('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const action = status === 'APPROVED' ? 'approve' : 'reject';
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${action} this program?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: status === 'REJECTED' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await programsAPI.updateStatus(id, status);
              fetchPrograms(searchedGymId);
              Alert.alert('Success', `Program ${action}d successfully!`);
            } catch (err) {
              Alert.alert('Error', `Failed to ${action} program`);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Programs</Text>
        <Text style={styles.headerSubtitle}>Review & approve coach programs</Text>
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
          onPress={() => fetchPrograms(gymId)}
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
          {programs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No pending programs</Text>
              <Text style={styles.emptySubtitle}>
                {searchedGymId ? 'No programs pending approval' : 'Enter a gym ID to search'}
              </Text>
            </View>
          ) : (
            programs.map((program) => (
              <View key={program.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{program.title}</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Pending</Text>
                  </View>
                </View>
                {program.description && (
                  <Text style={styles.cardDescription}>{program.description}</Text>
                )}
                {program.schedule && (
                  <Text style={styles.scheduleText}>🗓 {program.schedule}</Text>
                )}
                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>
                    Coach: {program.coachId.slice(0, 16)}...
                  </Text>
                  <Text style={styles.metaText}>
                    📅 {new Date(program.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleUpdateStatus(program.id, 'REJECTED')}
                  >
                    <Text style={styles.rejectButtonText}>✕ Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleUpdateStatus(program.id, 'APPROVED')}
                  >
                    <Text style={styles.approveButtonText}>✓ Approve</Text>
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
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', flex: 1 },
  pendingBadge: {
    backgroundColor: '#FEF9C3', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20,
  },
  pendingBadgeText: { fontSize: 12, fontWeight: '600', color: '#CA8A04' },
  cardDescription: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  scheduleText: { fontSize: 13, color: '#64748B', marginBottom: 8 },
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
});