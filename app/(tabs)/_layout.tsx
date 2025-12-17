/**
 * Tab Navigation Layout
 * Bottom tab bar with Dashboard, Inventory, Sales, Reports, Settings
 */

import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography, Shadows } from '../../src/constants/theme';
import { useSettings } from '../../src/contexts/SettingsContext';

export default function TabLayout() {
    const { colors } = useSettings();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.cardBackground,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <View style={{ backgroundColor: color === colors.primary ? colors.mintBg : 'transparent', padding: 8, borderRadius: 12 }}>
                            <Ionicons name="grid" size={20} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="inventory"
                options={{
                    title: 'Inventory',
                    tabBarIcon: ({ color, size }) => (
                        <View style={{ backgroundColor: color === colors.primary ? colors.blueBg : 'transparent', padding: 8, borderRadius: 12 }}>
                            <Ionicons name="cube" size={20} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="sales"
                options={{
                    title: 'Sales',
                    tabBarIcon: ({ color, size }) => (
                        <View style={{ backgroundColor: color === colors.primary ? colors.orangeBg : 'transparent', padding: 8, borderRadius: 12 }}>
                            <Ionicons name="cart" size={20} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="reports"
                options={{
                    title: 'Reports',
                    tabBarIcon: ({ color, size }) => (
                        <View style={{ backgroundColor: color === colors.primary ? colors.purpleBg : 'transparent', padding: 8, borderRadius: 12 }}>
                            <Ionicons name="bar-chart" size={20} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
