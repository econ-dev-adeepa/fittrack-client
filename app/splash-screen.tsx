import { useEffect } from "react"
import { authenticate, getUserRoles } from "../lib/authenticate";
import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
    const redirectByRole = (roles: string[]) => {
        if (roles.includes('coach')) {
            router.replace('/(coach)/programs');
        } else if (roles.includes('customer')) {
            router.replace('/(customer)/coaches');
        } else if (roles.includes('gym-admin')) {
            router.replace('/(admin)/affiliations');
        } else {
            router.replace('/login');
        }
    }

    useEffect(() => {
        authenticate()
            .then(async (tokens) => {
                if (!tokens) {
                    return router.replace('/login');
                }

                const userRoles = await getUserRoles(tokens.accessToken!)
                setTimeout(() => redirectByRole(userRoles), 200);
            })
            .catch(error => {
                console.error('Authentication error:', error);
                router.replace('/login');
            })
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