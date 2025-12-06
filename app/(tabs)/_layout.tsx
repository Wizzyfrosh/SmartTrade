/**
 * Tab Navigation Layout
 * Bottom tab bar with Dashboard, Inventory, Sales, Reports, Settings
 */

import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: Colors.cardBackground,
                    borderTopWidth: 1,
                    borderTopColor: Colors.border,
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
                        <View style={{ backgroundColor: color === Colors.primary ? Colors.mintBg : 'transparent', padding: 8, borderRadius: 12 }}>
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
                        <View style={{ backgroundColor: color === Colors.primary ? Colors.blueBg : 'transparent', padding: 8, borderRadius: 12 }}>
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
                        <View style={{ backgroundColor: color === Colors.primary ? Colors.orangeBg : 'transparent', padding: 8, borderRadius: 12 }}>
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
                        <View style={{ backgroundColor: color === Colors.primary ? Colors.purpleBg : 'transparent', padding: 8, borderRadius: 12 }}>
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
