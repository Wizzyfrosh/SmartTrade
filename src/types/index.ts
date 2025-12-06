/**
 * SmartTrade Type Definitions
 * All TypeScript interfaces and types for the application
 */

export interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  barcode?: string;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export interface Sale {
  id: string;
  productId: string;
  productName?: string; // For display purposes
  quantity: number;
  unitPrice: number;
  costPrice: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  saleDate: number;
  createdAt: number;
  synced: boolean;
}

export interface OutboxItem {
  id: string;
  entityType: 'product' | 'sale';
  entityId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: string; // JSON stringified data
  createdAt: number;
  retryCount: number;
}

export interface UserProfile {
  id: string;
  email?: string;
  fullName?: string;
  businessName?: string;
  countryCode?: string;
  currencyCode?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  todayRevenue: number;
  todayProfit: number;
  todaySales: number;
  stockValue: number;
}

export interface ReportPeriod {
  label: string;
  value: 'today' | 'week' | 'month' | 'custom';
  startDate: number;
  endDate: number;
}

export interface SalesReport {
  totalSales: number;
  itemsSold: number;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime?: number;
  pendingItems: number;
  syncError?: string;
}

export type AuthMethod = 'pin' | 'email' | 'google';

export interface AppSettings {
  currencyCode: string;
  currencySymbol: string;
  lowStockThreshold: number;
  autoSync: boolean;
  theme: 'light' | 'dark';
}
