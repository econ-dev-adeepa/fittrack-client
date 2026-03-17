import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { ptAPI } from '../../services/api';


interface PTRequest {
  id: string;
  coachId: string;
  gymId: string;
  status: 'REQUESTED' | 'ACTIVE' | 'DENIED';
  createdAt: string;
  updatedAt: string;
}


const STATUS_CONFIG = {
  REQUESTED: {
    label: 'Pending Review',
    bg: '#FEF9C3',
    text: '#CA8A04',
    icon: '⏳',
    description: 'Your request is waiting for the coach to respond',
  },
  ACTIVE: {
    label: 'Active',
    bg: '#DCFCE7',
    text: '#16A34A',
    icon: '✅',
    description: 'Your personal training session is confirmed!',
  },
  DENIED: {
    label: 'Denied',
    bg: '#FEE2E2',
    text: '#DC2626',
    icon: '❌',
    description: 'The coach was unable to accept your request',
  },
};


export default function CustomerPTStatusScreen() {

    const [requests, setRequests] = useState<PTRequest[]>([]);
    const [trainer, setTrainer] = useState<PTRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'status' | 'trainer'>('status');

    useEffect(() => { fetchData(); }, []);


    const fetchData = async () => {

        try{
            const [statusRes, trainerRes ] = await Promise.all ([
                ptAPI.getMyStatus(),
                ptAPI.getMyTrainer(),
            ]);
            setRequests(statusRes.data);
            setTrainer(trainerRes.data);
 
        }catch(err){
            Alert.alert('Error', 'Failed to load PT status');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }


    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if(loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }


    const activeRequest = requests.find(r => r.status === 'ACTIVE');
    const pendingCount = requests.filter(r => r.status === 'REQUESTED').length;


    return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Training</Text>
        <Text style={styles.headerSubtitle}>
          {pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''}` : 'Track your PT status'}
        </Text>
      </View>

      {/* Active Trainer Banner */}
      {trainer && (
        <View style={styles.trainerBanner}>
          <View style={styles.trainerBannerLeft}>
            <View style={styles.trainerAvatar}>
              <Text style={styles.trainerAvatarText}>
                {trainer.coachId.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.trainerBannerLabel}>Your Personal Trainer</Text>
              <Text style={styles.trainerBannerId}>
                {trainer.coachId.slice(0, 16)}...
              </Text>
            </View>
          </View>
          <View style={styles.activeDot} />
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'status' && styles.activeTab]}
          onPress={() => setActiveTab('status')}
        >
          <Text style={[styles.tabText, activeTab === 'status' && styles.activeTabText]}>
            All Requests ({requests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trainer' && styles.activeTab]}
          onPress={() => setActiveTab('trainer')}
        >
          <Text style={[styles.tabText, activeTab === 'trainer' && styles.activeTabText]}>
            My Trainer
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {activeTab === 'status' ? (
          requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No PT requests yet</Text>
              <Text style={styles.emptySubtitle}>
                Browse coaches and send a personal training request
              </Text>
            </View>
          ) : (
            requests.map((req) => {
              const config = STATUS_CONFIG[req.status];
              return (
                <View key={req.id} style={styles.card}>
                  {/* Status Header */}
                  <View style={[styles.statusHeader, { backgroundColor: config.bg }]}>
                    <Text style={styles.statusIcon}>{config.icon}</Text>
                    <View style={styles.statusInfo}>
                      <Text style={[styles.statusLabel, { color: config.text }]}>
                        {config.label}
                      </Text>
                      <Text style={styles.statusDescription}>
                        {config.description}
                      </Text>
                    </View>
                  </View>

                  {/* Card Body */}
                  <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Coach ID</Text>
                      <Text style={styles.infoValue} numberOfLines={1}>
                        {req.coachId.slice(0, 20)}...
                      </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Gym</Text>
                      <Text style={styles.infoValue} numberOfLines={1}>
                        {req.gymId.slice(0, 20)}...
                      </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Requested</Text>
                      <Text style={styles.infoValue}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Last Updated</Text>
                      <Text style={styles.infoValue}>
                        {new Date(req.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )
        ) : (
          /* My Trainer Tab */
          trainer ? (
            <View style={styles.trainerCard}>
              <View style={styles.trainerCardAvatar}>
                <Text style={styles.trainerCardAvatarText}>
                  {trainer.coachId.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.trainerCardTitle}>Your Personal Trainer</Text>
              <View style={[styles.badge, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.badgeText, { color: '#16A34A' }]}>
                  ✓ Active Session
                </Text>
              </View>

              <View style={styles.trainerDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Coach ID</Text>
                  <Text style={styles.detailValue}>{trainer.coachId}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Gym ID</Text>
                  <Text style={styles.detailValue}>{trainer.gymId}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Training Since</Text>
                  <Text style={styles.detailValue}>
                    {new Date(trainer.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👤</Text>
              <Text style={styles.emptyTitle}>No active trainer</Text>
              <Text style={styles.emptySubtitle}>
                Send a PT request to a coach to get started
              </Text>
            </View>
          )
        )}
      </ScrollView>
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
  trainerBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1E293B', paddingHorizontal: 20, paddingVertical: 14,
  },
  trainerBannerLeft: { flexDirection: 'row', alignItems: 'center' },
  trainerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#2563EB', justifyContent: 'center',
    alignItems: 'center', marginRight: 10,
  },
  trainerAvatarText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  trainerBannerLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  trainerBannerId: { fontSize: 13, color: '#FFFFFF', fontWeight: '600', marginTop: 1 },
  activeDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981',
  },
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
    backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
  },
  statusIcon: { fontSize: 24, marginRight: 12 },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: 15, fontWeight: '700' },
  statusDescription: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardBody: { padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#1E293B', fontWeight: '600', maxWidth: '60%' },
  divider: { height: 1, backgroundColor: '#F1F5F9' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 32 },
  trainerCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24,
    alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  trainerCardAvatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#EFF6FF', justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
  },
  trainerCardAvatarText: { fontSize: 28, fontWeight: '700', color: '#2563EB' },
  trainerCardTitle: {
    fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 8,
  },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  trainerDetails: { width: '100%', gap: 12 },
  detailItem: {
    backgroundColor: '#F8FAFC', borderRadius: 8,
    padding: 12, flexDirection: 'row', justifyContent: 'space-between',
  },
  detailLabel: { fontSize: 13, color: '#64748B' },
  detailValue: { fontSize: 13, color: '#1E293B', fontWeight: '600', maxWidth: '60%' },
});