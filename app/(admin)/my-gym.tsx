import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useGymStore from '../../stores/useGymStore';

export default function AdminMyGymScreen() {
  const router = useRouter();
  const selectedGym = useGymStore((state) => state.selectedGym);

  const onCustomersPress = () => router.push('/(admin)/customers');
  const onCoachesPress = () => router.push('/(admin)/coaches');

  if (!selectedGym) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>No active gym selected</Text>
          <Text style={styles.subtitle}>Please select a gym from settings.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{selectedGym.name}</Text>
        <Text style={styles.subtitle}>{selectedGym.location}</Text>

        {selectedGym.description ? (
          <Text style={styles.description}>{selectedGym.description}</Text>
        ) : null}

        {selectedGym.phone ? (
          <Text style={styles.meta}>Phone: {selectedGym.phone}</Text>
        ) : null}
      </View>

      <View style={styles.actionsList}>
        <TouchableOpacity style={styles.menuItem} onPress={onCustomersPress}>
          <Text style={styles.menuItemText}>Customers</Text>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={onCoachesPress}>
          <Text style={styles.menuItemText}>Coaches</Text>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },
  description: {
    marginTop: 12,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  meta: {
    marginTop: 12,
    fontSize: 14,
    color: '#475569',
  },
  actionsList: {
    marginTop: 16,
    gap: 12,
  },
  menuItem: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
  },
});
