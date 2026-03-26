import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function Menu() {
  const router = useRouter();
  return (
    <TouchableOpacity 
      style={{ marginRight: 16, justifyContent: 'center', alignItems: 'center', height: 120 }}
      onPress={() => router.push('/(admin)/settings')}
    >
      <Ionicons name="menu-outline" size={24} color="#1E293B" />
    </TouchableOpacity>
  );
}

export default function AdminLayout() {
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
        headerRight: () => <Menu />,
      }}
    >
      <Tabs.Screen
        name="affiliations"
        options={{
          title: 'Affiliations',
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>Affiliations</Text>
              <Text style={styles.headerSubtitle}>Manage coach & customer requests</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: 'Programs',
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>Programs</Text>
              <Text style={styles.headerSubtitle}>Review & approve coach programs</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pt-requests"
        options={{
          title: 'PT Requests',
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>PT Requests</Text>
              <Text style={styles.headerSubtitle}>Final approval for personal training</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          href: null,
          headerRight: () => {
            const router = useRouter();
            return (
              <TouchableOpacity 
                style={{ marginRight: 16, justifyContent: 'center', alignItems: 'center', height: 120 }}
                onPress={() => router.back()}
              >
                <Ionicons name="close-outline" size={32} color="#1E293B" />
              </TouchableOpacity>
            );
          },
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.headerSubtitle}>Manage Gym Details</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings/register-gym"
        options={{
          href: null,
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