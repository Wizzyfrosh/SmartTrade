/**
 * Root Layout
 * Entry point for Expo Router
 */

import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { SettingsProvider } from '../src/contexts/SettingsContext';
import { Colors } from '../src/constants/theme';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

// Import global CSS for web
if (Platform.OS === 'web') {
    require('../global.css');
}

function InitialLayout() {
    const { session, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === 'auth';
        const isPrivacyPolicy = segments[0] === 'privacy-policy';

        if (!session && !inAuthGroup && !isPrivacyPolicy) {
            // Redirect to the sign-in page.
            router.replace('/auth/login');
        } else if (session && inAuthGroup) {
            // Redirect away from the sign-in page.
            router.replace('/(tabs)');
        }
    }, [session, loading, segments]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return <Slot />;
}

export default function RootLayout() {
    // Load Ionicons font for proper rendering on web
    const [fontsLoaded] = useFonts({
        ...Ionicons.font,
    });

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <AuthProvider>
            <SettingsProvider>
                <InitialLayout />
            </SettingsProvider>
        </AuthProvider>
    );
}
