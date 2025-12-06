/**
 * SmartTrade Configuration
 * App-wide configuration constants
 */

// Supabase Configuration
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Database Configuration
export const DB_NAME = 'smarttrade.db';
export const DB_VERSION = 1;

// Sync Configuration
export const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const MAX_RETRY_COUNT = 3;
export const RETRY_DELAY = 2000; // 2 seconds

// App Configuration
export const DEFAULT_LOW_STOCK_THRESHOLD = 5;
export const DEFAULT_CURRENCY = 'NGN'; // Nigerian Naira (from screenshots)
export const DEFAULT_CURRENCY_SYMBOL = '₦';

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

// Pagination
export const ITEMS_PER_PAGE = 20;

// Product Categories
export const PRODUCT_CATEGORIES = [
    'Electronics',
    'Clothing',
    'Food & Beverages',
    'Furniture',
    'Beauty & Personal Care',
    'Books & Stationery',
    'Toys & Games',
    'Sports & Outdoors',
    'Home & Kitchen',
    'Other',
];

// Stock Status
export const STOCK_STATUS = {
    IN_STOCK: 'in_stock',
    LOW_STOCK: 'low_stock',
    OUT_OF_STOCK: 'out_of_stock',
} as const;

// Report Periods
export const REPORT_PERIODS = [
    { label: 'Today', value: 'today' as const },
    { label: 'This Week', value: 'week' as const },
    { label: 'This Month', value: 'month' as const },
    { label: 'Custom', value: 'custom' as const },
];
