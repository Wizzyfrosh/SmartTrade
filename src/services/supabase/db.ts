import type { Product, Sale } from "../../types";
import { apiFetch } from "../auth/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`);
  }
  return payload as T;
}

function mapToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku ?? undefined,
    category: row.category ?? undefined,
    costPrice: Number(row.cost_price),
    sellingPrice: Number(row.selling_price),
    stockQuantity: Number(row.stock_quantity),
    lowStockThreshold: Number(row.low_stock_threshold),
    barcode: row.barcode ?? undefined,
    imageUrl: row.image_url ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at || row.created_at).getTime(),
    synced: true,
  };
}

function mapToSale(row: any): Sale {
  return {
    id: row.id,
    productId: row.product_id,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    costPrice: Number(row.cost_price),
    totalRevenue: Number(row.total_revenue),
    totalCost: Number(row.total_cost),
    profit: Number(row.profit),
    saleDate: Number(row.sale_date),
    createdAt: new Date(row.created_at).getTime(),
    synced: true,
  };
}

class SmartTradeApiService {
  async getDashboardStats() {
    const stats = await request<any>("/api/dashboard");
    return {
      totalProducts: Number(stats.total_products || 0),
      lowStockItems: Number(stats.low_stock_items || 0),
      outOfStockItems: Number(stats.out_of_stock_items || 0),
      stockValue: Number(stats.stock_value || 0),
      todayRevenue: Number(stats.today_revenue || 0),
      todayProfit: Number(stats.today_profit || 0),
      todaySales: Number(stats.today_sales_count || 0),
    };
  }

  async getLowStockProducts(): Promise<Product[]> {
    const products = await this.getAllProducts();
    return products
      .filter((product) => product.stockQuantity > 0 &&
        product.stockQuantity <= product.lowStockThreshold)
      .slice(0, 3);
  }

  async getTodaySales(): Promise<Sale[]> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = start.getTime() + 24 * 60 * 60 * 1000;
    return (await this.getAllSales())
      .filter((sale) => sale.saleDate >= start.getTime() && sale.saleDate < end)
      .slice(0, 5);
  }

  async getAllSales(): Promise<Sale[]> {
    const rows = await request<any[]>("/api/sales");
    return rows.map(mapToSale);
  }

  async getAllProducts(): Promise<Product[]> {
    const rows = await request<any[]>("/api/products");
    return rows.map(mapToProduct);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return this.getAllProducts();
    return (await this.getAllProducts()).filter((product) =>
      product.name.toLowerCase().includes(normalized) ||
      product.sku?.toLowerCase().includes(normalized) ||
      product.barcode?.toLowerCase().includes(normalized)
    );
  }

  async createSale(
    sale: Omit<Sale, "id" | "createdAt" | "synced">,
    _legacyUserId?: string,
  ): Promise<Sale> {
    const row = await request<any>("/api/sales", {
      method: "POST",
      body: JSON.stringify({
        productId: sale.productId,
        quantity: sale.quantity,
        unitPrice: sale.unitPrice,
        saleDate: sale.saleDate,
      }),
    });
    return mapToSale(row);
  }

  async uploadProductImage(_uri: string): Promise<string> {
    throw new Error("Product image uploads are temporarily unavailable while private Neon object storage is being connected.");
  }

  async updateProduct(product: Product): Promise<void> {
    await request(`/api/products/${encodeURIComponent(product.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: product.name,
        sku: product.sku,
        category: product.category,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        barcode: product.barcode,
        imageUrl: product.imageUrl,
      }),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await request(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  async getSalesByDateRange(startDate: number, endDate: number): Promise<Sale[]> {
    return (await this.getAllSales()).filter(
      (sale) => sale.saleDate >= startDate && sale.saleDate <= endDate,
    );
  }
}

export const supabaseService = new SmartTradeApiService();
