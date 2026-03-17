import { useEffect } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function CoachLogoutScreen() {
  useEffect(() => {
    const clearSessionAndRedirect = async () => {
      await Promise.all([
        SecureStore.deleteItemAsync('accessToken'),
        SecureStore.deleteItemAsync('refreshToken'),
        SecureStore.deleteItemAsync('idToken'),
      ]);

      router.replace('/login');
    };

    clearSessionAndRedirect();
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