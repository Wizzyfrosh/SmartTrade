/**
 * Empty State Component
 * Display when lists are empty
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spacing, Typography } from '../constants/theme';
import { Button } from './Button';
import { useSettings } from '../contexts/SettingsContext';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    message,
    actionLabel,
    onAction,
}) => {
    const { colors } = useSettings();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>{icon}</View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    variant="primary"
                    style={styles.button}
                />
            )}
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing['3xl'],
    },
    iconContainer: {
        marginBottom: Spacing.lg,
        opacity: 0.3,
    },
    title: {
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
        color: colors.textPrimary,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: Typography.base,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    button: {
        marginTop: Spacing.md,
    },
});
