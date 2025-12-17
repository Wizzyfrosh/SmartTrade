/**
 * Currency Utilities
 * Country-to-currency mapping and formatting functions
 */

export interface CurrencyInfo {
    code: string;
    symbol: string;
    name: string;
    countryName: string;
    locale: string;
}

// Country to currency mapping
export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyInfo> = {
    AF: { code: 'AFN', symbol: '؋', name: 'Afghan Afghani', countryName: 'Afghanistan', locale: 'en-AF' },
    AL: { code: 'ALL', symbol: 'L', name: 'Albanian Lek', countryName: 'Albania', locale: 'sq-AL' },
    DZ: { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar', countryName: 'Algeria', locale: 'ar-DZ' },
    AD: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Andorra', locale: 'ca-AD' },
    AO: { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza', countryName: 'Angola', locale: 'pt-AO' },
    AG: { code: 'XCD', symbol: '$', name: 'East Caribbean Dollar', countryName: 'Antigua and Barbuda', locale: 'en-AG' },
    AR: { code: 'ARS', symbol: '$', name: 'Argentine Peso', countryName: 'Argentina', locale: 'es-AR' },
    AM: { code: 'AMD', symbol: '֏', name: 'Armenian Dram', countryName: 'Armenia', locale: 'hy-AM' },
    AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', countryName: 'Australia', locale: 'en-AU' },
    AT: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Austria', locale: 'de-AT' },
    AZ: { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat', countryName: 'Azerbaijan', locale: 'az-AZ' },
    BS: { code: 'BSD', symbol: '$', name: 'Bahamian Dollar', countryName: 'Bahamas', locale: 'en-BS' },
    BH: { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', countryName: 'Bahrain', locale: 'ar-BH' },
    BD: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', countryName: 'Bangladesh', locale: 'bn-BD' },
    BB: { code: 'BBD', symbol: '$', name: 'Barbadian Dollar', countryName: 'Barbados', locale: 'en-BB' },
    BY: { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble', countryName: 'Belarus', locale: 'be-BY' },
    BE: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Belgium', locale: 'nl-BE' },
    BZ: { code: 'BZD', symbol: '$', name: 'Belize Dollar', countryName: 'Belize', locale: 'en-BZ' },
    BJ: { code: 'XOF', symbol: 'Fr', name: 'West African CFA Franc', countryName: 'Benin', locale: 'fr-BJ' },
    BT: { code: 'BTN', symbol: 'Nu.', name: 'Bhutanese Ngultrum', countryName: 'Bhutan', locale: 'dz-BT' },
    BO: { code: 'BOB', symbol: 'Bs.', name: 'Boliviano', countryName: 'Bolivia', locale: 'es-BO' },
    BA: { code: 'BAM', symbol: 'KM', name: 'Bosnia and Herzegovina Convertible Mark', countryName: 'Bosnia and Herzegovina', locale: 'bs-BA' },
    BW: { code: 'BWP', symbol: 'P', name: 'Botswana Pula', countryName: 'Botswana', locale: 'en-BW' },
    BR: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', countryName: 'Brazil', locale: 'pt-BR' },
    BN: { code: 'BND', symbol: '$', name: 'Brunei Dollar', countryName: 'Brunei', locale: 'ms-BN' },
    BG: { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', countryName: 'Bulgaria', locale: 'bg-BG' },
    BF: { code: 'XOF', symbol: 'Fr', name: 'West African CFA Franc', countryName: 'Burkina Faso', locale: 'fr-BF' },
    BI: { code: 'BIF', symbol: 'FBu', name: 'Burundian Franc', countryName: 'Burundi', locale: 'rn-BI' },
    CV: { code: 'CVE', symbol: '$', name: 'Cape Verdean Escudo', countryName: 'Cabo Verde', locale: 'pt-CV' },
    KH: { code: 'KHR', symbol: '៛', name: 'Cambodian Riel', countryName: 'Cambodia', locale: 'km-KH' },
    CM: { code: 'XAF', symbol: 'Fr', name: 'Central African CFA Franc', countryName: 'Cameroon', locale: 'fr-CM' },
    CA: { code: 'CAD', symbol: '$', name: 'Canadian Dollar', countryName: 'Canada', locale: 'en-CA' },
    CF: { code: 'XAF', symbol: 'Fr', name: 'Central African CFA Franc', countryName: 'Central African Republic', locale: 'fr-CF' },
    TD: { code: 'XAF', symbol: 'Fr', name: 'Central African CFA Franc', countryName: 'Chad', locale: 'fr-TD' },
    CL: { code: 'CLP', symbol: '$', name: 'Chilean Peso', countryName: 'Chile', locale: 'es-CL' },
    CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', countryName: 'China', locale: 'zh-CN' },
    CO: { code: 'COP', symbol: '$', name: 'Colombian Peso', countryName: 'Colombia', locale: 'es-CO' },
    KM: { code: 'KMF', symbol: 'CF', name: 'Comorian Franc', countryName: 'Comoros', locale: 'fr-KM' },
    CG: { code: 'XAF', symbol: 'Fr', name: 'Central African CFA Franc', countryName: 'Congo (Congo-Brazzaville)', locale: 'fr-CG' },
    CR: { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón', countryName: 'Costa Rica', locale: 'es-CR' },
    HR: { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna', countryName: 'Croatia', locale: 'hr-HR' },
    CU: { code: 'CUP', symbol: '$', name: 'Cuban Peso', countryName: 'Cuba', locale: 'es-CU' },
    CY: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Cyprus', locale: 'el-CY' },
    CZ: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', countryName: 'Czechia (Czech Republic)', locale: 'cs-CZ' },
    CD: { code: 'CDF', symbol: 'FC', name: 'Congolese Franc', countryName: 'Democratic Republic of the Congo', locale: 'fr-CD' },
    DK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', countryName: 'Denmark', locale: 'da-DK' },
    DJ: { code: 'DJF', symbol: 'Fdj', name: 'Djiboutian Franc', countryName: 'Djibouti', locale: 'fr-DJ' },
    DM: { code: 'XCD', symbol: '$', name: 'East Caribbean Dollar', countryName: 'Dominica', locale: 'en-DM' },
    DO: { code: 'DOP', symbol: '$', name: 'Dominican Peso', countryName: 'Dominican Republic', locale: 'es-DO' },
    EC: { code: 'USD', symbol: '$', name: 'US Dollar', countryName: 'Ecuador', locale: 'es-EC' },
    EG: { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound', countryName: 'Egypt', locale: 'ar-EG' },
    SV: { code: 'SVC', symbol: '$', name: 'Salvadoran Colón', countryName: 'El Salvador', locale: 'es-SV' },
    GQ: { code: 'XAF', symbol: 'Fr', name: 'Central African CFA Franc', countryName: 'Equatorial Guinea', locale: 'es-GQ' },
    ER: { code: 'ERN', symbol: 'Nkf', name: 'Eritrean Nakfa', countryName: 'Eritrea', locale: 'ti-ER' },
    EE: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Estonia', locale: 'et-EE' },
    SZ: { code: 'SZL', symbol: 'L', name: 'Swazi Lilangeni', countryName: 'Eswatini', locale: 'en-SZ' },
    ET: { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr', countryName: 'Ethiopia', locale: 'am-ET' },
    FJ: { code: 'FJD', symbol: '$', name: 'Fijian Dollar', countryName: 'Fiji', locale: 'en-FJ' },
    FI: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Finland', locale: 'fi-FI' },
    FR: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'France', locale: 'fr-FR' },
    GA: { code: 'XAF', symbol: 'Fr', name: 'Central African CFA Franc', countryName: 'Gabon', locale: 'fr-GA' },
    GM: { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi', countryName: 'Gambia', locale: 'en-GM' },
    GE: { code: 'GEL', symbol: '₾', name: 'Georgian Lari', countryName: 'Georgia', locale: 'ka-GE' },
    DE: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Germany', locale: 'de-DE' },
    GH: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', countryName: 'Ghana', locale: 'en-GH' },
    GR: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Greece', locale: 'el-GR' },
    GD: { code: 'XCD', symbol: '$', name: 'East Caribbean Dollar', countryName: 'Grenada', locale: 'en-GD' },
    GT: { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal', countryName: 'Guatemala', locale: 'es-GT' },
    GN: { code: 'GNF', symbol: 'FG', name: 'Guinean Franc', countryName: 'Guinea', locale: 'fr-GN' },
    GW: { code: 'XOF', symbol: 'Fr', name: 'West African CFA Franc', countryName: 'Guinea-Bissau', locale: 'pt-GW' },
    GY: { code: 'GYD', symbol: '$', name: 'Guyanese Dollar', countryName: 'Guyana', locale: 'en-GY' },
    HT: { code: 'HTG', symbol: 'G', name: 'Haitian Gourde', countryName: 'Haiti', locale: 'fr-HT' },
    HN: { code: 'HNL', symbol: 'L', name: 'Honduran Lempira', countryName: 'Honduras', locale: 'es-HN' },
    HU: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', countryName: 'Hungary', locale: 'hu-HU' },
    IS: { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna', countryName: 'Iceland', locale: 'is-IS' },
    IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee', countryName: 'India', locale: 'hi-IN' },
    ID: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', countryName: 'Indonesia', locale: 'id-ID' },
    IR: { code: 'IRR', symbol: '﷼', name: 'Iranian Rial', countryName: 'Iran', locale: 'fa-IR' },
    IQ: { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar', countryName: 'Iraq', locale: 'ar-IQ' },
    IE: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Ireland', locale: 'en-IE' },
    IL: { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel', countryName: 'Israel', locale: 'he-IL' },
    IT: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Italy', locale: 'it-IT' },
    JM: { code: 'JMD', symbol: '$', name: 'Jamaican Dollar', countryName: 'Jamaica', locale: 'en-JM' },
    JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', countryName: 'Japan', locale: 'ja-JP' },
    JO: { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar', countryName: 'Jordan', locale: 'ar-JO' },
    KZ: { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge', countryName: 'Kazakhstan', locale: 'kk-KZ' },
    KE: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', countryName: 'Kenya', locale: 'sw-KE' },
    KI: { code: 'AUD', symbol: '$', name: 'Australian Dollar', countryName: 'Kiribati', locale: 'en-KI' },
    KW: { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', countryName: 'Kuwait', locale: 'ar-KW' },
    KG: { code: 'KGS', symbol: 'с', name: 'Kyrgyzstani Som', countryName: 'Kyrgyzstan', locale: 'ky-KG' },
    LA: { code: 'LAK', symbol: '₭', name: 'Lao Kip', countryName: 'Laos', locale: 'lo-LA' },
    LV: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Latvia', locale: 'lv-LV' },
    LB: { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound', countryName: 'Lebanon', locale: 'ar-LB' },
    LS: { code: 'LSL', symbol: 'L', name: 'Lesotho Loti', countryName: 'Lesotho', locale: 'st-LS' },
    LR: { code: 'LRD', symbol: '$', name: 'Liberian Dollar', countryName: 'Liberia', locale: 'en-LR' },
    LY: { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar', countryName: 'Libya', locale: 'ar-LY' },
    LI: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', countryName: 'Liechtenstein', locale: 'de-LI' },
    LT: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Lithuania', locale: 'lt-LT' },
    LU: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Luxembourg', locale: 'fr-LU' },
    MG: { code: 'MGA', symbol: 'Ar', name: 'Malagasy Ariary', countryName: 'Madagascar', locale: 'mg-MG' },
    MW: { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha', countryName: 'Malawi', locale: 'en-MW' },
    MY: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', countryName: 'Malaysia', locale: 'ms-MY' },
    MV: { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa', countryName: 'Maldives', locale: 'dv-MV' },
    ML: { code: 'XOF', symbol: 'Fr', name: 'West African CFA Franc', countryName: 'Mali', locale: 'fr-ML' },
    MT: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Malta', locale: 'mt-MT' },
    MH: { code: 'USD', symbol: '$', name: 'US Dollar', countryName: 'Marshall Islands', locale: 'en-MH' },
    MR: { code: 'MRU', symbol: 'UM', name: 'Mauritanian Ouguiya', countryName: 'Mauritania', locale: 'ar-MR' },
    MU: { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee', countryName: 'Mauritius', locale: 'en-MU' },
    MX: { code: 'MXN', symbol: '$', name: 'Mexican Peso', countryName: 'Mexico', locale: 'es-MX' },
    FM: { code: 'USD', symbol: '$', name: 'US Dollar', countryName: 'Micronesia', locale: 'en-FM' },
    MD: { code: 'MDL', symbol: 'L', name: 'Moldovan Leu', countryName: 'Moldova', locale: 'ro-MD' },
    MC: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Monaco', locale: 'fr-MC' },
    MN: { code: 'MNT', symbol: '₮', name: 'Mongolian Tögrög', countryName: 'Mongolia', locale: 'mn-MN' },
    ME: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Montenegro', locale: 'sr-ME' },
    MA: { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham', countryName: 'Morocco', locale: 'ar-MA' },
    MZ: { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical', countryName: 'Mozambique', locale: 'pt-MZ' },
    MM: { code: 'MMK', symbol: 'Ks', name: 'Myanmar Kyat', countryName: 'Myanmar', locale: 'my-MM' },
    NA: { code: 'NAD', symbol: '$', name: 'Namibian Dollar', countryName: 'Namibia', locale: 'en-NA' },
    NR: { code: 'AUD', symbol: '$', name: 'Australian Dollar', countryName: 'Nauru', locale: 'en-NR' },
    NP: { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee', countryName: 'Nepal', locale: 'ne-NP' },
    NL: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Netherlands', locale: 'nl-NL' },
    NZ: { code: 'NZD', symbol: '$', name: 'New Zealand Dollar', countryName: 'New Zealand', locale: 'en-NZ' },
    NI: { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba', countryName: 'Nicaragua', locale: 'es-NI' },
    NE: { code: 'XOF', symbol: 'Fr', name: 'West African CFA Franc', countryName: 'Niger', locale: 'fr-NE' },
    NG: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', countryName: 'Nigeria', locale: 'en-NG' },
    KP: { code: 'KPW', symbol: '₩', name: 'North Korean Won', countryName: 'North Korea', locale: 'ko-KP' },
    MK: { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar', countryName: 'North Macedonia', locale: 'mk-MK' },
    NO: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', countryName: 'Norway', locale: 'no-NO' },
    OM: { code: 'OMR', symbol: 'ر.ع', name: 'Omani Rial', countryName: 'Oman', locale: 'ar-OM' },
    PK: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', countryName: 'Pakistan', locale: 'ur-PK' },
    PW: { code: 'USD', symbol: '$', name: 'US Dollar', countryName: 'Palau', locale: 'en-PW' },
    PS: { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel', countryName: 'Palestine', locale: 'ar-PS' },
    PA: { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa', countryName: 'Panama', locale: 'es-PA' },
    PG: { code: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina', countryName: 'Papua New Guinea', locale: 'en-PG' },
    PY: { code: 'PYG', symbol: '₲', name: 'Paraguayan Guaraní', countryName: 'Paraguay', locale: 'es-PY' },
    PE: { code: 'PEN', symbol: 'S/.', name: 'Peruvian Sol', countryName: 'Peru', locale: 'es-PE' },
    PH: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', countryName: 'Philippines', locale: 'en-PH' },
    PL: { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', countryName: 'Poland', locale: 'pl-PL' },
    PT: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Portugal', locale: 'pt-PT' },
    QA: { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', countryName: 'Qatar', locale: 'ar-QA' },
    RO: { code: 'RON', symbol: 'lei', name: 'Romanian Leu', countryName: 'Romania', locale: 'ro-RO' },
    RU: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', countryName: 'Russia', locale: 'ru-RU' },
    RW: { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', countryName: 'Rwanda', locale: 'rn-RW' },
    KN: { code: 'XCD', symbol: '$', name: 'East Caribbean Dollar', countryName: 'Saint Kitts and Nevis', locale: 'en-KN' },
    LC: { code: 'XCD', symbol: '$', name: 'East Caribbean Dollar', countryName: 'Saint Lucia', locale: 'en-LC' },
    VC: { code: 'XCD', symbol: '$', name: 'East Caribbean Dollar', countryName: 'Saint Vincent and the Grenadines', locale: 'en-VC' },
    WS: { code: 'WST', symbol: 'T', name: 'Samoan Tala', countryName: 'Samoa', locale: 'sm-WS' },
    SM: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'San Marino', locale: 'it-SM' },
    ST: { code: 'STN', symbol: 'Db', name: 'Dobra', countryName: 'Sao Tome and Principe', locale: 'pt-ST' },
    SA: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', countryName: 'Saudi Arabia', locale: 'ar-SA' },
    SN: { code: 'XOF', symbol: 'Fr', name: 'West African CFA Franc', countryName: 'Senegal', locale: 'fr-SN' },
    RS: { code: 'RSD', symbol: 'дин', name: 'Serbian Dinar', countryName: 'Serbia', locale: 'sr-RS' },
    SC: { code: 'SCR', symbol: '₨', name: 'Seychellois Rupee', countryName: 'Seychelles', locale: 'en-SC' },
    SL: { code: 'SLL', symbol: 'Le', name: 'Leone', countryName: 'Sierra Leone', locale: 'en-SL' },
    SG: { code: 'SGD', symbol: '$', name: 'Singapore Dollar', countryName: 'Singapore', locale: 'en-SG' },
    SK: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Slovakia', locale: 'sk-SK' },
    SI: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Slovenia', locale: 'sl-SI' },
    SB: { code: 'SBD', symbol: '$', name: 'Solomon Islands Dollar', countryName: 'Solomon Islands', locale: 'en-SB' },
    SO: { code: 'SOS', symbol: 'Sh.So.', name: 'Somali Shilling', countryName: 'Somalia', locale: 'so-SO' },
    ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand', countryName: 'South Africa', locale: 'en-ZA' },
    KR: { code: 'KRW', symbol: '₩', name: 'South Korean Won', countryName: 'South Korea', locale: 'ko-KR' },
    SS: { code: 'SSP', symbol: '£', name: 'South Sudanese Pound', countryName: 'South Sudan', locale: 'en-SS' },
    ES: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Spain', locale: 'es-ES' },
    LK: { code: 'LKR', symbol: '₨', name: 'Sri Lankan Rupee', countryName: 'Sri Lanka', locale: 'si-LK' },
    SD: { code: 'SDG', symbol: 'ج.س', name: 'Sudanese Pound', countryName: 'Sudan', locale: 'ar-SD' },
    SR: { code: 'SRD', symbol: '$', name: 'Surinamese Dollar', countryName: 'Suriname', locale: 'nl-SR' },
    SE: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', countryName: 'Sweden', locale: 'sv-SE' },
    CH: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', countryName: 'Switzerland', locale: 'de-CH' },
    SY: { code: 'SYP', symbol: '£S', name: 'Syrian Pound', countryName: 'Syria', locale: 'ar-SY' },
    TW: { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar', countryName: 'Taiwan', locale: 'zh-TW' },
    TJ: { code: 'TJS', symbol: 'ЅМ', name: 'Tajikistani Somoni', countryName: 'Tajikistan', locale: 'tg-TJ' },
    TZ: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', countryName: 'Tanzania', locale: 'sw-TZ' },
    TH: { code: 'THB', symbol: '฿', name: 'Thai Baht', countryName: 'Thailand', locale: 'th-TH' },
    TL: { code: 'USD', symbol: '$', name: 'US Dollar', countryName: 'Timor-Leste', locale: 'pt-TL' },
    TG: { code: 'XOF', symbol: 'Fr', name: 'West African CFA Franc', countryName: 'Togo', locale: 'fr-TG' },
    TO: { code: 'TOP', symbol: 'T$', name: 'Tongan Paʻanga', countryName: 'Tonga', locale: 'to-TO' },
    TT: { code: 'TTD', symbol: '$', name: 'Trinidad and Tobago Dollar', countryName: 'Trinidad and Tobago', locale: 'en-TT' },
    TN: { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar', countryName: 'Tunisia', locale: 'ar-TN' },
    TR: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', countryName: 'Turkey', locale: 'tr-TR' },
    TM: { code: 'TMT', symbol: 'm', name: 'Turkmenistan Manat', countryName: 'Turkmenistan', locale: 'tk-TM' },
    TV: { code: 'AUD', symbol: '$', name: 'Australian Dollar', countryName: 'Tuvalu', locale: 'en-TV' },
    UG: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', countryName: 'Uganda', locale: 'en-UG' },
    UA: { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', countryName: 'Ukraine', locale: 'uk-UA' },
    AE: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', countryName: 'United Arab Emirates', locale: 'ar-AE' },
    GB: { code: 'GBP', symbol: '£', name: 'Pound Sterling', countryName: 'United Kingdom', locale: 'en-GB' },
    US: { code: 'USD', symbol: '$', name: 'US Dollar', countryName: 'United States', locale: 'en-US' },
    UY: { code: 'UYU', symbol: '$', name: 'Uruguayan Peso', countryName: 'Uruguay', locale: 'es-UY' },
    UZ: { code: 'UZS', symbol: 'soʻm', name: 'Uzbekistani Som', countryName: 'Uzbekistan', locale: 'uz-UZ' },
    VU: { code: 'VUV', symbol: 'VT', name: 'Vanuatu Vatu', countryName: 'Vanuatu', locale: 'bi-VU' },
    VA: { code: 'EUR', symbol: '€', name: 'Euro', countryName: 'Vatican City', locale: 'it-VA' },
    VE: { code: 'VES', symbol: 'Bs.S', name: 'Venezuelan Bolívar', countryName: 'Venezuela', locale: 'es-VE' },
    VN: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', countryName: 'Vietnam', locale: 'vi-VN' },
    YE: { code: 'YER', symbol: '﷼', name: 'Yemeni Rial', countryName: 'Yemen', locale: 'ar-YE' },
    ZM: { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha', countryName: 'Zambia', locale: 'en-ZM' },
    ZW: { code: 'ZWL', symbol: '$', name: 'Zimbabwean Dollar', countryName: 'Zimbabwe', locale: 'en-ZW' },
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

/**
 * Get country flag emoji from country code
 */
export const getCountryFlag = (countryCode: string): string => {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

