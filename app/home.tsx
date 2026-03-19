import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';


//sample draft
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>💪</Text>
        <Text style={styles.title}>FitTrack</Text>
        <Text style={styles.subtitle}>Your fitness management platform</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Continue as</Text>

        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => router.push('/(coach)/programs')}
        >
          <Text style={styles.roleIcon}>🏋️</Text>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Coach</Text>
            <Text style={styles.roleSubtitle}>Manage programs & PT requests</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => router.push('/(customer)/coaches')}
        >
          <Text style={styles.roleIcon}>👤</Text>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Customer</Text>
            <Text style={styles.roleSubtitle}>Find coaches & track training</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 24 },
  hero: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  logo: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 15, color: '#64748B', marginTop: 6 },
  section: { gap: 12 },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
  },
  roleCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  roleIcon: { fontSize: 28, marginRight: 14 },
  roleInfo: { flex: 1 },
  roleTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  roleSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  arrow: { fontSize: 18, color: '#94A3B8' },
});