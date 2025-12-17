/**
 * Stat Card Component
 * Dashboard metric card with icon and value
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BorderRadius, Spacing, Typography, Shadows } from '../constants/theme';
import { useSettings } from '../contexts/SettingsContext';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    backgroundColor?: string;
    iconColor?: string;
    onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
    icon,
    label,
    value,
    backgroundColor,
    iconColor,
    onPress,
}) => {
    const { colors } = useSettings();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const Container = onPress ? TouchableOpacity : View;

    // Defaults
    const bg = backgroundColor || colors.cardBackground;
    const iColor = iconColor || colors.primary;

    return (
        <Container
            style={[styles.container, { backgroundColor: bg }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={[styles.iconContainer, { backgroundColor: iColor + '20' }]}>
                {icon}
            </View>
            <View style={styles.content}>
                <Text style={styles.value}>{value}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>
        </Container>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    content: {
        flex: 1,
    },
    value: {
        fontSize: Typography['2xl'],
        fontWeight: Typography.bold,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    label: {
        fontSize: Typography.sm,
        color: colors.textSecondary,
    },
});
