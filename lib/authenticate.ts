import * as SecureStore from 'expo-secure-store';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { refreshAsync } from 'expo-auth-session';

interface KeycloakJwtPayload extends JwtPayload {
  realm_access?: {
    roles: string[];
  };
}

async function getCredentials() {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  const idToken = await SecureStore.getItemAsync('idToken');

  return { accessToken, refreshToken, idToken };
}

export async function authenticate() {
    const tokens = await getCredentials();

    if (!tokens.accessToken || !tokens.refreshToken || !tokens.idToken) {
        return null;
    }

    const decodedToken = jwtDecode(tokens.accessToken);
    const currentTime = Math.floor(Date.now() / 1000);

    const isAccessTokenValid = decodedToken.exp ? decodedToken.exp > (currentTime + 60): false; // 60 seconds buffer

    if (isAccessTokenValid) {
        return tokens;
    }

    const tokenEndpoint = `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/token`;

    const refreshedTokens = await refreshAsync(
        {
            clientId: 'fittrack-client',
            refreshToken: tokens.refreshToken,
        },
        { tokenEndpoint }
    );

    if (refreshedTokens.accessToken && refreshedTokens.refreshToken && refreshedTokens.idToken) {
        await SecureStore.setItemAsync('accessToken', refreshedTokens.accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshedTokens.refreshToken);
        await SecureStore.setItemAsync('idToken', refreshedTokens.idToken);

        return {
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken,
            idToken: refreshedTokens.idToken,
        };
    }

    return null;
}

export async function getUserRoles(accessToken: string) {
    const decodedToken = jwtDecode<KeycloakJwtPayload>(accessToken);
    return decodedToken.realm_access?.roles || [];
}