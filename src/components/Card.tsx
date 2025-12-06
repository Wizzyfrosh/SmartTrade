/**
 * Reusable Card Component
 * Base card component with consistent styling
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../constants/theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    backgroundColor?: string;
    padding?: number;
    noPadding?: boolean;
    onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    backgroundColor = Colors.cardBackground,
    padding = Spacing.lg,
    noPadding = false,
    onPress,
}) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[
                styles.card,
                { backgroundColor, padding: noPadding ? 0 : padding },
                style,
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.lg,
        ...Shadows.md,
    },
});
