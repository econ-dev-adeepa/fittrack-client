import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1E293B',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      {/* Step 1 — Find & enroll in gyms */}
      <Tabs.Screen
        name="gyms"
        options={{
          title: 'Gyms',
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