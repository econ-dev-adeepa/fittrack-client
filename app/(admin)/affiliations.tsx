import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
} from 'react-native';
import { affiliationsAPI } from '../../services/api';

interface Affiliation {
  id: string;
  userId: string;
  gymId: string;
  type: 'COACH' | 'CUSTOMER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', bg: '#FEF9C3', text: '#CA8A04' },
  APPROVED: { label: 'Approved', bg: '#DCFCE7', text: '#16A34A' },
  REJECTED: { label: 'Rejected', bg: '#FEE2E2', text: '#DC2626' },
};

export default function AdminAffiliationsScreen() {
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [loading, setLoading] = useState(false);
  const [gymId, setGymId] = useState('');
  const [searchedGymId, setSearchedGymId] = useState('');
  const [activeTab, setActiveTab] = useState<'COACH' | 'CUSTOMER'>('COACH');

  const fetchAffiliations = async (id: string) => {
    if (!id.trim()) {
      window.alert('Please enter a Gym ID');
      return;
    }
    try {
      setLoading(true);
      const res = await affiliationsAPI.getPendingByGym(id.trim());
      setAffiliations(res.data);
      setSearchedGymId(id.trim());
    } catch (err) {
      window.alert('Failed to load affiliations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const action = status === 'APPROVED' ? 'approve' : 'reject';
    const confirmed = window.confirm(`Are you sure you want to ${action} this request?`);
    if (!confirmed) return;

    try {
      await affiliationsAPI.updateStatus(id, status);
      fetchAffiliations(searchedGymId);
      window.alert(`Request ${action}d successfully!`);
    } catch (err) {
      window.alert(`Failed to ${action} request`);
    }
  };

  const filtered = affiliations.filter(a => a.type === activeTab);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Affiliations</Text>
        <Text style={styles.headerSubtitle}>Manage coach & customer requests</Text>
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
          onPress={() => fetchAffiliations(gymId)}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'COACH' && styles.activeTab]}
          onPress={() => setActiveTab('COACH')}
        >
          <Text style={[styles.tabText, activeTab === 'COACH' && styles.activeTabText]}>
            Coaches ({affiliations.filter(a => a.type === 'COACH').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'CUSTOMER' && styles.activeTab]}
          onPress={() => setActiveTab('CUSTOMER')}
        >
          <Text style={[styles.tabText, activeTab === 'CUSTOMER' && styles.activeTabText]}>
            Customers ({affiliations.filter(a => a.type === 'CUSTOMER').length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No pending requests</Text>
              <Text style={styles.emptySubtitle}>
                {searchedGymId ? 'No pending affiliation requests' : 'Enter a gym ID to search'}
              </Text>
            </View>
          ) : (
            filtered.map((item) => {
              const status = STATUS_CONFIG[item.status];
              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {item.userId.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>
                        {item.type === 'COACH' ? 'Coach' : 'Customer'}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        ID: {item.userId.slice(0, 16)}...
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.badgeText, { color: status.text }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={styles.metaText}>
                      📅 {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {item.status === 'PENDING' && (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleUpdateStatus(item.id, 'REJECTED')}
                      >
                        <Text style={styles.rejectButtonText}>✕ Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => handleUpdateStatus(item.id, 'APPROVED')}
                      >
                        <Text style={styles.approveButtonText}>✓ Approve</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
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
  tabs: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#2563EB' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#64748B' },
  activeTabText: { color: '#2563EB', fontWeight: '600' },
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
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardMeta: { marginBottom: 12 },
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