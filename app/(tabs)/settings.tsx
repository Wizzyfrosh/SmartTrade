/**
 * Settings Screen
 * App settings and preferences
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { EmptyState, Button } from '../../src/components';
import { useAuth } from '../../src/contexts/AuthContext';

export default function Settings() {
    const { signOut, user } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut();
            // Router redirect is handled by _layout
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
                <Text style={styles.headerSubtitle}>Manage your app preferences</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{user?.user_metadata?.full_name || 'User'}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </View>
                </View>

                <EmptyState
                    icon={<Ionicons name="settings-outline" size={64} color={Colors.textTertiary} />}
                    title="Settings Screen"
                    message="Configure sync, currency, and app preferences"
                />

                <Button
                    title="Sign Out"
                    onPress={handleSignOut}
                    variant="outline"
                    style={styles.signOutButton}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerTitle: {
        fontSize: Typography['2xl'],
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    headerSubtitle: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
    },
    content: {
        flex: 1,
        padding: Spacing.lg,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        backgroundColor: Colors.cardBackground,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        color: Colors.textWhite,
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
    },
    userName: {
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
    },
    userEmail: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
    },
    signOutButton: {
        marginTop: 'auto',
    },
});
