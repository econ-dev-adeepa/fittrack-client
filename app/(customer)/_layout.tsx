import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: { backgroundColor: '#FFFFFF', height: 120 },
        headerTintColor: '#1E293B',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      {/* Step 1 — Find & enroll in gyms */}
      <Tabs.Screen
        name="gyms"
        options={{
          title: 'Gyms',
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>Find a Gym</Text>
              <Text style={styles.headerSubtitle}>Enroll in gyms</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Step 2 — Browse coaches in gym */}
      <Tabs.Screen
        name="coaches"
        options={{
          title: 'Find Coaches',
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>Find a Coach</Text>
              <Text style={styles.headerSubtitle}>Browse coaches in your gym</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Step 3 — Track PT training */}
      <Tabs.Screen
        name="pt-status"
        options={{
          title: 'My Training',
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>My Training</Text>
              <Text style={styles.headerSubtitle}>Track your PT status</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="logout"
        options={{
          title: 'Logout',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
});