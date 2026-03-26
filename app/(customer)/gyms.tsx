import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
  Alert,
} from 'react-native';
import { gymsAPI } from '../../services/api';

interface Gym {
  id: string;
  name: string;
  location: string;
  description?: string;
  phone?: string;
  memberCount?: number;
  coachCount?: number;
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

type EnrollStatus = 'idle' | 'pending' | 'loading';

export default function CustomerGymsScreen() {
  const [enrollStatus, setEnrollStatus] = useState<Record<string, EnrollStatus>>({});
  const [search, setSearch] = useState('');

  const handleEnroll = (gym: Gym) => {
    if (enrollStatus[gym.id] === 'pending') {
      Alert.alert('Already Requested', `You already have a pending request for ${gym.name}`);
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
            setEnrollStatus(prev => ({ ...prev, [gym.id]: 'loading' }));
            try {
              await gymsAPI.enroll(gym.id);
              setEnrollStatus(prev => ({ ...prev, [gym.id]: 'pending' }));
              Alert.alert('Request Sent! ✅', `Enrollment request sent to ${gym.name}!\n\nWaiting for gym admin approval.`);
            } catch (err: any) {
              const status = err?.response?.status;
              let msg = 'Failed to send enrollment request.';
              if (status === 409) {
                msg = `You already have a pending request for ${gym.name}.`;
                setEnrollStatus(prev => ({ ...prev, [gym.id]: 'pending' }));
              } else if (status === 401) {
                msg = 'Your session has expired. Please log in again.';
              } else {
                setEnrollStatus(prev => ({ ...prev, [gym.id]: 'idle' }));
              }
              Alert.alert('Error', msg);
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

  return (
    <View style={styles.container}>
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

      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          You can enroll in multiple gyms. Each enrollment requires gym admin approval.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filteredGyms.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyTitle}>No gyms found</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        ) : (
          filteredGyms.map((gym) => {
            const status = enrollStatus[gym.id] || 'idle';
            const isPending = status === 'pending';
            const isLoading = status === 'loading';

            return (
              <View key={gym.id} style={[styles.card, isPending && styles.cardEnrolled]}>
                {isPending && (
                  <View style={styles.ribbon}>
                    <Text style={styles.ribbonText}>Request Sent</Text>
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
                    isPending && styles.enrollButtonPending,
                  ]}
                  onPress={() => handleEnroll(gym)}
                  disabled={isPending || isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : isPending ? (
                    <View style={styles.enrollButtonInner}>
                      <Text style={styles.enrollButtonTextPending}>⏳ Awaiting Approval</Text>
                    </View>
                  ) : (
                    <View style={styles.enrollButtonInner}>
                      <Text style={styles.enrollButtonText}>Enroll Now →</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
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
  cardEnrolled: {
    borderWidth: 1.5, borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  ribbon: {
    position: 'absolute', top: 12, right: -8,
    backgroundColor: '#16A34A', paddingHorizontal: 14,
    paddingVertical: 4, borderRadius: 4,
  },
  ribbonText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
  },
  gymIconContainer: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: '#EFF6FF', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  gymIcon: { fontSize: 24 },
  gymInfo: { flex: 1 },
  gymName: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 3,
  },
  locationIcon: { fontSize: 12 },
  locationText: { fontSize: 13, color: '#64748B' },
  description: {
    fontSize: 13, color: '#64748B', lineHeight: 19, marginBottom: 12,
  },
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
  enrollButtonPending: {
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#86EFAC',
  },
  enrollButtonInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  enrollButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  enrollButtonTextPending: { color: '#16A34A', fontWeight: '600', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#64748B' },
});