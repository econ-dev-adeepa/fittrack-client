import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { gymsAPI } from '../../../services/api';
import awaitable from '../../../lib/awaitable';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const OPEN_TIMES = ['05:00', '06:00', '07:00', '08:00', '09:00'];
const CLOSE_TIMES = ['20:00', '21:00', '22:00', '23:00', '00:00'];
const CAPACITY_OPTIONS = [20, 30, 50, 75, 100, 150, 200];

export default function RegisterGymScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [openTime, setOpenTime] = useState('06:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [capacity, setCapacity] = useState(50);
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleRegister = async () => {
    if (!name || !location || !phone) {
      Alert.alert('Error', 'Please enter a name, location and phone number');
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one operational day');
      return;
    }

    setLoading(true);
    const [err, _] = await awaitable(gymsAPI.create({
      name,
      location,
      description,
      phone,
      operationalDays: selectedDays.join(','),
      openTime,
      closeTime,
      capacity,
    }));
    setLoading(false);

    if (err) {
      Alert.alert('Error', 'Failed to register the gym');
      return;
    }

    Alert.alert('Success', 'Gym registered successfully');
    setName('');
    setLocation('');
    setDescription('');
    setPhone('');
    setSelectedDays([]);
    setOpenTime('06:00');
    setCloseTime('22:00');
    setCapacity(50);
  };

  return (
    <>
      <Tabs.Screen
        options={{
          title: 'Register Gym',
          href: null,
          tabBarStyle: { display: 'none' },
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 16, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back-outline" size={24} color="#1E293B" />
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>Register Gym</Text>
              <Text style={styles.headerSubtitle}>Add a new facility</Text>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

          {/* Basic Info */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Gym Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. FitTrack Elite"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 123 Fitness St, Colombo"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 0112345678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the facilities and specialties..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Operational Days */}
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitle}>Operational Info</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Operational Days *</Text>
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
          </View>

          {/* Open Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Opening Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {OPEN_TIMES.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timePill, openTime === time && styles.timePillSelected]}
                  onPress={() => setOpenTime(time)}
                >
                  <Text style={[styles.timePillText, openTime === time && styles.timePillTextSelected]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Close Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Closing Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CLOSE_TIMES.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timePill, closeTime === time && styles.timePillSelected]}
                  onPress={() => setCloseTime(time)}
                >
                  <Text style={[styles.timePillText, closeTime === time && styles.timePillTextSelected]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Capacity */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Gym Capacity</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CAPACITY_OPTIONS.map((cap) => (
                <TouchableOpacity
                  key={cap}
                  style={[styles.timePill, capacity === cap && styles.timePillSelected]}
                  onPress={() => setCapacity(cap)}
                >
                  <Text style={[styles.timePillText, capacity === cap && styles.timePillTextSelected]}>
                    {cap}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register Gym'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentContainer: { padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  sectionDivider: {
    borderTopWidth: 1, borderTopColor: '#E2E8F0',
    paddingTop: 16, marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: '#64748B',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1,
    borderColor: '#E2E8F0', borderRadius: 8,
    padding: 12, fontSize: 16, color: '#1E293B',
  },
  textArea: { height: 100 },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF',
  },
  dayPillSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  dayPillText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  dayPillTextSelected: { color: '#FFFFFF' },
  timePill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  timePillSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  timePillText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  timePillTextSelected: { color: '#FFFFFF' },
  button: {
    backgroundColor: '#2563EB', padding: 16,
    borderRadius: 8, alignItems: 'center', marginTop: 10,
  },
  buttonDisabled: { backgroundColor: '#93C5FD' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});