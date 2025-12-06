/**
 * Button Component
 * Reusable button with different variants
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle,
}) => {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            ...styles.button,
            ...styles[`${size}Button`],
        };

        if (disabled) {
            return { ...baseStyle, ...styles.disabledButton };
        }

        switch (variant) {
            case 'primary':
                return { ...baseStyle, backgroundColor: Colors.primary };
            case 'secondary':
                return { ...baseStyle, backgroundColor: Colors.textSecondary };
            case 'outline':
                return { ...baseStyle, backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.primary };
            case 'danger':
                return { ...baseStyle, backgroundColor: Colors.error };
            default:
                return { ...baseStyle, backgroundColor: Colors.primary };
        }
    };

    const getTextStyle = (): TextStyle => {
        const baseStyle: TextStyle = {
            ...styles.text,
            ...styles[`${size}Text`],
        };

        if (variant === 'outline') {
            return { ...baseStyle, color: Colors.primary };
        }

        return baseStyle;
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.textWhite} />
            ) : (
                <>
                    {icon}
                    <Text style={[getTextStyle(), textStyle, icon ? { marginLeft: Spacing.sm } : undefined]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.md,
    },
    smallButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    mediumButton: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    largeButton: {
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
    },
    disabledButton: {
        backgroundColor: Colors.border,
        opacity: 0.5,
    },
    text: {
        color: Colors.textWhite,
        fontWeight: Typography.semibold,
    },
    smallText: {
        fontSize: Typography.sm,
    },
    mediumText: {
        fontSize: Typography.base,
    },
    largeText: {
        fontSize: Typography.lg,
    },
});
