import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Modal, TextInput,
} from 'react-native';
import { trainingPlansAPI } from '../../services/api';
import { useLocalSearchParams } from 'expo-router';

interface TrainingPlan {
  id: string;
  programId: string;
  name: string;
  description?: string;
  sessionsPerWeek?: number;
  sessionDuration?: number;
  totalSlots?: number;
  difficulty?: string;
  programDuration?: number;
  createdAt: string;
}

const DIFFICULTY_OPTIONS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const SESSIONS_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const DURATION_OPTIONS = [30, 45, 60, 90, 120];
const SLOTS_OPTIONS = [5, 10, 15, 20, 25, 30];
const PROGRAM_WEEKS = [4, 8, 12, 16, 24];

const DIFFICULTY_CONFIG = {
  BEGINNER: { color: '#16A34A', bg: '#DCFCE7', icon: '🟢' },
  INTERMEDIATE: { color: '#CA8A04', bg: '#FEF9C3', icon: '🟡' },
  ADVANCED: { color: '#DC2626', bg: '#FEE2E2', icon: '🔴' },
};

export default function TrainingPlansScreen() {
  const { programId, programTitle } = useLocalSearchParams<{
    programId: string;
    programTitle: string;
  }>();

  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    sessionsPerWeek: 3,
    sessionDuration: 60,
    totalSlots: 10,
    difficulty: 'BEGINNER',
    programDuration: 8,
  });

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await trainingPlansAPI.getByProgram(programId);
      setPlans(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load training plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name) {
      Alert.alert('Validation', 'Plan name is required');
      return;
    }
    try {
      setSubmitting(true);
      await trainingPlansAPI.create({ ...form, programId });
      setModalVisible(false);
      resetForm();
      fetchPlans();
    } catch (err) {
      Alert.alert('Error', 'Failed to create training plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = (plan: TrainingPlan) => {
    Alert.alert(
      'Remove Plan',
      `Remove "${plan.name}" from this program?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await trainingPlansAPI.remove(plan.id);
              fetchPlans();
            } catch (err) {
              Alert.alert('Error', 'Failed to remove training plan');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      sessionsPerWeek: 3,
      sessionDuration: 60,
      totalSlots: 10,
      difficulty: 'BEGINNER',
      programDuration: 8,
    });
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Training Plans</Text>
        <Text style={styles.headerSubtitle}>{programTitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {plans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No training plans yet</Text>
            <Text style={styles.emptySubtitle}>Add training plans to this program</Text>
          </View>
        ) : (
          plans.map((plan) => {
            const diff = plan.difficulty
              ? DIFFICULTY_CONFIG[plan.difficulty as keyof typeof DIFFICULTY_CONFIG]
              : null;
            return (
              <View key={plan.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {diff && (
                    <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
                      <Text style={[styles.diffBadgeText, { color: diff.color }]}>
                        {diff.icon} {plan.difficulty}
                      </Text>
                    </View>
                  )}
                </View>

                {plan.description && (
                  <Text style={styles.planDescription}>{plan.description}</Text>
                )}

                <View style={styles.statsRow}>
                  {plan.sessionsPerWeek && (
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{plan.sessionsPerWeek}x</Text>
                      <Text style={styles.statLabel}>Per week</Text>
                    </View>
                  )}
                  {plan.sessionDuration && (
                    <>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{plan.sessionDuration}m</Text>
                        <Text style={styles.statLabel}>Duration</Text>
                      </View>
                    </>
                  )}
                  {plan.totalSlots && (
                    <>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{plan.totalSlots}</Text>
                        <Text style={styles.statLabel}>Slots</Text>
                      </View>
                    </>
                  )}
                  {plan.programDuration && (
                    <>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{plan.programDuration}w</Text>
                        <Text style={styles.statLabel}>Weeks</Text>
                      </View>
                    </>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemove(plan)}
                >
                  <Text style={styles.removeButtonText}>✕ Remove Plan</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Plan Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <Text style={styles.modalTitle}>Add Training Plan</Text>

              <Text style={styles.label}>Plan Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Week 1-4 Foundation"
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Describe this plan phase..."
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                multiline
                numberOfLines={3}
              />

              {/* Sessions per week */}
              <Text style={styles.label}>Sessions per Week</Text>
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
              </ScrollView>

              {/* Session Duration */}
              <Text style={styles.label}>Session Duration (mins)</Text>
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
              </ScrollView>

              {/* Total Slots */}
              <Text style={styles.label}>Available Slots</Text>
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
              </ScrollView>

              {/* Program Duration */}
              <Text style={styles.label}>Plan Duration (weeks)</Text>
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
              </ScrollView>

              {/* Difficulty */}
              <Text style={styles.label}>Difficulty Level</Text>
              <View style={styles.difficultyContainer}>
                {DIFFICULTY_OPTIONS.map((d) => {
                  const config = DIFFICULTY_CONFIG[d as keyof typeof DIFFICULTY_CONFIG];
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.difficultyOption,
                        { borderColor: config.color },
                        form.difficulty === d && { backgroundColor: config.bg },
                      ]}
                      onPress={() => setForm({ ...form, difficulty: d })}
                    >
                      <Text style={[styles.difficultyOptionText, { color: config.color }]}>
                        {config.icon} {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

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
                    : <Text style={styles.createButtonText}>Add Plan</Text>
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
  header: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  list: { padding: 16, paddingBottom: 96, gap: 12 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  planName: { fontSize: 16, fontWeight: '600', color: '#1E293B', flex: 1 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  diffBadgeText: { fontSize: 11, fontWeight: '600' },
  planDescription: { fontSize: 13, color: '#64748B', marginBottom: 12 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 10,
    padding: 12, marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: '#E2E8F0' },
  removeButton: {
    borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center', backgroundColor: '#FFF5F5',
  },
  removeButtonText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#64748B' },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  fabText: { color: '#FFFFFF', fontSize: 30, lineHeight: 32, fontWeight: '400' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, maxHeight: '90%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: '#1E293B', backgroundColor: '#F8FAFC', marginBottom: 14,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  optionScroll: { marginBottom: 14 },
  optionPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
    marginRight: 8, minWidth: 50, alignItems: 'center',
  },
  optionPillSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  optionPillText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  optionPillTextSelected: { color: '#FFFFFF' },
  difficultyContainer: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  difficultyOption: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, alignItems: 'center', backgroundColor: '#F8FAFC',
  },
  difficultyOptionText: { fontSize: 11, fontWeight: '500' },
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
});