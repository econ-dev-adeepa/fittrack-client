import { useEffect } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { logout } from '../../lib/authenticate';

export default function CustomerLogoutScreen() {
  useEffect(() => {
    const logoutAndRedirect = async () => {
      await logout();

      router.replace('/login');
    };

    logoutAndRedirect();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#64748B" />
      <Text style={styles.text}>Logging out...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  text: {
    fontSize: 14,
    color: '#64748B',
  },
});