import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import { programsAPI } from '../../services/api';
import useGymStore from '../../stores/useGymStore';

interface Program {
  id: string;
  title: string;
  description?: string;
  coachId: string;
  gymId: string;
  status: string;
  schedule?: string;
  totalSlots?: number;
  createdAt: string;
}

interface ConflictResult {
  hasConflict: boolean;
  warnings: string[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM',
  '11:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM',
];
const SLOTS_OPTIONS = [5, 10, 15, 20, 25, 30];

export default function AdminProgramsScreen() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchedGymId, setSearchedGymId] = useState('');
  const [conflicts, setConflicts] = useState<Record<string, ConflictResult>>({});
  const [checkingConflict, setCheckingConflict] = useState<string | null>(null);

  // Proposal modal state
  const [proposalModalVisible, setProposalModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [proposalForm, setProposalForm] = useState({
    rejectionReason: '',
    proposedDays: [] as string[],
    proposedTime: '',
    proposedSlots: 10,
  });
  const [submittingProposal, setSubmittingProposal] = useState(false);

  const selectedGym = useGymStore((state) => state.selectedGym);

  const fetchPrograms = async (gymId: string) => {
    setLoading(true);
    programsAPI.getPendingByGym(gymId)
      .then((res) => {
        setPrograms(res.data);
        setSearchedGymId(gymId);
        setConflicts({});
      })
      .catch(() => Alert.alert('Error', 'Failed to load programs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedGym) fetchPrograms(selectedGym.id);
  }, [selectedGym]);

  const handleCheckConflicts = async (program: Program) => {
    setCheckingConflict(program.id);
    try {
      const res = await programsAPI.checkConflicts(program.id);
      setConflicts(prev => ({ ...prev, [program.id]: res.data }));
    } catch (err) {
      Alert.alert('Error', 'Failed to check conflicts');
    } finally {
      setCheckingConflict(null);
    }
  };

  const handleApprove = (program: Program) => {
    const conflict = conflicts[program.id];

    // If conflicts not checked yet, check first
    if (!conflict) {
      Alert.alert(
        'Check Conflicts First',
        'Please check for conflicts before approving.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Check Now',
            onPress: () => handleCheckConflicts(program),
          }
        ]
      );
      return;
    }

    // If has conflicts, warn admin
    if (conflict.hasConflict) {
      Alert.alert(
        '⚠️ Conflicts Detected',
        'This program has conflicts. Are you sure you want to approve anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Approve Anyway',
            style: 'destructive',
            onPress: () => confirmApprove(program.id),
          }
        ]
      );
      return;
    }

    // No conflicts — approve directly
    Alert.alert(
      'Approve Program',
      `Approve "${program.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => confirmApprove(program.id),
        }
      ]
    );
  };

  const confirmApprove = async (id: string) => {
    try {
      await programsAPI.updateStatus(id, 'APPROVED');
      await fetchPrograms(selectedGym!.id);
      Alert.alert('Success ✅', 'Program approved successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to approve program');
    }
  };

  const handleReject = (program: Program) => {
    Alert.alert(
      'Reject Program',
      'How would you like to reject this program?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject Only',
          style: 'destructive',
          onPress: () => confirmReject(program.id),
        },
        {
          text: 'Reject with Proposal',
          onPress: () => openProposalModal(program),
        }
      ]
    );
  };

  const confirmReject = async (id: string) => {
    try {
      await programsAPI.updateStatus(id, 'REJECTED');
      await fetchPrograms(selectedGym!.id);
      Alert.alert('Done', 'Program rejected.');
    } catch (err) {
      Alert.alert('Error', 'Failed to reject program');
    }
  };

  const openProposalModal = (program: Program) => {
    setSelectedProgram(program);
    setProposalForm({
      rejectionReason: '',
      proposedDays: [],
      proposedTime: '',
      proposedSlots: 10,
    });
    setProposalModalVisible(true);
  };

  const toggleProposalDay = (day: string) => {
    setProposalForm(prev => ({
      ...prev,
      proposedDays: prev.proposedDays.includes(day)
        ? prev.proposedDays.filter(d => d !== day)
        : [...prev.proposedDays, day],
    }));
  };

  const handleSubmitProposal = async () => {
    if (!proposalForm.rejectionReason.trim()) {
      Alert.alert('Validation', 'Please provide a reason for rejection');
      return;
    }
    if (proposalForm.proposedDays.length === 0) {
      Alert.alert('Validation', 'Please select proposed days');
      return;
    }
    if (!proposalForm.proposedTime) {
      Alert.alert('Validation', 'Please select a proposed time');
      return;
    }

    setSubmittingProposal(true);
    try {
      await programsAPI.rejectWithProposal(selectedProgram!.id, {
        rejectionReason: proposalForm.rejectionReason,
        proposedDays: proposalForm.proposedDays.join(','),
        proposedTime: proposalForm.proposedTime,
        proposedSlots: proposalForm.proposedSlots,
      });
      setProposalModalVisible(false);
      await fetchPrograms(selectedGym!.id);
      Alert.alert('Done ✅', 'Rejection with proposal sent to coach.');
    } catch (err) {
      Alert.alert('Error', 'Failed to send proposal');
    } finally {
      setSubmittingProposal(false);
    }
  };

  return (
    <View style={styles.container}>
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
                {searchedGymId ? 'No programs pending approval' : 'Select a gym to view programs'}
              </Text>
            </View>
          ) : (
            programs.map((program) => {
              const conflict = conflicts[program.id];
              const isCheckingThis = checkingConflict === program.id;

              return (
                <View key={program.id} style={styles.card}>
                  {/* Card Header */}
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

                  {program.totalSlots && (
                    <Text style={styles.slotsText}>👥 {program.totalSlots} slots</Text>
                  )}

                  <View style={styles.cardMeta}>
                    <Text style={styles.metaText}>
                      Coach: {program.coachId.slice(0, 16)}...
                    </Text>
                    <Text style={styles.metaText}>
                      📅 {new Date(program.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  {/* Conflict Check Button */}
                  {!conflict && (
                    <TouchableOpacity
                      style={styles.checkConflictButton}
                      onPress={() => handleCheckConflicts(program)}
                      disabled={isCheckingThis}
                    >
                      {isCheckingThis ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                      ) : (
                        <Text style={styles.checkConflictText}>🔍 Check for Conflicts</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* Conflict Results */}
                  {conflict && (
                    <View style={[
                      styles.conflictBox,
                      conflict.hasConflict ? styles.conflictBoxWarning : styles.conflictBoxClear,
                    ]}>
                      {conflict.hasConflict ? (
                        <>
                          <Text style={styles.conflictTitle}>⚠️ Conflicts Detected</Text>
                          {conflict.warnings.map((w, i) => (
                            <Text key={i} style={styles.conflictWarning}>• {w}</Text>
                          ))}
                        </>
                      ) : (
                        <Text style={styles.conflictClear}>✅ No conflicts — safe to approve</Text>
                      )}
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleReject(program)}
                    >
                      <Text style={styles.rejectButtonText}>✕ Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.approveButton,
                        conflict?.hasConflict && styles.approveButtonWarning,
                      ]}
                      onPress={() => handleApprove(program)}
                    >
                      <Text style={styles.approveButtonText}>
                        {conflict?.hasConflict ? '⚠️ Approve' : '✓ Approve'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Reject with Proposal Modal */}
      <Modal visible={proposalModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <Text style={styles.modalTitle}>Reject with Proposal</Text>
              <Text style={styles.modalSubtitle}>
                Suggest alternative schedule for "{selectedProgram?.title}"
              </Text>

              {/* Rejection Reason */}
              <Text style={styles.label}>Reason for Rejection *</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="e.g. Time slot conflicts with existing program..."
                value={proposalForm.rejectionReason}
                onChangeText={(t) => setProposalForm(prev => ({ ...prev, rejectionReason: t }))}
                multiline
                numberOfLines={3}
              />

              {/* Proposed Days */}
              <Text style={styles.label}>Suggested Days *</Text>
              <View style={styles.daysContainer}>
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayPill,
                      proposalForm.proposedDays.includes(day) && styles.dayPillSelected,
                    ]}
                    onPress={() => toggleProposalDay(day)}
                  >
                    <Text style={[
                      styles.dayPillText,
                      proposalForm.proposedDays.includes(day) && styles.dayPillTextSelected,
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Proposed Time */}
              <Text style={styles.label}>Suggested Time *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
                {TIME_SLOTS.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timePill,
                      proposalForm.proposedTime === time && styles.timePillSelected,
                    ]}
                    onPress={() => setProposalForm(prev => ({ ...prev, proposedTime: time }))}
                  >
                    <Text style={[
                      styles.timePillText,
                      proposalForm.proposedTime === time && styles.timePillTextSelected,
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Proposed Slots */}
              <Text style={styles.label}>Suggested Slots</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
                {SLOTS_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.timePill,
                      proposalForm.proposedSlots === s && styles.timePillSelected,
                    ]}
                    onPress={() => setProposalForm(prev => ({ ...prev, proposedSlots: s }))}
                  >
                    <Text style={[
                      styles.timePillText,
                      proposalForm.proposedSlots === s && styles.timePillTextSelected,
                    ]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setProposalModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sendProposalButton}
                  onPress={handleSubmitProposal}
                  disabled={submittingProposal}
                >
                  {submittingProposal
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.sendProposalButtonText}>Send Proposal</Text>
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
  scheduleText: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  slotsText: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  cardMeta: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
  },
  metaText: { fontSize: 12, color: '#94A3B8' },
  checkConflictButton: {
    borderWidth: 1, borderColor: '#2563EB', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center', marginBottom: 10,
    backgroundColor: '#EFF6FF',
  },
  checkConflictText: { color: '#2563EB', fontWeight: '600', fontSize: 13 },
  conflictBox: {
    borderRadius: 8, padding: 12, marginBottom: 10,
  },
  conflictBoxWarning: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA' },
  conflictBoxClear: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#86EFAC' },
  conflictTitle: { fontSize: 13, fontWeight: '700', color: '#EA580C', marginBottom: 6 },
  conflictWarning: { fontSize: 12, color: '#9A3412', marginBottom: 4, lineHeight: 18 },
  conflictClear: { fontSize: 13, fontWeight: '600', color: '#16A34A' },
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
  approveButtonWarning: { backgroundColor: '#EA580C' },
  approveButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, maxHeight: '90%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: '#1E293B', backgroundColor: '#F8FAFC', marginBottom: 14,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
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
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 8 },
  cancelButton: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
  },
  cancelButtonText: { color: '#64748B', fontWeight: '600' },
  sendProposalButton: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    backgroundColor: '#2563EB', alignItems: 'center',
  },
  sendProposalButtonText: { color: '#FFFFFF', fontWeight: '600' },
});