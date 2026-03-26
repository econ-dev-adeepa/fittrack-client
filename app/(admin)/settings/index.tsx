import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminSettings() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.item} onPress={() => {}}>
          <Ionicons name="person-outline" size={24} color="#1E293B" />
          <Text style={styles.itemText}>User Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gym Management</Text>
        
        <TouchableOpacity style={styles.item} onPress={() => {}}>
          <Ionicons name="business-outline" size={24} color="#1E293B" />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={{ fontSize: 16, color: '#1E293B' }}>Switch Active Gym</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => {}}>
          <Ionicons name="add-circle-outline" size={24} color="#1E293B" />
          <Text style={styles.itemText}>Register a New Gym</Text>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.item, { borderBottomWidth: 0 }]} 
          onPress={() => router.replace('/(admin)/logout')}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text style={[styles.itemText, { color: '#EF4444' }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#1E293B',
  },
});
