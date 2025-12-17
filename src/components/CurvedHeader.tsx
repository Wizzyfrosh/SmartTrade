import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import { useSettings } from '../contexts/SettingsContext';

interface CurvedHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
}

export const CurvedHeader: React.FC<CurvedHeaderProps> = ({
    title,
    subtitle,
    showBack = true,
    rightAction
}) => {
    const router = useRouter();
    const { colors } = useSettings();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.topRow}>
                    {showBack && (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    )}
                    {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            </View>
            <View style={styles.curveOverlay} />
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        backgroundColor: colors.headerBackground,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        paddingBottom: Spacing['3xl'],
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...Shadows.md,
        zIndex: 10,
        position: 'relative',
        overflow: 'hidden', // Ensures content aligns with curves
    },
    content: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        height: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // More generic transparency
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightAction: {
        marginLeft: 'auto',
    },
    titleContainer: {
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Typography['3xl'],
        fontWeight: Typography.bold,
        color: colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.base,
        color: colors.textSecondary,
        opacity: 0.8,
    },
    curveOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 20,
        backgroundColor: colors.headerBackground,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: -1,
    }
});
