import { exchangeCodeAsync } from "expo-auth-session";
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect } from "react";
import AuthContext from "../auth_context";
import { router } from "expo-router";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

async function saveCredentials(accessToken: string, refreshToken: string, idToken: string) {
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
  await SecureStore.setItemAsync('idToken', idToken);
}

interface KeycloakJwtPayload extends JwtPayload {
  realm_access?: {
    roles: string[];
  };
}

export default function LoginRedirect() {
  const {
      request,
      response,
      redirectUri,
      discovery
  } = useContext(AuthContext)!;

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
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.title}>Signing you in</Text>
        <Text style={styles.subtitle}>Please wait while we complete authentication.</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
