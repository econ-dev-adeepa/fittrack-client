import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { programsAPI } from '../../services/api';

interface Program {
    id: string;
    title: string;
    description?: string;
    schedule?: string;
    gymId: string;
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
    createdAt: string;

}

const STATUS_CONFIG = {
    DRAFT : {label : 'Draft' , bg: '#F1F5F9', text: '#64748B'},
    PENDING_APPROVAL : {label : 'Pending', bg: '#FEF9C3', text: '#CA8A04'},
    APPROVED: {label: 'Approved', bg: '#DCFCE7', text: '#16A34A'},
    REJECTED: { label: 'Rejected', bg: '#FEE2E2', text: '#DC2626' },

}


export default function CoachProgramsScreen() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading , setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting , setSubmitting] = useState(false);
    const [form, setForm] = useState ({
        title: '', description: '', gymId: '', schedule: '',
    })

    useEffect (() => {
        fetchPrograms();
    }, [])


    const fetchPrograms  = async () => {
        try{
            setLoading(true);
            const res =  await programsAPI.getMyPrograms();
            setPrograms(res.data);

        }catch(err){
            Alert.alert('Error', 'Failed to load programs');
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async  () => {
        if(!form.title || !form.gymId){
            Alert.alert('Validation Error', 'Title and Gym ID are required');
            return;
        }
        try{
            setSubmitting(true);
            await programsAPI.create(form);
            setModalVisible(false);
            setForm({title: '', description: '', gymId: '', schedule: ''});
            fetchPrograms();

        }catch(err){
            Alert.alert('Error', 'Failed to create program')
        }finally {
            setSubmitting(false);
        }

    }

    const handleSubmitForApproval = async(id: string) => {
        Alert.alert('Submit Program', 'Submit this program for admin approval?', [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Submit', onPress: async() => {
                    try{
                        await programsAPI.submitForApproval(id);
                        fetchPrograms();

                    }catch(err){
                        Alert.alert('Error', 'Failed to submit for approval');
                    }
                }
            }
        ])
    };


    // const handleSubmitForApproval = async (id: string) => {
    //   const confirmed = window.confirm('Submit this program for admin approval?');
    //   if (!confirmed) return;

    //   try {
    //     await programsAPI.submitForApproval(id);
    //     fetchPrograms();
    //     window.alert('Program submitted for approval successfully!');
    //   } catch (err) {
    //     window.alert('Failed to submit program for approval');
    //   }
    // };

    if(loading) {
        return (
            <View style = {styles.centered}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
    <View style={styles.container}>
      {/* Programs List */}
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
                <View style={styles.cardFooter}>
                  <Text style={styles.cardDate}>
                    {new Date(program.createdAt).toLocaleDateString()}
                  </Text>
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
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Program Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Program</Text>

            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Morning HIIT"
              value={form.title}
              onChangeText={(t) => setForm({ ...form, title: t })}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Describe the program..."
              value={form.description}
              onChangeText={(t) => setForm({ ...form, description: t })}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Gym ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your gym ID"
              value={form.gymId}
              onChangeText={(t) => setForm({ ...form, gymId: t })}
            />

            <Text style={styles.label}>Schedule</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mon/Wed/Fri 6:00 AM"
              value={form.schedule}
              onChangeText={(t) => setForm({ ...form, schedule: t })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
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
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cardDate: { fontSize: 12, color: '#94A3B8' },
  submitButton: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 6,
  },
  submitButtonText: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#64748B' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: '#1E293B', backgroundColor: '#F8FAFC', marginBottom: 14,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
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