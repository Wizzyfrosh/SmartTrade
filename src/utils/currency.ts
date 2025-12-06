/**
 * Currency Utilities
 * Country-to-currency mapping and formatting functions
 */

export interface CurrencyInfo {
    code: string;
    symbol: string;
    name: string;
    locale: string;
}

// Country to currency mapping
export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyInfo> = {
    NG: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
    US: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    GB: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    EU: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-EU' },
    GH: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', locale: 'en-GH' },
    KE: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
    ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
    IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
    JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
    AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
    BR: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
    MX: { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', locale: 'es-MX' },
};

/**
 * Get currency info by country code
 */
export const getCurrencyByCountry = (countryCode: string): CurrencyInfo => {
    return COUNTRY_CURRENCY_MAP[countryCode] || COUNTRY_CURRENCY_MAP.NG;
};

/**
 * Get currency info by currency code
 */
export const getCurrencyByCode = (currencyCode: string): CurrencyInfo | undefined => {
    return Object.values(COUNTRY_CURRENCY_MAP).find(
        (currency) => currency.code === currencyCode
    );
};

/**
 * Format amount with currency symbol
 */
export const formatCurrency = (
    amount: number,
    currencyCode: string = 'NGN',
    showSymbol: boolean = true
): string => {
    const currency = getCurrencyByCode(currencyCode);

    if (!currency) {
        return amount.toFixed(2);
    }

    // Format number with locale-specific formatting
    const formattedNumber = new Intl.NumberFormat(currency.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    if (showSymbol) {
        return `${currency.symbol}${formattedNumber}`;
    }

    return formattedNumber;
};

/**
 * Format amount with compact notation (e.g., 1.2K, 1.5M)
 */
export const formatCompactCurrency = (
    amount: number,
    currencyCode: string = 'NGN'
): string => {
    const currency = getCurrencyByCode(currencyCode);

    if (!currency) {
        return amount.toFixed(2);
    }

    const formattedNumber = new Intl.NumberFormat(currency.locale, {
        notation: 'compact',
        compactDisplay: 'short',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(amount);

    return `${currency.symbol}${formattedNumber}`;
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (value: string): number => {
    // Remove all non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
};

/**
 * Detect user's country (placeholder - would use geolocation API in production)
 */
export const detectUserCountry = async (): Promise<string> => {
    // In production, this would use:
    // - expo-location for GPS-based detection
    // - IP geolocation API
    // - User's device locale

    // For now, return Nigeria as default
    return 'NG';
};

/**
 * Get all available currencies
 */
export const getAllCurrencies = (): CurrencyInfo[] => {
    return Object.values(COUNTRY_CURRENCY_MAP);
};
