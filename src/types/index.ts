/** SmartTrade application data types. */
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
  imageObjectKey?: string;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

 {
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

