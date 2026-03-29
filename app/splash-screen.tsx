import { useEffect } from "react"
import { getUserRoles, isTokenValid, loadCredentials, refreshAccessToken, saveCredentials } from "../lib/authenticate";
import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
    const redirectByRole = (role: string) => {
        if (role === 'coach') {
            router.replace('/(coach)/programs');
        } else if (role === 'customer') {
            router.replace('/(customer)/coaches');
        } else if (role === 'gym_admin') {
            router.replace('/(admin)/my-gym');
        } else {
            router.replace('/login');
        }
    }


    // useEffect(() => {
    // // Temporary bypass — go straight to customer screens
    // setTimeout(() => router.replace('/(customer)/gyms'), 500);
    // }, []);

    useEffect(() => {
        let isActive = true;

        const authenticate = async () => {
            const {accessToken, refreshToken, idToken} = await loadCredentials();
            if (!isActive) throw new Error('Component unmounted');

            if (!accessToken || !refreshToken || !idToken) {
                throw new Error('Missing tokens');
            }

            if (!isTokenValid(refreshToken)) {
                throw new Error('Invalid refresh token');
            }

            if (!isTokenValid(accessToken)) {
                try {
                    const newTokens = await refreshAccessToken(refreshToken)
                    await saveCredentials(newTokens.accessToken, newTokens.refreshToken);
                    const newCredentials = await loadCredentials();

                    return { 
                        accessToken: newCredentials.accessToken!,
                        refreshToken: newCredentials.refreshToken!,
                        idToken: newCredentials.idToken!,
                    }
                } catch (error) {
                    throw new Error('Failed to refresh access token');
                }
            }

            return { accessToken, refreshToken, idToken };
        }

        authenticate()
            .then(async (tokens) => {
                if (!isActive) return;

                const userRole = await getUserRoles(tokens.accessToken)
                setTimeout(() => redirectByRole(userRole), 200);
            })
            .catch(error => {
                if ((error.message !== 'Component unmounted') && isActive) {
                    router.replace('/login');
                }
            })
        
        return () => { isActive = false };
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.logo}>💪</Text>
                <Text style={styles.title}>FitTrack</Text>
                <Text style={styles.subtitle}>Your fitness management platform</Text>
            </View>

            <View style={styles.loaderSection}>
                <ActivityIndicator size="small" color="#64748B" />
                <Text style={styles.loaderText}>Checking your account...</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        fontSize: 56,
        marginBottom: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 15,
        color: '#64748B',
        marginTop: 6,
        textAlign: 'center',
    },
    loaderSection: {
        alignItems: 'center',
        gap: 8,
        paddingBottom: 8,
    },
    loaderText: {
        fontSize: 14,
        color: '#64748B',
    },
});