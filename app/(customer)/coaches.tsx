import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, TextInput, Modal,
} from 'react-native';
import { affiliationsAPI, ptAPI } from '../../services/api';


interface CoachAffiliation {
  id: string;
  userId: string;
  gymId: string;
  type: string;
  status: string;
  createdAt: string;
}


export default function CustomerCoachesScreen(){
    const [coaches, setCoaches] = useState<CoachAffiliation[]>([]);
    const [loading, setLoading] = useState(true);
    const [gymId, setGymId] = useState('');
    const [searchGymId, setSearchGymId] = useState('');
    const [selectedCoach, setSelectedCoach] = useState<CoachAffiliation | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [requesting, setRequesting] = useState(false);


    const fetchCoaches = async(id: string) => {
        if(!id.trim()){
            Alert.alert('Error', 'Please enter a valid Gym ID');
            return;
        }

        try{
            setLoading(true);
            const res = await affiliationsAPI.getCoachesByGym(id.trim());
            setCoaches(res.data);
            setSearchGymId(id.trim());

        }catch(err) {
            Alert.alert('Error', 'Failed to load coaches');
        }finally{
            setLoading(false);
        }

    };

    useEffect(() => {
        setLoading(false)
    }, []);


    const handleRequestPT = async () => {
        if(!selectedCoach){
            return;
        }
        try{
            setRequesting(true);
            await ptAPI.sendRequest({
                coachId: selectedCoach.userId,
                gymId: selectedCoach.gymId,
            });
            setModalVisible(false);
            Alert.alert('Success', 'PT request sent successfully');

        }catch(err: any){
            const msg = err?.response?.data?.message || 'Failed to send PT request';
            Alert.alert('Error', msg);
        }finally {
            setRequesting(false);
        }
    }


    const openRequestModal = (coach: CoachAffiliation) => {
    setSelectedCoach(coach);
    setModalVisible(true);
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find a Coach</Text>
        <Text style={styles.headerSubtitle}>Browse coaches in your gym</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter Gym ID to find coaches..."
          value={gymId}
          onChangeText={setGymId}
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => fetchCoaches(gymId)}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : coaches.length === 0 && searchGymId ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏋️</Text>
          <Text style={styles.emptyTitle}>No coaches found</Text>
          <Text style={styles.emptySubtitle}>No approved coaches in this gym yet</Text>
        </View>
      ) : coaches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Search for coaches</Text>
          <Text style={styles.emptySubtitle}>Enter your gym ID above to find coaches</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          <Text style={styles.resultsLabel}>
            {coaches.length} coach{coaches.length !== 1 ? 'es' : ''} found
          </Text>
          {coaches.map((coach) => (
            <View key={coach.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {coach.userId.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Coach</Text>
                  <Text style={styles.cardSubtitle}>
                    ID: {coach.userId.slice(0, 16)}...
                  </Text>
                  <View style={styles.approvedBadge}>
                    <Text style={styles.approvedBadgeText}>✓ Approved</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.requestButton}
                  onPress={() => openRequestModal(coach)}
                >
                  <Text style={styles.requestButtonText}>Request PT</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.metaText}>
                  📅 Joined {new Date(coach.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* PT Request Confirmation Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Text style={{ fontSize: 32 }}>🤝</Text>
            </View>
            <Text style={styles.modalTitle}>Request Personal Training</Text>
            <Text style={styles.modalSubtitle}>
              Send a personal training request to this coach?
            </Text>

            {selectedCoach && (
              <View style={styles.coachPreview}>
                <View style={styles.previewAvatar}>
                  <Text style={styles.previewAvatarText}>
                    {selectedCoach.userId.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.previewName}>Coach</Text>
                  <Text style={styles.previewId}>
                    {selectedCoach.userId.slice(0, 20)}...
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.modalNote}>
              The coach will be notified and can approve or deny your request.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleRequestPT}
                disabled={requesting}
              >
                {requesting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.confirmButtonText}>Send Request</Text>
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
  header: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  searchSection: {
    flexDirection: 'row', padding: 16, gap: 10,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: '#1E293B', backgroundColor: '#F8FAFC',
  },
  searchButton: {
    backgroundColor: '#2563EB', paddingHorizontal: 16,
    borderRadius: 8, justifyContent: 'center',
  },
  searchButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  resultsLabel: {
    fontSize: 13, color: '#64748B', fontWeight: '500', marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#EFF6FF', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#2563EB' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  cardSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  approvedBadge: {
    marginTop: 4, alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 10,
  },
  approvedBadgeText: { fontSize: 11, color: '#16A34A', fontWeight: '600' },
  requestButton: {
    backgroundColor: '#2563EB', paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 8,
  },
  requestButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  cardMeta: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  metaText: { fontSize: 12, color: '#94A3B8' },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#64748B' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, alignItems: 'center',
  },
  modalIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#EFF6FF', justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20 },
  coachPreview: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 12,
    padding: 12, width: '100%', marginBottom: 16,
  },
  previewAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EFF6FF', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  previewAvatarText: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  previewName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  previewId: { fontSize: 12, color: '#94A3B8' },
  modalNote: {
    fontSize: 13, color: '#94A3B8', textAlign: 'center',
    marginBottom: 24, lineHeight: 18,
  },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelButton: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
  },
  cancelButtonText: { color: '#64748B', fontWeight: '600' },
  confirmButton: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    backgroundColor: '#2563EB', alignItems: 'center',
  },
  confirmButtonText: { color: '#FFFFFF', fontWeight: '600' },
});
