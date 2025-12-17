/**
 * Responsive Container Component
 * Wraps content for consistent responsive behavior across platforms
 * Centers content and constrains max-width on large screens (web/tablet)
 */

import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions, ViewStyle } from 'react-native';
import { Layout, Breakpoints } from '../constants/theme';
import { useSettings } from '../contexts/SettingsContext';

interface ResponsiveContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    maxWidth?: number;
    noPadding?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
    children,
    style,
    maxWidth = Layout.maxContentWidth,
    noPadding = false,
}) => {
    const { width } = useWindowDimensions();
    const { colors } = useSettings();
    const isWeb = Platform.OS === 'web';
    const isLargeScreen = width > Breakpoints.mobile;

    // On web with large screens, center the content
    const shouldCenter = isWeb && isLargeScreen;

    return (
        <View style={[
            styles.outerContainer,
            { backgroundColor: colors.background },
            shouldCenter && styles.centered,
            style
        ]}>
            <View style={[
                styles.innerContainer,
                shouldCenter && {
                    maxWidth: width > Breakpoints.tablet ? maxWidth : Layout.wideContentWidth,
                    width: '100%',
                },
                !noPadding && isWeb && styles.webShadow,
            ]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
    },
    centered: {
        alignItems: 'center',
    },
    innerContainer: {
        flex: 1,
    },
    webShadow: {
        // Subtle shadow on web for the centered container
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
});
