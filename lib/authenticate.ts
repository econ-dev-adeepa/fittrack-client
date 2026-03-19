import * as SecureStore from 'expo-secure-store';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { fetchDiscoveryAsync, makeRedirectUri, refreshAsync } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import keyStore from '../stores/keyStore';
import awaitable from './awaitable';

interface KeycloakJwtPayload extends JwtPayload {
  user_role: string;
}

export async function loadCredentials() {
    const accessToken = (await SecureStore.getItemAsync('accessToken')) || undefined;
    const refreshToken = (await SecureStore.getItemAsync('refreshToken')) || undefined;
    const idToken = (await SecureStore.getItemAsync('idToken')) || undefined;

    keyStore.getState().clearCredentials();
    keyStore.getState().setCredentials(accessToken, refreshToken, idToken);

    return { accessToken, refreshToken, idToken };
}

export async function saveCredentials(accessToken?: string, refreshToken?: string, idToken?: string) {
    accessToken = accessToken || keyStore.getState().accessToken;
    refreshToken = refreshToken || keyStore.getState().refreshToken;
    idToken = idToken || keyStore.getState().idToken;

    if (accessToken) await SecureStore.setItemAsync('accessToken', accessToken);
    if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);
    if (idToken) await SecureStore.setItemAsync('idToken', idToken);

    const setTokens = keyStore.getState().setCredentials;
    
    setTokens(accessToken, refreshToken, idToken);
}

export function isTokenValid(token: string) {
    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    return decodedToken.exp ? decodedToken.exp > (currentTime + 60): false; // 60 seconds buffer
}

export async function refreshAccessToken(refreshToken: string) {
    const [errDiscovery, discovery] = await awaitable(
        fetchDiscoveryAsync(process.env.EXPO_PUBLIC_KEYCLOAK_URL)
    );

    if (errDiscovery) {
        throw new Error('Failed to fetch discovery document');
    }

    const [errRefresh, refreshedTokens] = await awaitable(refreshAsync({
        clientId: 'fittrack-client',
        refreshToken: refreshToken
    }, discovery));

    if (errRefresh) {
        console.error('Refresh Token Error:', errRefresh);
        throw new Error('Failed to refresh access token');
    }

    const refreshedAccessToken = refreshedTokens.accessToken;
    const refreshedRefreshToken = refreshedTokens.refreshToken || refreshToken;

    await saveCredentials(refreshedAccessToken, refreshedRefreshToken);

    return {
        accessToken: refreshedAccessToken,
        refreshToken: refreshedRefreshToken,
    };
}

export async function getUserRoles(accessToken: string) {
    const decodedToken = jwtDecode<KeycloakJwtPayload>(accessToken);
    return decodedToken.user_role;
}

export async function logout() {
    const { refreshToken, idToken } = keyStore.getState();
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