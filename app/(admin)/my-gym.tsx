import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity, TextInput, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { gymsAPI } from '../../services/api';
import useGymStore, { Gym } from '../../stores/useGymStore';

interface DashboardProgram {
  title: string;
  schedule: string;
  slots: number;
  coachId: string;
}

interface Dashboard {
  gym: {
    id: string;
    name: string;
    capacity: number;
    operationalDays: string;
    openTime: string;
    closeTime: string;
  };
  stats: {
    totalCapacity: number;
    usedSlots: number;
    availableSlots: number;
    approvedPrograms: number;
    pendingPrograms: number;
    approvedCoaches: number;
    approvedCustomers: number;
    pendingCoaches: number;
    pendingCustomers: number;
  };
  scheduleByDay: Record<string, DashboardProgram[]>;
}

const DAYS_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AdminMyGymScreen() {
  const router = useRouter();
  const gyms = useGymStore((state) => state.gyms);
  const selectedGym = useGymStore((state) => state.selectedGym);
  const setSelectedGym = useGymStore((state) => state.setSelectedGym);
  const setActiveGymName = useGymStore((state) => state.setActiveGymName);

  const [view, setView] = useState<'list' | 'dashboard'>('list');
  const [activeGym, setActiveGym] = useState<Gym | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const fetchDashboard = async (gym: Gym) => {
    setDashboardLoading(true);
    try {
      const res = await gymsAPI.getDashboard(gym.id);
      setDashboard(res.data);
    } catch (err) {
      console.log('Failed to load dashboard');
    } finally {
      setDashboardLoading(false);
      setRefreshing(false);
    }
  };

  // Reset to list view when tab focused
  useFocusEffect(
    useCallback(() => {
      setView('list');
      setActiveGymName(null);
    }, [])
  );

  const handleSelectGym = (gym: Gym) => {
    setActiveGym(gym);
    setSelectedGym(gym);
    setActiveGymName(gym.name);
    setView('dashboard');
    fetchDashboard(gym);
  };

  const handleBack = () => {
    setView('list');
    setActiveGym(null);
    setDashboard(null);
    setActiveGymName(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (activeGym) fetchDashboard(activeGym);
  };

  const filteredGyms = (gyms || []).filter(gym =>
    gym.name.toLowerCase().includes(search.toLowerCase()) ||
    gym.location.toLowerCase().includes(search.toLowerCase())
  );

  // ─── GYM LIST VIEW ───
  if (view === 'list') {
    return (
      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search gyms..."
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

        <ScrollView contentContainerStyle={styles.listContent}>
          {filteredGyms.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={styles.emptyTitle}>
                {search ? 'No gyms found' : 'No gyms registered yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {search ? 'Try a different search' : 'Tap + to register your first gym'}
              </Text>
            </View>
          ) : (
            filteredGyms.map((gym) => {
              const isActive = selectedGym?.id === gym.id;
              return (
                <TouchableOpacity
                  key={gym.id}
                  style={[styles.gymCard, isActive && styles.gymCardActive]}
                  onPress={() => handleSelectGym(gym)}
                  activeOpacity={0.8}
                >
                  <View style={styles.gymCardLeft}>
                    <View style={[styles.gymIconBox, isActive && styles.gymIconBoxActive]}>
                      <Text style={styles.gymIconText}>🏋️</Text>
                    </View>
                    <View style={styles.gymCardInfo}>
                      <View style={styles.gymCardNameRow}>
                        <Text style={styles.gymCardName}>{gym.name}</Text>
                        {isActive && (
                          <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>Active</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.gymCardLocation}>📍 {gym.location}</Text>
                      {gym.operationalDays && (
                        <Text style={styles.gymCardMeta}>📅 {gym.operationalDays}</Text>
                      )}
                      {gym.openTime && gym.closeTime && (
                        <Text style={styles.gymCardMeta}>
                          🕐 {gym.openTime} - {gym.closeTime}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 80 }} />
        </ScrollView>

        {/* FAB — Register new gym */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(admin)/settings/register-gym')}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  // ─── DASHBOARD VIEW ───
  if (dashboardLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const stats = dashboard?.stats;
  const scheduleByDay = dashboard?.scheduleByDay || {};
  const capacityPercent = stats
    ? stats.totalCapacity > 0
      ? Math.round((stats.usedSlots / stats.totalCapacity) * 100)
      : 0
    : 0;

  return (
  <View style={styles.container}>
    {/* Animated sticky header — appears on scroll */}
    <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
      <TouchableOpacity style={styles.stickyBackButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={18} color="#2563EB" />
      </TouchableOpacity>
      <Text style={styles.stickyHeaderTitle}>{activeGym?.name}</Text>
    </Animated.View>

    <Animated.ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
      }
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={18} color="#2563EB" />
        <Text style={styles.backButtonText}>All Gyms</Text>
      </TouchableOpacity>

      {/* Gym Header */}
      <View style={styles.gymHeader}>
        <Text style={styles.gymName}>{activeGym?.name}</Text>
        <Text style={styles.gymLocation}>📍 {activeGym?.location}</Text>
        {activeGym?.description && (
          <Text style={styles.gymDescription}>{activeGym.description}</Text>
        )}
        <View style={styles.gymMeta}>
          {activeGym?.operationalDays && (
            <Text style={styles.gymMetaText}>📅 {activeGym.operationalDays}</Text>
          )}
          {activeGym?.openTime && activeGym?.closeTime && (
            <Text style={styles.gymMetaText}>
              🕐 {activeGym.openTime} - {activeGym.closeTime}
            </Text>
          )}
          {activeGym?.phone && (
            <Text style={styles.gymMetaText}>📞 {activeGym.phone}</Text>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(admin)/customers')}
        >
          <Ionicons name="people-outline" size={20} color="#2563EB" />
          <Text style={styles.actionButtonText}>Customers</Text>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(admin)/coaches')}
        >
          <Ionicons name="person-outline" size={20} color="#2563EB" />
          <Text style={styles.actionButtonText}>Coaches</Text>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {stats && (
        <>
          {/* Capacity Bar */}
          <View style={styles.card}>
            <View style={styles.capacityHeader}>
              <Text style={styles.cardTitle}>Capacity Usage</Text>
              <Text style={[
                styles.capacityPercent,
                capacityPercent > 80 && { color: '#F59E0B' },
                capacityPercent >= 100 && { color: '#DC2626' },
              ]}>
                {capacityPercent}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[
                styles.progressBarFill,
                { width: `${Math.min(capacityPercent, 100)}%` },
                capacityPercent > 80 && styles.progressBarWarning,
                capacityPercent >= 100 && styles.progressBarFull,
              ]} />
            </View>
            <View style={styles.capacityRow}>
              <Text style={styles.capacityLabel}>
                Used: <Text style={styles.capacityValue}>{stats.usedSlots}</Text>
              </Text>
              <Text style={styles.capacityLabel}>
                Available:{' '}
                <Text style={[
                  styles.capacityValue,
                  { color: stats.availableSlots > 0 ? '#16A34A' : '#DC2626' },
                ]}>
                  {stats.availableSlots}
                </Text>
              </Text>
              <Text style={styles.capacityLabel}>
                Total: <Text style={styles.capacityValue}>{stats.totalCapacity}</Text>
              </Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.statNumber}>{stats.approvedPrograms}</Text>
              <Text style={styles.statLabel}>Programs</Text>
              {stats.pendingPrograms > 0 && (
                <View style={styles.pendingPill}>
                  <Text style={styles.pendingPillText}>{stats.pendingPrograms} pending</Text>
                </View>
              )}
            </View>
            <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
              <Text style={styles.statNumber}>{stats.approvedCoaches}</Text>
              <Text style={styles.statLabel}>Coaches</Text>
              {stats.pendingCoaches > 0 && (
                <View style={styles.pendingPill}>
                  <Text style={styles.pendingPillText}>{stats.pendingCoaches} pending</Text>
                </View>
              )}
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FFF7ED' }]}>
              <Text style={styles.statNumber}>{stats.approvedCustomers}</Text>
              <Text style={styles.statLabel}>Customers</Text>
              {stats.pendingCustomers > 0 && (
                <View style={styles.pendingPill}>
                  <Text style={styles.pendingPillText}>{stats.pendingCustomers} pending</Text>
                </View>
              )}
            </View>
          </View>

          {/* Weekly Schedule */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Schedule</Text>
            {Object.keys(scheduleByDay).length === 0 ? (
              <View style={styles.emptySchedule}>
                <Text style={styles.emptyScheduleText}>No approved programs yet</Text>
              </View>
            ) : (
              DAYS_ORDER
                .filter(day => scheduleByDay[day])
                .map(day => (
                  <View key={day} style={styles.daySection}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayName}>{day}</Text>
                      <Text style={styles.dayCount}>
                        {scheduleByDay[day].length} program{scheduleByDay[day].length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    {scheduleByDay[day].map((prog, idx) => (
                      <View key={idx} style={styles.programRow}>
                        <View style={styles.programTimeBox}>
                          <Text style={styles.programTime}>{prog.schedule}</Text>
                        </View>
                        <View style={styles.programInfo}>
                          <Text style={styles.programTitle}>{prog.title}</Text>
                          <Text style={styles.programSlots}>👥 {prog.slots} slots</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))
            )}
          </View>
        </>
      )}

      <View style={{ height: 20 }} />
    </Animated.ScrollView>
  </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, gap: 14 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // List view
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
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  clearIcon: { fontSize: 14, color: '#94A3B8', paddingHorizontal: 4 },
  listContent: { padding: 16, gap: 12 },
  gymCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  gymCardActive: {
    borderColor: '#93C5FD', backgroundColor: '#EFF6FF',
  },
  gymCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  gymIconBox: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center',
  },
  gymIconBoxActive: { backgroundColor: '#DBEAFE' },
  gymIconText: { fontSize: 22 },
  gymCardInfo: { flex: 1 },
  gymCardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  gymCardName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  activeBadge: {
    backgroundColor: '#2563EB', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 10,
  },
  activeBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  gymCardLocation: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  gymCardMeta: { fontSize: 12, color: '#94A3B8' },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#64748B' },
  // Dashboard view
  backButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, marginBottom: 4,
  },
  backButtonText: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
  gymHeader: { backgroundColor: '#2563EB', borderRadius: 16, padding: 20 },
  gymName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  gymLocation: { fontSize: 13, color: '#BFDBFE', marginBottom: 8 },
  gymDescription: { fontSize: 13, color: '#BFDBFE', marginBottom: 8, lineHeight: 18 },
  gymMeta: { gap: 4 },
  gymMetaText: { fontSize: 13, color: '#BFDBFE' },
  actionsRow: { gap: 10 },
  actionButton: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionButtonText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  capacityHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  capacityPercent: { fontSize: 20, fontWeight: '800', color: '#2563EB' },
  progressBarBg: {
    height: 10, backgroundColor: '#E2E8F0',
    borderRadius: 5, overflow: 'hidden', marginBottom: 10,
  },
  progressBarFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 5 },
  progressBarWarning: { backgroundColor: '#F59E0B' },
  progressBarFull: { backgroundColor: '#DC2626' },
  capacityRow: { flexDirection: 'row', justifyContent: 'space-between' },
  capacityLabel: { fontSize: 12, color: '#94A3B8' },
  capacityValue: { fontWeight: '700', color: '#1E293B' },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '800', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 2 },
  pendingPill: {
    marginTop: 6, backgroundColor: '#FEF9C3',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  pendingPillText: { fontSize: 10, color: '#CA8A04', fontWeight: '600' },
  daySection: { marginBottom: 14 },
  dayHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  dayName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  dayCount: { fontSize: 12, color: '#94A3B8' },
  programRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 10,
    padding: 10, marginBottom: 6, gap: 10,
  },
  programTimeBox: {
    backgroundColor: '#EFF6FF', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  programTime: { fontSize: 12, fontWeight: '600', color: '#2563EB' },
  programInfo: { flex: 1 },
  programTitle: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  programSlots: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  emptySchedule: { alignItems: 'center', paddingVertical: 20 },
  emptyScheduleText: { fontSize: 14, color: '#94A3B8' },
  title: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  subtitle: { marginTop: 4, fontSize: 14, color: '#64748B' },

  stickyHeader: {
  position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
  backgroundColor: '#FFFFFF', height: 56,
  flexDirection: 'row', alignItems: 'center',
  paddingHorizontal: 16, gap: 12,
  borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08, shadowRadius: 4, elevation: 4,
},
stickyBackButton: { padding: 4 },
stickyHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
});