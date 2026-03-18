import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { exchangeCodeAsync, makeRedirectUri, useAuthRequest, useAutoDiscovery } from "expo-auth-session"
import { useEffect } from "react";

import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode, JwtPayload } from "jwt-decode";
import { router } from "expo-router";

interface KeycloakJwtPayload extends JwtPayload {
  realm_access?: {
    roles: string[];
  };
}

async function saveCredentials(accessToken: string, refreshToken: string, idToken: string) {
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
  await SecureStore.setItemAsync('idToken', idToken);
}

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const discovery = useAutoDiscovery(process.env.EXPO_PUBLIC_KEYCLOAK_URL);

  const redirectUri = makeRedirectUri({
    scheme: "fittrack",
    path: "login",
  })

  console.log('Redirect URI:', redirectUri);
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: "fittrack-client",
      redirectUri,
      scopes: ["openid", "profile", "email"],
      extraParams: {
        prompt: 'login',
        max_age: '0',
      },
    },
    discovery
  );

  const exchangeCodeForToken = async (code: string) => {
    const tokenResult = await exchangeCodeAsync(
      {
        clientId: "fittrack-client",
        code: code,
        redirectUri: redirectUri,
        extraParams: {
          code_verifier: request!.codeVerifier!, 
        },
      },
      discovery!
    );

    if (tokenResult.accessToken && tokenResult.refreshToken && tokenResult.idToken) {
      await saveCredentials(tokenResult.accessToken, tokenResult.refreshToken, tokenResult.idToken);

      const decodedToken = jwtDecode<KeycloakJwtPayload>(tokenResult.accessToken);
      const realmRoles = decodedToken.realm_access?.roles || [];
      
      if (realmRoles.includes('coach')) {
        router.push('/(coach)/programs');
      } else if (realmRoles.includes('customer')) {
        router.push('/(customer)/coaches');
      } else {
        console.log('User has neither coach nor customer role');
      }
    } else {
      console.error('Token exchange failed:', tokenResult);
    }
  }

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;

      try {
        exchangeCodeForToken(code);
      } catch (error) {
        console.error('Token Exchange Error:', error);
      }
    } else if (response?.type === 'error') {
      console.error('Auth Error:', response.error);
    }
  }, [response]);

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
          onPress={() => { 
            promptAsync()
          }}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {}}
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