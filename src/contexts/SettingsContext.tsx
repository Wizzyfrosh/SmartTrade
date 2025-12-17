import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { LightColors, DarkColors } from '../constants/theme';

const SETTINGS_KEY = 'user_settings';

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsContextType {
    currency: string;
    lowStockThreshold: number;
    notificationsEnabled: boolean;
    theme: ThemeMode;
    colors: typeof LightColors;
    isDark: boolean;
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
    loading: boolean;
}

interface AppSettings {
    currency: string;
    lowStockThreshold: number;
    notificationsEnabled: boolean;
    theme: ThemeMode;
}

const defaultSettings: AppSettings = {
    currency: 'NGN',
    lowStockThreshold: 5,
    notificationsEnabled: true,
    theme: 'system',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const systemScheme = useColorScheme();
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, [user]);

    const loadSettings = async () => {
        try {
            const stored = await AsyncStorage.getItem(SETTINGS_KEY);
            if (stored) {
                setSettings({ ...defaultSettings, ...JSON.parse(stored) });
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        try {
            const updated = { ...settings, ...newSettings };
            setSettings(updated);
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to save settings:', error);
            throw error;
        }
    };

    const activeTheme = settings.theme === 'system' ? (systemScheme ?? 'light') : settings.theme;
    const colors = activeTheme === 'dark' ? DarkColors : LightColors;
    const isDark = activeTheme === 'dark';

    return (
        <SettingsContext.Provider
            value={{
                currency: settings.currency,
                lowStockThreshold: settings.lowStockThreshold,
                notificationsEnabled: settings.notificationsEnabled,
                theme: settings.theme,
                colors,
                isDark,
                updateSettings,
                loading,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
