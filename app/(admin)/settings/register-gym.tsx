import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterGymScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');

  const handleRegister = () => {
    // TODO: Wire up actual API call
    console.log({ name, location, description, phone });
    router.back();
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
          <View style={styles.formGroup}>
            <Text style={styles.label}>Gym Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. FitTrack Elite"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 123 Fitness St, NY"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +1 555-0123"
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

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register Gym</Text>
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
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: { height: 100 },
  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
