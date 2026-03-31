import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { programsAPI, affiliationsAPI } from '../../services/api';
import { router } from 'expo-router';

interface Program {
  id: string;
  title: string;
  description?: string;
  schedule?: string;
  gymId: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  // sessionsPerWeek?: number;
  // sessionDuration?: number;
  // totalSlots?: number;
  // difficulty?: string;
  // programDuration?: number;
}

interface CoachGym {
  id: string;
  gymId: string;
  status: string;
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', bg: '#F1F5F9', text: '#64748B' },
  PENDING_APPROVAL: { label: 'Pending', bg: '#FEF9C3', text: '#CA8A04' },
  APPROVED: { label: 'Approved', bg: '#DCFCE7', text: '#16A34A' },
  REJECTED: { label: 'Rejected', bg: '#FEE2E2', text: '#DC2626' },
};

const DIFFICULTY_OPTIONS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const SESSIONS_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const DURATION_OPTIONS = [30, 45, 60, 90, 120];
const SLOTS_OPTIONS = [5, 10, 15, 20, 25, 30];
const PROGRAM_WEEKS = [4, 8, 12, 16, 24];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM',
  '11:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];

export default function CoachProgramsScreen() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myGyms, setMyGyms] = useState<CoachGym[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    gymId: '',
    // sessionsPerWeek: 3,
    // sessionDuration: 60,
    // totalSlots: 10,
    // difficulty: 'BEGINNER',
    // programDuration: 8,
  });

  useEffect(() => {
    fetchPrograms();
    fetchMyGyms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await programsAPI.getMyPrograms();
      setPrograms(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGyms = async () => {
    try {
      const res = await affiliationsAPI.getMyAffiliations();
      const approvedGyms = res.data.filter(
        (a: CoachGym) => a.status === 'APPROVED'
      );
      setMyGyms(approvedGyms);
    } catch (err) {
      console.log('Failed to load gyms');
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleCreate = async () => {
    if (!form.title) {
      Alert.alert('Validation Error', 'Title is required');
      return;
    }
    if (!form.gymId) {
      Alert.alert('Validation Error', 'Please select a gym');
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one training day');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Validation Error', 'Please select a training time');
      return;
    }

    const schedule = `${selectedDays.join('/')} ${selectedTime}`;

    try {
      setSubmitting(true);
      await programsAPI.create({
        ...form,
        schedule,
      });
      setModalVisible(false);
      resetForm();
      fetchPrograms();
    } catch (err) {
      Alert.alert('Error', 'Failed to create program');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      gymId: '',
      // sessionsPerWeek: 3,
      // sessionDuration: 60,
      // totalSlots: 10,
      // difficulty: 'BEGINNER',
      // programDuration: 8,
    });
    setSelectedDays([]);
    setSelectedTime('');
  };

  const handleSubmitForApproval = async (id: string) => {
    Alert.alert('Submit Program', 'Submit this program for admin approval?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        onPress: async () => {
          try {
            await programsAPI.submitForApproval(id);
            fetchPrograms();
          } catch (err) {
            Alert.alert('Error', 'Failed to submit for approval');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {programs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No programs yet</Text>
            <Text style={styles.emptySubtitle}>Create your first fitness program</Text>
          </View>
        ) : (
          programs.map((program) => {
            const status = STATUS_CONFIG[program.status];
            return (
              <View key={program.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{program.title}</Text>
                  <View style={[styles.badge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.badgeText, { color: status.text }]}>{status.label}</Text>
                  </View>
                </View>

                {program.description && (
                  <Text style={styles.cardDescription}>{program.description}</Text>
                )}

                {program.schedule && (
                  <View style={styles.scheduleRow}>
                    <Text style={styles.scheduleIcon}>🗓</Text>
                    <Text style={styles.scheduleText}>{program.schedule}</Text>
                  </View>
                )}

                {/* Training Plan Details */}
                {/* {(program.sessionsPerWeek || program.totalSlots || program.difficulty) && (
                  <View style={styles.trainingPlanBox}>
                    <Text style={styles.trainingPlanTitle}>Training Plan</Text>
                    <View style={styles.trainingPlanGrid}>
                      {program.sessionsPerWeek && (
                        <View style={styles.trainingPlanItem}>
                          <Text style={styles.trainingPlanValue}>{program.sessionsPerWeek}x</Text>
                          <Text style={styles.trainingPlanLabel}>Per week</Text>
                        </View>
                      )}
                      {program.sessionDuration && (
                        <View style={styles.trainingPlanItem}>
                          <Text style={styles.trainingPlanValue}>{program.sessionDuration}m</Text>
                          <Text style={styles.trainingPlanLabel}>Per session</Text>
                        </View>
                      )}
                      {program.totalSlots && (
                        <View style={styles.trainingPlanItem}>
                          <Text style={styles.trainingPlanValue}>{program.totalSlots}</Text>
                          <Text style={styles.trainingPlanLabel}>Slots</Text>
                        </View>
                      )}
                      {program.programDuration && (
                        <View style={styles.trainingPlanItem}>
                          <Text style={styles.trainingPlanValue}>{program.programDuration}w</Text>
                          <Text style={styles.trainingPlanLabel}>Duration</Text>
                        </View>
                      )}
                    </View>
                    {program.difficulty && (
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>{program.difficulty}</Text>
                      </View>
                    )}
                  </View>
                )} */}

                <View style={styles.cardFooter}>
                <Text style={styles.cardDate}>
                  {new Date(program.createdAt).toLocaleDateString()}
                </Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.managePlansButton}
                    onPress={() => router.push({
                      pathname: '/(coach)/training-plans',
                      params: { programId: program.id, programTitle: program.title }
                    })}
                  >
                    <Text style={styles.managePlansButtonText}>📋 Plans</Text>
                  </TouchableOpacity>
                  {program.status === 'DRAFT' && (
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={() => handleSubmitForApproval(program.id)}
                    >
                      <Text style={styles.submitButtonText}>Submit for Approval</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Program Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <Text style={styles.modalTitle}>New Program</Text>

              {/* Title */}
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Morning HIIT"
                value={form.title}
                onChangeText={(t) => setForm({ ...form, title: t })}
              />

              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Describe the program..."
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                multiline
                numberOfLines={3}
              />

              {/* Gym Selector */}
              <Text style={styles.label}>Select Gym *</Text>
              {myGyms.length === 0 ? (
                <View style={styles.noGymsBox}>
                  <Text style={styles.noGymsText}>
                    ⚠️ You have no approved gym affiliations. Join a gym first from the Gyms tab.
                  </Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gymScroll}>
                  {myGyms.map((gym) => (
                    <TouchableOpacity
                      key={gym.id}
                      style={[
                        styles.gymChip,
                        form.gymId === gym.gymId && styles.gymChipSelected,
                      ]}
                      onPress={() => setForm({ ...form, gymId: gym.gymId })}
                    >
                      <Text style={[
                        styles.gymChipText,
                        form.gymId === gym.gymId && styles.gymChipTextSelected,
                      ]}>
                        🏋️ {gym.gymId.slice(0, 12)}...
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Training Days */}
              <Text style={styles.label}>Training Days *</Text>
              <View style={styles.daysContainer}>
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayPill, selectedDays.includes(day) && styles.dayPillSelected]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[styles.dayPillText, selectedDays.includes(day) && styles.dayPillTextSelected]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Training Time */}
              <Text style={styles.label}>Training Time *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
                {TIME_SLOTS.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timePill, selectedTime === time && styles.timePillSelected]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[styles.timePillText, selectedTime === time && styles.timePillTextSelected]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* ─── Training Plan Section ─── */}
              {/* <View style={styles.sectionDivider}>
                <Text style={styles.sectionDividerText}>Training Plan</Text>
              </View> */}

              {/* Sessions per week */}
              {/* <Text style={styles.label}>Sessions per Week</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
                {SESSIONS_OPTIONS.map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.optionPill, form.sessionsPerWeek === n && styles.optionPillSelected]}
                    onPress={() => setForm({ ...form, sessionsPerWeek: n })}
                  >
                    <Text style={[styles.optionPillText, form.sessionsPerWeek === n && styles.optionPillTextSelected]}>
                      {n}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView> */}

              {/* Session Duration */}
              {/* <Text style={styles.label}>Session Duration (mins)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
                {DURATION_OPTIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.optionPill, form.sessionDuration === d && styles.optionPillSelected]}
                    onPress={() => setForm({ ...form, sessionDuration: d })}
                  >
                    <Text style={[styles.optionPillText, form.sessionDuration === d && styles.optionPillTextSelected]}>
                      {d}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView> */}

              {/* Total Slots */}
              {/* <Text style={styles.label}>Available Slots</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
                {SLOTS_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.optionPill, form.totalSlots === s && styles.optionPillSelected]}
                    onPress={() => setForm({ ...form, totalSlots: s })}
                  >
                    <Text style={[styles.optionPillText, form.totalSlots === s && styles.optionPillTextSelected]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView> */}

              {/* Program Duration */}
              {/* <Text style={styles.label}>Program Duration (weeks)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
                {PROGRAM_WEEKS.map((w) => (
                  <TouchableOpacity
                    key={w}
                    style={[styles.optionPill, form.programDuration === w && styles.optionPillSelected]}
                    onPress={() => setForm({ ...form, programDuration: w })}
                  >
                    <Text style={[styles.optionPillText, form.programDuration === w && styles.optionPillTextSelected]}>
                      {w}w
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView> */}

              {/* Difficulty */}
              {/* <Text style={styles.label}>Difficulty Level</Text>
              <View style={styles.difficultyContainer}>
                {DIFFICULTY_OPTIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.difficultyOption,
                      form.difficulty === d && styles.difficultyOptionSelected,
                      d === 'BEGINNER' && { borderColor: '#16A34A' },
                      d === 'INTERMEDIATE' && { borderColor: '#CA8A04' },
                      d === 'ADVANCED' && { borderColor: '#DC2626' },
                    ]}
                    onPress={() => setForm({ ...form, difficulty: d })}
                  >
                    <Text style={[
                      styles.difficultyOptionText,
                      form.difficulty === d && { fontWeight: '700' },
                      d === 'BEGINNER' && { color: '#16A34A' },
                      d === 'INTERMEDIATE' && { color: '#CA8A04' },
                      d === 'ADVANCED' && { color: '#DC2626' },
                    ]}>
                      {d === 'BEGINNER' ? '🟢' : d === 'INTERMEDIATE' ? '🟡' : '🔴'} {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View> */}

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => { setModalVisible(false); resetForm(); }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreate}
                  disabled={submitting}
                >
                  {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.createButtonText}>Create</Text>
                  }
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 96, gap: 12 },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  fabText: { color: '#FFFFFF', fontSize: 30, lineHeight: 32, fontWeight: '400' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardDescription: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  scheduleIcon: { fontSize: 13, marginRight: 4 },
  scheduleText: { fontSize: 13, color: '#64748B' },
  trainingPlanBox: {
    backgroundColor: '#F8FAFC', borderRadius: 10,
    padding: 12, marginBottom: 8, marginTop: 4,
  },
  trainingPlanTitle: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase' },
  trainingPlanGrid: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  trainingPlanItem: { alignItems: 'center' },
  trainingPlanValue: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  trainingPlanLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  difficultyBadge: {
    alignSelf: 'flex-start', backgroundColor: '#EFF6FF',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  difficultyText: { fontSize: 11, fontWeight: '600', color: '#2563EB' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cardDate: { fontSize: 12, color: '#94A3B8' },
  submitButton: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  submitButtonText: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#64748B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, maxHeight: '92%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: '#1E293B', backgroundColor: '#F8FAFC', marginBottom: 14,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  noGymsBox: {
    backgroundColor: '#FEF9C3', borderRadius: 8, padding: 12, marginBottom: 14,
  },
  noGymsText: { fontSize: 13, color: '#92400E', lineHeight: 18 },
  gymScroll: { marginBottom: 14 },
  gymChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  gymChipSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  gymChipText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  gymChipTextSelected: { color: '#FFFFFF' },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  dayPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
  },
  dayPillSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  dayPillText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  dayPillTextSelected: { color: '#FFFFFF' },
  timeScroll: { marginBottom: 14 },
  timePill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', marginRight: 8,
  },
  timePillSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  timePillText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  timePillTextSelected: { color: '#FFFFFF' },
  sectionDivider: {
    borderTopWidth: 1, borderTopColor: '#E2E8F0',
    paddingTop: 16, marginBottom: 12, marginTop: 8,
  },
  sectionDividerText: {
    fontSize: 13, fontWeight: '700', color: '#64748B',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  optionScroll: { marginBottom: 14 },
  optionPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', marginRight: 8,
    minWidth: 50, alignItems: 'center',
  },
  optionPillSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  optionPillText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  optionPillTextSelected: { color: '#FFFFFF' },
  difficultyContainer: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  difficultyOption: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, alignItems: 'center', backgroundColor: '#F8FAFC',
  },
  difficultyOptionSelected: { backgroundColor: '#EFF6FF' },
  difficultyOptionText: { fontSize: 12, fontWeight: '500' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 8 },
  cancelButton: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
  },
  cancelButtonText: { color: '#64748B', fontWeight: '600' },
  createButton: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    backgroundColor: '#2563EB', alignItems: 'center',
  },
  createButtonText: { color: '#FFFFFF', fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  managePlansButton: {
    backgroundColor: '#F1F5F9', paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 6,
  },
  managePlansButtonText: { color: '#475569', fontSize: 12, fontWeight: '600' },
});