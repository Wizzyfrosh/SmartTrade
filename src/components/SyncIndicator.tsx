/**
 * Sync Indicator Component
 * Shows sync status in the UI
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

interface SyncIndicatorProps {
    status: 'synced' | 'syncing' | 'unsynced' | 'error';
    pendingItems?: number;
    lastSyncTime?: number;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({
    status,
    pendingItems = 0,
    lastSyncTime,
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'synced':
                return {
                    color: Colors.synced,
                    text: 'Synced',
                    showSpinner: false,
                };
            case 'syncing':
                return {
                    color: Colors.syncing,
                    text: 'Syncing...',
                    showSpinner: true,
                };
            case 'unsynced':
                return {
                    color: Colors.unsynced,
                    text: `${pendingItems} pending`,
                    showSpinner: false,
                };
            case 'error':
                return {
                    color: Colors.error,
                    text: 'Sync failed',
                    showSpinner: false,
                };
            default:
                return {
                    color: Colors.textSecondary,
                    text: 'Unknown',
                    showSpinner: false,
                };
        }
    };

    const config = getStatusConfig();

    return (
        <View style={[styles.container, { backgroundColor: config.color + '20' }]}>
            {config.showSpinner ? (
                <ActivityIndicator size="small" color={config.color} />
            ) : (
                <View style={[styles.dot, { backgroundColor: config.color }]} />
            )}
            <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: Spacing.xs,
    },
    text: {
        fontSize: Typography.xs,
        fontWeight: Typography.medium,
    },
});
