import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useContext } from "react";

import * as WebBrowser from 'expo-web-browser';
import AuthContext from "../../stores/authContext";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { promptAsync } = useContext(AuthContext)!;
  const handleAuth = () => {
    promptAsync()
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroWrapper}>
        <View style={styles.hero}>
          <Text style={styles.logo}>💪</Text>
          <Text style={styles.title}>FitTrack</Text>
          <Text style={styles.subtitle}>Your fitness management platform</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 24, paddingVertical: 32 },
  heroWrapper: { flex: 1, justifyContent: 'center' },
  hero: { alignItems: 'center' },
  logo: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: '800', color: '#1E293B' },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
    paddingBottom: 8,
  },
  button: {
    backgroundColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#334155' },
});