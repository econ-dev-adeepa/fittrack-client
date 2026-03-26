import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { ptAPI } from '../../services/api';


interface PTRequest {
    id: string;
    customerId: string;
    gymId: string;
    status: 'REQUESTED' | 'COACH_APPROVED'| 'ACTIVE' | 'DENIED';
    createdAt: string;
}


const STATUS_CONFIG = {
    REQUESTED: { label: 'Pending', bg: '#FEF9C3', text: '#CA8A04' },
    COACH_APPROVED: { label: 'Awaiting Gym Admin', bg: '#DBEAFE', text: '#2563EB' },
    ACTIVE: { label: 'Active', bg: '#DCFCE7', text: '#16A34A' },
    DENIED: { label: 'Denied', bg: '#FEE2E2', text: '#DC2626' },
}

type FilterType = 'ALL' | 'REQUESTED' | 'ACTIVE' | 'DENIED';

export default function CoachPTRequestsScreen() {
    const [requests, setRequests] = useState<PTRequest[]>([]);
    const [clients, setClients] = useState<PTRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
    const [activeTab, setActiveTab] = useState<'requests' | 'clients'>('requests');

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        try{
            setLoading(true);
            const [reqRes, clientRes] = await Promise.all([
                ptAPI.getMyRequests(),
                ptAPI.getMyClients(),
            ]);
            setRequests(reqRes.data);
            setClients(clientRes.data);

        }catch(err){
            Alert.alert('Error', 'Failed to load data');

        }finally {
            setLoading(false);
        }
    }


    const handleUpdateStatus = async (id: string, status: 'COACH_APPROVED' | 'DENIED') => {
        const action = status === 'COACH_APPROVED' ? 'approve' : 'deny';
        Alert.alert(
            `${action.charAt(0).toUpperCase() + action.slice(1)} Request`,
            `Are you sure you want to ${action} this PT request?`,
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: action.charAt(0).toUpperCase() + action.slice(1),
                    style: status === 'DENIED' ? 'destructive' : 'default',
                    onPress: async () => {
                        try{
                            await ptAPI.updateStatus(id, status);
                            fetchData();

                        }catch(err){
                            Alert.alert('Error', `Failed to ${action} request`);
                        }
                    }
                }
            ]
        )
    }


    // const handleUpdateStatus = async (id: string, status: 'COACH_APPROVED' | 'DENIED') => {
    //   const action = status === 'COACH_APPROVED' ? 'approve' : 'deny';
    //   const confirmed = window.confirm(`Are you sure you want to ${action} this PT request?`);
    //   if (!confirmed) return;

    //   try {
    //     await ptAPI.updateStatus(id, status);
    //     fetchData();
    //     window.alert(`PT request ${action}d successfully!`);
    //   } catch (err) {
    //     window.alert(`Failed to ${action} request. Please try again.`);
    //   }
    // };


    const filteredRequests = activeFilter === 'ALL'
    ? requests
    : requests.filter((r) => r.status === activeFilter);

    if(loading){
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }



    return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PT Management</Text>
        <Text style={styles.headerSubtitle}>
          {requests.filter(r => r.status === 'REQUESTED').length} pending requests
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests ({requests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'clients' && styles.activeTab]}
          onPress={() => setActiveTab('clients')}
        >
          <Text style={[styles.tabText, activeTab === 'clients' && styles.activeTabText]}>
            Active Clients ({clients.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'requests' ? (
        <>
          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {(['ALL', 'REQUESTED', 'ACTIVE', 'DENIED'] as FilterType[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterPill, activeFilter === f && styles.activeFilterPill]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>
                  {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Requests List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          >
            {filteredRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyTitle}>No requests found</Text>
                <Text style={styles.emptySubtitle}>No PT requests match this filter</Text>
              </View>
            ) : (
              filteredRequests.map((req) => {
                const status = STATUS_CONFIG[req.status];
                return (
                  <View key={req.id} style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                          {req.customerId.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>Customer</Text>
                        <Text style={styles.cardSubtitle} numberOfLines={1}>
                          ID: {req.customerId.slice(0, 12)}...
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
                        🏋️ Gym: {req.gymId.slice(0, 12)}...
                      </Text>
                      <Text style={styles.metaText}>
                        📅 {new Date(req.createdAt).toLocaleDateString()}
                      </Text>
                    </View>

                    {req.status === 'REQUESTED' && (
                      <View style={styles.actions}>
                        <TouchableOpacity
                          style={styles.denyButton}
                          onPress={() => handleUpdateStatus(req.id, 'DENIED')}
                        >
                          <Text style={styles.denyButtonText}>✕ Deny</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.approveButton}
                          onPress={() => handleUpdateStatus(req.id, 'COACH_APPROVED')}
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
        </>
      ) : (
        /* Active Clients Tab */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {clients.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No active clients</Text>
              <Text style={styles.emptySubtitle}>Approve PT requests to get clients</Text>
            </View>
          ) : (
            clients.map((client) => (
              <View key={client.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.avatarCircle, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={[styles.avatarText, { color: '#16A34A' }]}>
                      {client.customerId.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>Active Client</Text>
                    <Text style={styles.cardSubtitle}>
                      ID: {client.customerId.slice(0, 12)}...
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={[styles.badgeText, { color: '#16A34A' }]}>Active</Text>
                  </View>
                </View>
                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>
                    🏋️ Gym: {client.gymId.slice(0, 12)}...
                  </Text>
                  <Text style={styles.metaText}>
                    📅 Since {new Date(client.createdAt).toLocaleDateString()}
                  </Text>
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
  tabs: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#2563EB' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#64748B' },
  activeTabText: { color: '#2563EB', fontWeight: '600' },
  filters: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#F1F5F9',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  activeFilterPill: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  filterText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  activeFilterText: { color: '#FFFFFF' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  cardSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metaText: { fontSize: 12, color: '#94A3B8' },
  actions: { flexDirection: 'row', gap: 10 },
  denyButton: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#FCA5A5', alignItems: 'center',
    backgroundColor: '#FFF5F5',
  },
  denyButtonText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  approveButton: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#2563EB', alignItems: 'center',
  },
  approveButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#64748B' },
});
