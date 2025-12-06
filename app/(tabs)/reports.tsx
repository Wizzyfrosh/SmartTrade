/**
 * Reports Screen
 * View sales reports and analytics
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { EmptyState } from '../../src/components';

export default function Reports() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sales Reports</Text>
                <Text style={styles.headerSubtitle}>Analyze your business performance and profits</Text>
            </View>
            <View style={styles.content}>
                <EmptyState
                    icon={<Ionicons name="bar-chart-outline" size={64} color={Colors.textTertiary} />}
                    title="Reports Screen"
                    message="View sales analytics and export reports"
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
        justifyContent: 'center',
        padding: Spacing.lg,
    },
});
