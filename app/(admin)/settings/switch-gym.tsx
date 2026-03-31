import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useGymStore from '../../../stores/useGymStore';

export default function SwitchGymScreen() {
  const router = useRouter();
  const gyms = useGymStore((state) => state.gyms);
  const selectedGym = useGymStore((state) => state.selectedGym);
  const setSelectedGym = useGymStore((state) => state.setSelectedGym);

  const hasGyms = useMemo(() => (gyms?.length ?? 0) > 0, [gyms]);

  const onSelectGym = (gymId: string) => {
    if (!gyms) {
      return;
    }

    const gym = gyms.find((item) => item.id === gymId);
    if (!gym) {
      return;
    }

    setSelectedGym(gym);
    router.replace('/(admin)/my-gym');
  };

  return (
    <>
      <Tabs.Screen
        options={{
          title: 'Switch Active Gym',
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
              <Text style={styles.headerTitle}>Switch Active Gym</Text>
              <Text style={styles.headerSubtitle}>Choose a gym to manage</Text>
            </View>
          ),
        }}
      />

      <View style={styles.container}>
        {gyms === undefined ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.helperText}>Loading available gyms...</Text>
          </View>
        ) : !hasGyms ? (
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>No gyms found</Text>
            <Text style={styles.helperText}>Register a gym first to switch active gym.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {gyms.map((gym) => {
              const isActive = selectedGym?.id === gym.id;

              return (
                <TouchableOpacity
                  key={gym.id}
                  style={[styles.item, isActive && styles.itemActive]}
                  onPress={() => onSelectGym(gym.id)}
                >
                  <View style={styles.itemBody}>
                    <Text style={styles.gymName}>{gym.name}</Text>
                    <Text style={styles.gymLocation}>{gym.location}</Text>
                  </View>
                  <Ionicons
                    name={isActive ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={isActive ? '#2563EB' : '#94A3B8'}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemActive: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
  },
  itemBody: {
    flex: 1,
    marginRight: 12,
  },
  gymName: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '700',
  },
  gymLocation: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 13,
  },
  emptyTitle: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  helperText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
});