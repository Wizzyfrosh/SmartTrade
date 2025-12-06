/**
 * Date and Time Utilities
 * Helper functions for date formatting and manipulation
 */

import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Format timestamp to readable date
 */
export const formatDate = (timestamp: number, formatStr: string = 'MMM dd, yyyy'): string => {
    return format(new Date(timestamp), formatStr);
};

/**
 * Format timestamp to readable time
 */
export const formatTime = (timestamp: number): string => {
    return format(new Date(timestamp), 'HH:mm');
};

/**
 * Format timestamp to readable datetime
 */
export const formatDateTime = (timestamp: number): string => {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
};

/**
 * Get time-based greeting
 */
export const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
};

/**
 * Get start and end timestamps for today
 */
export const getTodayRange = (): { start: number; end: number } => {
    const now = new Date();
    return {
        start: startOfDay(now).getTime(),
        end: endOfDay(now).getTime(),
    };
};

/**
 * Get start and end timestamps for this week
 */
export const getWeekRange = (): { start: number; end: number } => {
    const now = new Date();
    return {
        start: startOfWeek(now, { weekStartsOn: 1 }).getTime(), // Monday
        end: endOfWeek(now, { weekStartsOn: 1 }).getTime(),
    };
};

/**
 * Get start and end timestamps for this month
 */
export const getMonthRange = (): { start: number; end: number } => {
    const now = new Date();
    return {
        start: startOfMonth(now).getTime(),
        end: endOfMonth(now).getTime(),
    };
};

/**
 * Get date range by period type
 */
export const getDateRange = (
    period: 'today' | 'week' | 'month' | 'custom',
    customStart?: number,
    customEnd?: number
): { start: number; end: number } => {
    switch (period) {
        case 'today':
            return getTodayRange();
        case 'week':
            return getWeekRange();
        case 'month':
            return getMonthRange();
        case 'custom':
            if (!customStart || !customEnd) {
                throw new Error('Custom period requires start and end dates');
            }
            return { start: customStart, end: customEnd };
        default:
            return getTodayRange();
    }
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
};
