import * as SecureStore from 'expo-secure-store';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { makeRedirectUri, refreshAsync } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

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

export async function logout() {
    const { refreshToken, idToken } = await getCredentials();
    const keycloakBaseUrl = process.env.EXPO_PUBLIC_KEYCLOAK_URL;
    const redirectUri = makeRedirectUri({
        scheme: 'fittrack',
        path: 'login',
    });

    try {
        if (keycloakBaseUrl && idToken) {
            const endSessionUrl = new URL(`${keycloakBaseUrl}/protocol/openid-connect/logout`);
            endSessionUrl.searchParams.set('client_id', 'fittrack-client');
            endSessionUrl.searchParams.set('id_token_hint', idToken);
            endSessionUrl.searchParams.set('post_logout_redirect_uri', redirectUri);

            await WebBrowser.openBrowserAsync(endSessionUrl.toString());
        }

        if (keycloakBaseUrl && refreshToken) {
            const logoutEndpoint = `${keycloakBaseUrl}/protocol/openid-connect/logout`;
            const body = new URLSearchParams({
                client_id: 'fittrack-client',
                refresh_token: refreshToken,
            });

            if (idToken) {
                body.append('id_token_hint', idToken);
            }

            await fetch(logoutEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body.toString(),
            });
        }
    } finally {
        await Promise.all([
            SecureStore.deleteItemAsync('accessToken'),
            SecureStore.deleteItemAsync('refreshToken'),
            SecureStore.deleteItemAsync('idToken'),
        ]);
    }
}