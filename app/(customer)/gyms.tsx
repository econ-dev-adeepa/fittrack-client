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

const STATUS_CONFIG = {
  PENDING: { label: 'Awaiting Approval', bg: '#FEF9C3', text: '#CA8A04', border: '#FDE68A' },
  APPROVED: { label: '✓ Enrolled', bg: '#DCFCE7', text: '#16A34A', border: '#86EFAC' },
  REJECTED: { label: '✕ Rejected', bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' },
};

type TabType = 'available' | 'mygyms';

export default function CustomerGymsScreen() {
  const [myAffiliations, setMyAffiliations] = useState<MyAffiliation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('available');
  const [gyms, setGyms] = useState<Gym[]>([]);

  // useEffect(() => { fetchMyAffiliations(); }, []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchGyms(), fetchMyAffiliations()]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const fetchGyms = async () => {
    try {
      const res = await gymsAPI.getAll();
      setGyms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log('Failed to load gyms');
      setGyms([]);
    }
  };

  const fetchMyAffiliations = async () => {
    try {
      const res = await affiliationsAPI.getMyAffiliations();
      const customerAffiliations = res.data.filter(
        (a: MyAffiliation) => a.type === 'CUSTOMER'
      );
      setMyAffiliations(customerAffiliations);
    } catch (err) {
      console.log('Failed to load affiliations');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInitialData();
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


  const handleUnenroll = (affiliation: MyAffiliation) => {
  const gym = gyms.find(g => g.id === affiliation.gymId);
  const gymName = gym?.name || affiliation.gymId;
  const isRejected = affiliation.status === 'REJECTED';
  const isPending = affiliation.status === 'PENDING';

  const title = isRejected ? 'Remove Gym' : isPending ? 'Cancel Request' : 'Unenroll from Gym';
  const message = isRejected
    ? `Remove ${gymName} from your list?`
    : isPending
    ? `Cancel your enrollment request for ${gymName}?`
    : `Are you sure you want to unenroll from ${gymName}?`;
  const buttonText = isRejected ? 'Remove' : isPending ? 'Cancel Request' : 'Unenroll';

  Alert.alert(title, message, [
    { text: 'Keep', style: 'cancel' },
    {
      text: buttonText,
      style: 'destructive',
      onPress: async () => {
        try {
          await affiliationsAPI.remove(affiliation.id);
          await fetchMyAffiliations();
          Alert.alert('Done', isRejected
            ? `${gymName} removed.`
            : isPending
            ? `Request cancelled for ${gymName}.`
            : `You have unenrolled from ${gymName}.`
          );
        } catch (err: any) {
          const status = err?.response?.status;
          let msg = 'Failed to remove gym.';
          if (status === 403) msg = 'You do not have permission to do this.';
          Alert.alert('Error', msg);
        }
      }
    }
  ]);
};

  // const handleUnenroll = (affiliation: MyAffiliation) => {
  //   const gym = gyms.find(g => g.id === affiliation.gymId);
  //   const gymName = gym?.name || affiliation.gymId;
  //   const isRejected = affiliation.status === 'REJECTED';
  
  //   Alert.alert(
  //     isRejected ? 'Remove Gym' : 'Unenroll from Gym',
  //     isRejected
  //       ? `Remove ${gymName} from your list?`
  //       : `Are you sure you want to unenroll from ${gymName}?\n\nThis will remove your membership.`,
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: isRejected ? 'Remove' : 'Unenroll',
  //         style: 'destructive',
  //         onPress: async () => {
  //           try {
  //             await affiliationsAPI.remove(affiliation.id);
  //             await fetchMyAffiliations();
  //             Alert.alert(
  //               'Done',
  //               isRejected
  //                 ? `${gymName} removed from your list.`
  //                 : `You have unenrolled from ${gymName}.`
  //             );
  //           } catch (err: any) {
  //             const status = err?.response?.status;
  //             let msg = 'Failed to remove gym.';
  //             if (status === 403) msg = 'You do not have permission to do this.';
  //             Alert.alert('Error', msg);
  //           }
  //         }
  //       }
  //     ]
  //   );
  // };

  const filteredGyms = gyms.filter(gym =>
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
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Gyms</Text>
        <Text style={styles.headerSubtitle}>
          {enrolledCount > 0
            ? `${enrolledCount} enrolled${pendingCount > 0 ? ` · ${pendingCount} pending` : ''}`
            : pendingCount > 0
            ? `${pendingCount} request${pendingCount > 1 ? 's' : ''} pending`
            : 'Find and enroll in gyms'}
        </Text>
      </View> */}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Available Gyms
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mygyms' && styles.activeTab]}
          onPress={() => setActiveTab('mygyms')}
        >
          <Text style={[styles.tabText, activeTab === 'mygyms' && styles.activeTabText]}>
            My Gyms ({myAffiliations.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'available' ? (
        <>
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

          {/* Available Gyms List */}
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
                  {affiliation && (
                    <View style={[styles.ribbon, { backgroundColor: config!.text }]}>
                      <Text style={styles.ribbonText}>
                        {affiliation.status === 'APPROVED' ? 'Enrolled' :
                         affiliation.status === 'PENDING' ? 'Pending' : 'Rejected'}
                      </Text>
                    </View>
                  )}

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
        </>
      ) : (
        /* My Gyms Tab */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
        >
          {myAffiliations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={styles.emptyTitle}>No gyms yet</Text>
              <Text style={styles.emptySubtitle}>
                Go to Available Gyms tab to enroll in a gym
              </Text>
            </View>
          ) : (
            myAffiliations.map((affiliation) => {
              const gym = gyms.find(g => g.id === affiliation.gymId);
              const config = STATUS_CONFIG[affiliation.status];

              return (
                <View key={affiliation.id} style={[
                  styles.card,
                  affiliation.status === 'APPROVED' && styles.cardApproved,
                  affiliation.status === 'PENDING' && styles.cardPending,
                  affiliation.status === 'REJECTED' && styles.cardRejected,
                ]}>
                  {/* Status Badge */}
                  <View style={[styles.statusHeader, { backgroundColor: config.bg }]}>
                    <Text style={[styles.statusLabel, { color: config.text }]}>
                      {config.label}
                    </Text>
                  </View>

                  <View style={styles.cardHeader}>
                    <View style={styles.gymIconContainer}>
                      <Text style={styles.gymIcon}>🏋️</Text>
                    </View>
                    <View style={styles.gymInfo}>
                      <Text style={styles.gymName}>{gym?.name || affiliation.gymId}</Text>
                      <View style={styles.locationRow}>
                        <Text style={styles.locationIcon}>📍</Text>
                        <Text style={styles.locationText}>{gym?.location || 'Unknown location'}</Text>
                      </View>
                    </View>
                  </View>

                  {gym?.description && (
                    <Text style={styles.description}>{gym.description}</Text>
                  )}

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{gym?.memberCount || '-'}</Text>
                      <Text style={styles.statLabel}>Members</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{gym?.coachCount || '-'}</Text>
                      <Text style={styles.statLabel}>Coaches</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{gym?.phone || '-'}</Text>
                      <Text style={styles.statLabel}>Contact</Text>
                    </View>
                  </View>

                  {/* Unenroll Button */}
                  <TouchableOpacity
                    style={[
                      styles.unenrollButton,
                      affiliation.status === 'REJECTED' && styles.removeButton,
                      affiliation.status === 'PENDING' && styles.cancelButton,
                    ]}
                    onPress={() => handleUnenroll(affiliation)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.unenrollButtonText,
                      affiliation.status === 'REJECTED' && styles.removeButtonText,
                      affiliation.status === 'PENDING' && styles.cancelButtonText,
                    ]}>
                      {affiliation.status === 'REJECTED'
                        ? '🗑 Remove'
                        : affiliation.status === 'PENDING'
                        ? '✕ Cancel Request'
                        : 'Unenroll'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
          <View style={{ height: 20 }} />
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
    backgroundColor: '#FFFFFF', borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    overflow: 'hidden',
  },
  cardApproved: { borderWidth: 1.5, borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
  cardPending: { borderWidth: 1.5, borderColor: '#FDE68A', backgroundColor: '#FFFBEB' },
  cardRejected: { borderWidth: 1.5, borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },
  statusHeader: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  statusLabel: { fontSize: 13, fontWeight: '600' },
  ribbon: {
    position: 'absolute', top: 12, right: -8,
    paddingHorizontal: 14, paddingVertical: 4, borderRadius: 4, zIndex: 1,
  },
  ribbonText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10, padding: 16, paddingBottom: 0,
  },
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
  description: {
    fontSize: 13, color: '#64748B', lineHeight: 19,
    marginBottom: 12, paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 10,
    padding: 12, marginBottom: 14, marginHorizontal: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: '#E2E8F0' },
  enrollButton: {
    backgroundColor: '#2563EB', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
    marginHorizontal: 16, marginBottom: 16,
  },
  enrollButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  enrollButtonTextStatus: { fontWeight: '600', fontSize: 14 },
  unenrollButton: {
    borderRadius: 10, paddingVertical: 12,
    alignItems: 'center', marginHorizontal: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#FCA5A5', backgroundColor: '#FFF5F5',
  },
  unenrollButtonText: { color: '#DC2626', fontWeight: '600', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 32 },

  removeButton: {
  borderRadius: 10, paddingVertical: 12,
  alignItems: 'center', marginHorizontal: 16, marginBottom: 16,
  borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
  },
  removeButtonText: { color: '#94A3B8', fontWeight: '600', fontSize: 14 },
  cancelButton: {
    borderRadius: 10, paddingVertical: 12,
    alignItems: 'center', marginHorizontal: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#FDE68A', backgroundColor: '#FFFBEB',
  },
  cancelButtonText: { color: '#CA8A04', fontWeight: '600', fontSize: 14 },
});