import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
  Alert, RefreshControl,
} from 'react-native';
import { gymsAPI, affiliationsAPI } from '../../services/api';

interface Gym {
  id: string;
  name: string;
  location: string;
  description?: string;
  phone?: string;
  memberCount?: number;
  coachCount?: number;
}

interface MyAffiliation {
  id: string;
  gymId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  type: string;
}

const DUMMY_GYMS: Gym[] = [
  {
    id: 'test-gym-123',
    name: 'FitTrack Colombo',
    location: 'Colombo 03',
    description: 'Premium fitness center in the heart of Colombo',
    phone: '0112345678',
    memberCount: 120,
    coachCount: 8,
  },
  {
    id: 'test-gym-456',
    name: 'FitTrack Kandy',
    location: 'Kandy City Center',
    description: 'State of the art gym facilities in Kandy',
    phone: '0812345678',
    memberCount: 85,
    coachCount: 5,
  },
  {
    id: 'test-gym-789',
    name: 'FitTrack Galle',
    location: 'Galle Fort Road',
    description: 'Modern gym with stunning sea view',
    phone: '0912345678',
    memberCount: 60,
    coachCount: 4,
  },
  {
    id: 'test-gym-101',
    name: 'FitTrack Negombo',
    location: 'Negombo Beach Road',
    description: 'Beachside fitness center with outdoor training',
    phone: '0312345678',
    memberCount: 45,
    coachCount: 3,
  },
];

const STATUS_CONFIG = {
  PENDING: { label: 'Awaiting Approval', bg: '#FEF9C3', text: '#CA8A04', ribbon: '#CA8A04', ribbonLabel: 'Pending' },
  APPROVED: { label: '✓ Enrolled', bg: '#DCFCE7', text: '#16A34A', ribbon: '#16A34A', ribbonLabel: 'Enrolled' },
  REJECTED: { label: '✕ Rejected', bg: '#FEE2E2', text: '#DC2626', ribbon: '#DC2626', ribbonLabel: 'Rejected' },
};

export default function CustomerGymsScreen() {
  const [myAffiliations, setMyAffiliations] = useState<MyAffiliation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => { fetchMyAffiliations(); }, []);

  const fetchMyAffiliations = async () => {
    try {
      const res = await affiliationsAPI.getMyAffiliations();
      // Filter only CUSTOMER type affiliations
      const customerAffiliations = res.data.filter(
        (a: MyAffiliation) => a.type === 'CUSTOMER'
      );
      setMyAffiliations(customerAffiliations);
    } catch (err) {
      console.log('Failed to load affiliations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyAffiliations();
  };

  const getGymStatus = (gymId: string) => {
    return myAffiliations.find(a => a.gymId === gymId);
  };

  const handleEnroll = (gym: Gym) => {
    const existing = getGymStatus(gym.id);
    if (existing) {
      Alert.alert(
        'Already Enrolled',
        `You already have a ${existing.status.toLowerCase()} request for ${gym.name}`
      );
      return;
    }

    Alert.alert(
      'Enroll in Gym',
      `Request to join ${gym.name}?\n\nYour request will be sent to the gym admin for approval.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enroll',
          onPress: async () => {
            setEnrollingId(gym.id);
            try {
              await gymsAPI.enroll(gym.id);
              await fetchMyAffiliations();
              Alert.alert('Request Sent! ✅', `Enrollment request sent to ${gym.name}!\n\nWaiting for gym admin approval.`);
            } catch (err: any) {
              const status = err?.response?.status;
              let msg = 'Failed to send enrollment request.';
              if (status === 409) {
                msg = `You already have a request for ${gym.name}.`;
                await fetchMyAffiliations();
              } else if (status === 401) {
                msg = 'Your session has expired.';
              }
              Alert.alert('Error', msg);
            } finally {
              setEnrollingId(null);
            }
          }
        }
      ]
    );
  };

  const filteredGyms = DUMMY_GYMS.filter(gym =>
    gym.name.toLowerCase().includes(search.toLowerCase()) ||
    gym.location.toLowerCase().includes(search.toLowerCase())
  );

  const enrolledCount = myAffiliations.filter(a => a.status === 'APPROVED').length;
  const pendingCount = myAffiliations.filter(a => a.status === 'PENDING').length;

  if (loading) {
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
        <View>
          <Text style={styles.headerTitle}>Find a Gym</Text>
          <Text style={styles.headerSubtitle}>
            {enrolledCount > 0
              ? `${enrolledCount} gym${enrolledCount > 1 ? 's' : ''} enrolled${pendingCount > 0 ? ` · ${pendingCount} pending` : ''}`
              : pendingCount > 0
              ? `${pendingCount} request${pendingCount > 1 ? 's' : ''} pending`
              : 'Enroll in multiple gyms'}
          </Text>
        </View>
        <View style={styles.gymCountBadge}>
          <Text style={styles.gymCountText}>{DUMMY_GYMS.length}</Text>
          <Text style={styles.gymCountLabel}>Gyms</Text>
        </View>
      </View>

      {/* My Enrolled Gyms Summary */}
      {myAffiliations.length > 0 && (
        <View style={styles.enrolledSection}>
          <Text style={styles.enrolledSectionTitle}>My Gyms</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.enrolledScroll}>
            {myAffiliations.map((affiliation) => {
              const gym = DUMMY_GYMS.find(g => g.id === affiliation.gymId);
              const config = STATUS_CONFIG[affiliation.status];
              return (
                <View key={affiliation.id} style={styles.enrolledChip}>
                  <Text style={styles.enrolledChipName}>{gym?.name || affiliation.gymId}</Text>
                  <View style={[styles.enrolledChipBadge, { backgroundColor: config.bg }]}>
                    <Text style={[styles.enrolledChipStatus, { color: config.text }]}>
                      {config.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or location..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94A3B8"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          You can enroll in multiple gyms. Each enrollment requires gym admin approval.
        </Text>
      </View>

      {/* Gyms List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {filteredGyms.map((gym) => {
          const affiliation = getGymStatus(gym.id);
          const isEnrolling = enrollingId === gym.id;
          const config = affiliation ? STATUS_CONFIG[affiliation.status] : null;

          return (
            <View key={gym.id} style={[
              styles.card,
              affiliation?.status === 'APPROVED' && styles.cardApproved,
              affiliation?.status === 'PENDING' && styles.cardPending,
              affiliation?.status === 'REJECTED' && styles.cardRejected,
            ]}>
              {/* Status Ribbon */}
              {affiliation && (
                <View style={[styles.ribbon, { backgroundColor: config!.ribbon }]}>
                  <Text style={styles.ribbonText}>{config!.ribbonLabel}</Text>
                </View>
              )}

              {/* Gym Header */}
              <View style={styles.cardHeader}>
                <View style={styles.gymIconContainer}>
                  <Text style={styles.gymIcon}>🏋️</Text>
                </View>
                <View style={styles.gymInfo}>
                  <Text style={styles.gymName}>{gym.name}</Text>
                  <View style={styles.locationRow}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.locationText}>{gym.location}</Text>
                  </View>
                </View>
              </View>

              {gym.description && (
                <Text style={styles.description}>{gym.description}</Text>
              )}

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{gym.memberCount}</Text>
                  <Text style={styles.statLabel}>Members</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{gym.coachCount}</Text>
                  <Text style={styles.statLabel}>Coaches</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{gym.phone}</Text>
                  <Text style={styles.statLabel}>Contact</Text>
                </View>
              </View>

              {/* Enroll Button */}
              <TouchableOpacity
                style={[
                  styles.enrollButton,
                  affiliation && { backgroundColor: config!.bg, borderWidth: 1.5, borderColor: config!.text },
                ]}
                onPress={() => handleEnroll(gym)}
                disabled={!!affiliation || isEnrolling}
                activeOpacity={0.8}
              >
                {isEnrolling ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : affiliation ? (
                  <Text style={[styles.enrollButtonTextStatus, { color: config!.text }]}>
                    {config!.label}
                  </Text>
                ) : (
                  <Text style={styles.enrollButtonText}>Enroll Now →</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  gymCountBadge: {
    backgroundColor: '#EFF6FF', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
  },
  gymCountText: { fontSize: 20, fontWeight: '800', color: '#2563EB' },
  gymCountLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  enrolledSection: {
    backgroundColor: '#FFFFFF', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  enrolledSectionTitle: {
    fontSize: 13, fontWeight: '600', color: '#64748B',
    paddingHorizontal: 16, marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  enrolledScroll: { paddingHorizontal: 16 },
  enrolledChip: {
    backgroundColor: '#F8FAFC', borderRadius: 12,
    padding: 10, marginRight: 10, minWidth: 130,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  enrolledChipName: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  enrolledChipBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  enrolledChipStatus: { fontSize: 11, fontWeight: '600' },
  searchSection: {
    padding: 16, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  clearIcon: { fontSize: 14, color: '#94A3B8', paddingHorizontal: 4 },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EFF6FF', padding: 12,
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 10, gap: 8,
  },
  infoIcon: { fontSize: 16 },
  infoText: { fontSize: 13, color: '#2563EB', flex: 1, lineHeight: 18 },
  list: { padding: 16, gap: 14 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    overflow: 'hidden',
  },
  cardApproved: { borderWidth: 1.5, borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
  cardPending: { borderWidth: 1.5, borderColor: '#FDE68A', backgroundColor: '#FFFBEB' },
  cardRejected: { borderWidth: 1.5, borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },
  ribbon: {
    position: 'absolute', top: 12, right: -8,
    paddingHorizontal: 14, paddingVertical: 4, borderRadius: 4,
  },
  ribbonText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  gymIconContainer: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: '#EFF6FF', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  gymIcon: { fontSize: 24 },
  gymInfo: { flex: 1 },
  gymName: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 3 },
  locationIcon: { fontSize: 12 },
  locationText: { fontSize: 13, color: '#64748B' },
  description: { fontSize: 13, color: '#64748B', lineHeight: 19, marginBottom: 12 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 10,
    padding: 12, marginBottom: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: '#E2E8F0' },
  enrollButton: {
    backgroundColor: '#2563EB', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  enrollButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  enrollButtonTextStatus: { fontWeight: '600', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#64748B' },
});