/**
 * SmartTrade Design System
 * Based on the provided design screenshots
 */

export const LightColors = {
    // Primary colors
    primary: '#10B981', // Green - main brand color
    primaryLight: '#34D399',
    primaryDark: '#059669',

    // Accent colors
    orange: '#F97316',
    orangeLight: '#FB923C',
    lightOrange: '#FFEDD5',
    headerBackground: '#FED7AA',
    purple: '#A855F7',
    purpleLight: '#C084FC',
    blue: '#3B82F6',
    blueLight: '#60A5FA',
    red: '#EF4444',

    // Backgrounds
    background: '#F9FAFB',
    backgroundDark: '#111827', // Used for specific dark elements in light mode
    cardBackground: '#FFFFFF',
    cardBackgroundDark: '#1F2937',

    // Card accent backgrounds (from screenshots)
    mintBg: '#D1FAE5',
    orangeBg: '#FED7AA',
    purpleBg: '#E9D5FF',
    blueBg: '#DBEAFE',
    greenBg: '#D1FAE5',
    redBg: '#FEE2E2',

    // Text colors
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textWhite: '#FFFFFF',

    // Border colors
    border: '#E5E7EB',
    borderDark: '#374151',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Sync status
    synced: '#10B981',
    syncing: '#F59E0B',
    unsynced: '#EF4444',
};

export const DarkColors = {
    // Primary colors - slightly adjusted for dark mode if needed, but keeping brand mostly same
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',

    // Accent colors
    orange: '#F97316',
    orangeLight: '#FB923C',
    lightOrange: '#9A3412', // Darker orange for background/contrast
    headerBackground: '#7C2D12', // Darker header
    purple: '#A855F7',
    purpleLight: '#C084FC',
    blue: '#3B82F6',
    blueLight: '#60A5FA',
    red: '#EF4444',

    // Backgrounds
    background: '#111827', // Dark background
    backgroundDark: '#000000',
    cardBackground: '#1F2937', // Dark card
    cardBackgroundDark: '#000000',

    // Card accent backgrounds - darkened for dark mode
    mintBg: '#064E3B',
    orangeBg: '#7C2D12',
    purpleBg: '#581C87',
    blueBg: '#1E3A8A',
    greenBg: '#064E3B',
    redBg: '#7F1D1D',

    // Text colors
    textPrimary: '#F9FAFB', // White-ish
    textSecondary: '#9CA3AF', // Gray
    textTertiary: '#6B7280',
    textWhite: '#FFFFFF',

    // Border colors
    border: '#374151',
    borderDark: '#4B5563',

    // Status colors
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    // Sync status
    synced: '#34D399',
    syncing: '#FBBF24',
    unsynced: '#F87171',
};

export const Colors = LightColors; // Default for backward compatibility until refactor is complete

export const Typography = {
    // Font sizes
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,

    // Font weights
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};

export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
};

export const IconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
};

// Category colors mapping
export const CategoryColors: Record<string, { bg: string; text: string }> = {
    electronics: { bg: Colors.blueBg, text: Colors.blue },
    clothing: { bg: Colors.purpleBg, text: Colors.purple },
    food: { bg: Colors.orangeBg, text: Colors.orange },
    furniture: { bg: Colors.mintBg, text: Colors.primary },
    default: { bg: Colors.background, text: Colors.textSecondary },
};
