import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { BorderRadius, Spacing, Typography } from '../constants/theme';
import { useSettings } from '../contexts/SettingsContext';

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
    const { colors } = useSettings();
    const styles = useMemo(() => createStyles(colors), [colors]);

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
                return { ...baseStyle, backgroundColor: colors.primary };
            case 'secondary':
                return { ...baseStyle, backgroundColor: colors.textSecondary };
            case 'outline':
                return { ...baseStyle, backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary };
            case 'danger':
                return { ...baseStyle, backgroundColor: colors.error };
            default:
                return { ...baseStyle, backgroundColor: colors.primary };
        }
    };

    const getTextStyle = (): TextStyle => {
        const baseStyle: TextStyle = {
            ...styles.text,
            ...styles[`${size}Text`],
        };

        if (variant === 'outline') {
            return { ...baseStyle, color: colors.primary };
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
                <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.textWhite} />
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

const createStyles = (colors: any) => StyleSheet.create({
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
        backgroundColor: colors.border,
        opacity: 0.5,
    },
    text: {
        color: colors.textWhite,
        fontWeight: Typography.semibold,
    },
    smallText: {
        fontSize: Typography.sm,
    },
    mediumText: {
        fontSize: Typography.base,
        color: colors.textWhite,
    },
    largeText: {
        fontSize: Typography.lg,
    },
});
