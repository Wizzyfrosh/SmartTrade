/**
 * Input Component
 * Reusable text input with label and validation
 */

import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    required?: boolean;
    onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    rightIcon,
    required = false,
    style,
    onRightIconPress,
    ...props
}) => {
    return (
        <View style={styles.container}>
            {label && (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            )}
            <View style={[styles.inputContainer, error ? styles.inputError : undefined]}>
                {icon && <View style={styles.icon}>{icon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        icon ? styles.inputWithIcon : undefined,
                        rightIcon ? styles.inputWithRightIcon : undefined,
                        style
                    ]}
                    placeholderTextColor={Colors.textTertiary}
                    {...props}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon} disabled={!onRightIconPress}>
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    required: {
        color: Colors.error,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputError: {
        borderColor: Colors.error,
    },
    icon: {
        paddingLeft: Spacing.md,
    },
    rightIcon: {
        paddingRight: Spacing.md,
    },
    input: {
        flex: 1,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        fontSize: Typography.base,
        color: Colors.textPrimary,
    },
    inputWithIcon: {
        paddingLeft: Spacing.sm,
    },
    inputWithRightIcon: {
        paddingRight: Spacing.sm,
    },
    errorText: {
        fontSize: Typography.xs,
        color: Colors.error,
        marginTop: Spacing.xs,
    },
});
