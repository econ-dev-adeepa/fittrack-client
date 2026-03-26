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
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');

    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const TIME_SLOTS = [
      '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM',
      '11:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM',
    ];


    const toggleDay = (day: string) => {
      setSelectedDays(prev =>
        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
      );
    };


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


  //   const handleRequestPT = async () => {
  //       if(!selectedCoach){
  //           return;
  //       }
  //       try{
  //           setRequesting(true);
  //           await ptAPI.sendRequest({
  //               coachId: selectedCoach.userId,
  //               gymId: selectedCoach.gymId,
  //           });
  //           setModalVisible(false);
  //           Alert.alert('Success', 'PT request sent successfully');

  //       }catch(err: any){
  //           const msg = err?.response?.data?.message || 'Failed to send PT request';
  //           Alert.alert('Error', msg);
  //       }finally {
  //           setRequesting(false);
  //       }
  //   }


  //   const openRequestModal = (coach: CoachAffiliation) => {
  //   setSelectedCoach(coach);
  //   setModalVisible(true);
  // };


    const handleRequestPT = async () => {
      if (!selectedCoach) return;
      if (selectedDays.length === 0) {
        window.alert('Please select at least one preferred day');
        return;
      }
      if (!selectedTime) {
        window.alert('Please select a preferred time');
        return;
      }
      try {
        setRequesting(true);
        await ptAPI.sendRequest({
          coachId: selectedCoach.userId,
          gymId: selectedCoach.gymId,
          preferredDays: selectedDays.join(','),
          preferredTime: selectedTime,
          notes: notes,
        });
        setModalVisible(false);
        setSelectedDays([]);
        setSelectedTime('');
        setNotes('');
        setTimeout(() => {
          window.alert('PT request sent! Waiting for coach to respond.');
        }, 300);
      } catch (err: any) {
        const status = err?.response?.status;
        let msg = 'Failed to send PT request.';
        if (status === 409) msg = 'You already have a PT request with this coach.';
        else if (err?.response?.data?.message) msg = err.response.data.message;
        setModalVisible(false);
        setTimeout(() => window.alert(msg), 300);
      } finally {
        setRequesting(false);
      }
    };


   const openRequestModal = (coach: CoachAffiliation) => {
    setSelectedCoach(coach);
    setSelectedDays([]);
    setSelectedTime('');
    setNotes('');
    setModalVisible(true);
  };


  return (
    <View style={styles.container}>
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
      {/* PT Request Confirmation Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <View style={styles.modalIcon}>
                <Text style={{ fontSize: 32 }}>🤝</Text>
              </View>
              <Text style={styles.modalTitle}>Request Personal Training</Text>

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

              {/* Day Selection */}
              <Text style={styles.sectionLabel}>Preferred Days *</Text>
              <View style={styles.daysContainer}>
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayPill,
                      selectedDays.includes(day) && styles.dayPillSelected,
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[
                      styles.dayPillText,
                      selectedDays.includes(day) && styles.dayPillTextSelected,
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Time Selection */}
              <Text style={styles.sectionLabel}>Preferred Time *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timeScroll}
              >
                {TIME_SLOTS.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timePill,
                      selectedTime === time && styles.timePillSelected,
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[
                      styles.timePillText,
                      selectedTime === time && styles.timePillTextSelected,
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Notes */}
              <Text style={styles.sectionLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Any specific requirements..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.modalNote}>
                The coach will be notified and can approve or deny your request.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedDays([]);
                    setSelectedTime('');
                    setNotes('');
                  }}
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
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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

  sectionLabel: {
  fontSize: 13, fontWeight: '600', color: '#374151',
  alignSelf: 'flex-start', marginBottom: 8, marginTop: 12,
},
  daysContainer: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%',
  },
  dayPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
  },
  dayPillSelected: {
    backgroundColor: '#2563EB', borderColor: '#2563EB',
  },
  dayPillText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  dayPillTextSelected: { color: '#FFFFFF' },
  timeScroll: { width: '100%', marginBottom: 4 },
  timePill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  timePillSelected: {
    backgroundColor: '#2563EB', borderColor: '#2563EB',
  },
  timePillText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  timePillTextSelected: { color: '#FFFFFF' },
  notesInput: {
    width: '100%', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 14, color: '#1E293B', backgroundColor: '#F8FAFC',
    height: 60, textAlignVertical: 'top',
  },
});
