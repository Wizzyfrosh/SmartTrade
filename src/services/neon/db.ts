import { Product, Sale } from "../../types";
import { authenticatedFetch } from "../auth/request";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await authenticatedFetch(path, init);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Request failed");
  return payload as T;
}

function mapProduct(row: any, signedUrls: Record<string, string> = {}): Product {
  const key = row.imageObjectKey || row.image_object_key || undefined;
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    costPrice: Number(row.costPrice ?? row.cost_price ?? 0),
    sellingPrice: Number(row.sellingPrice ?? row.selling_price ?? 0),
    stockQuantity: Number(row.stockQuantity ?? row.stock_quantity ?? 0),
    lowStockThreshold: Number(row.lowStockThreshold ?? row.low_stock_threshold ?? 5),
    barcode: row.barcode,
    imageUrl: row.imageUrl || row.image_url || (key ? signedUrls[key] : undefined),
    imageObjectKey: key,
    createdAt: typeof row.createdAt === "number" ? row.createdAt : new Date(row.created_at).getTime(),
    updatedAt: typeof row.updatedAt === "number" ? row.updatedAt : new Date(row.updated_at || row.created_at).getTime(),
    synced: true,
  };
}

function mapSale(row: any): Sale {
  return {
    id: row.id,
    productId: row.productId || row.product_id,
    productName: row.productName || row.product_name,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unitPrice ?? row.unit_price),
    costPrice: Number(row.costPrice ?? row.cost_price),
    totalRevenue: Number(row.totalRevenue ?? row.total_revenue),
    totalCost: Number(row.totalCost ?? row.total_cost),
    profit: Number(row.profit),
    saleDate: Number(row.saleDate ?? row.sale_date),
    createdAt: typeof row.createdAt === "number" ? row.createdAt : new Date(row.created_at).getTime(),
    synced: true,
  };
}

class NeonService {
  async getDashboardStats() {
    return request("/api/data/dashboard");
  }

  private async mapProducts(rows: any[]): Promise<Product[]> {
    const keys = [...new Set(rows.map((row) => row.imageObjectKey || row.image_object_key).filter(Boolean))] as string[];
    const signedUrls = keys.length
      ? await request<Record<string, string>>("/api/storage/download-urls", {
          method: "POST",
          body: JSON.stringify({ keys }),
        })
      : {};
    return rows.map((row) => mapProduct(row, signedUrls));
  }

  async getLowStockProducts(): Promise<Product[]> {
    const rows = await request<any[]>("/api/data/low-stock");
    return this.mapProducts(rows);
  }

  async getTodaySales(): Promise<Sale[]> {
    const rows = await request<any[]>("/api/data/today-sales");
    return rows.map(mapSale);
  }

  async getAllSales(): Promise<Sale[]> {
    const rows = await request<any[]>("/api/data/sales");
    return rows.map(mapSale);
  }

  async getAllProducts(): Promise<Product[]> {
    const rows = await request<any[]>("/api/data/products");
    return this.mapProducts(rows);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const rows = await request<any[]>(`/api/data/products?q=${encodeURIComponent(query)}`);
    return Promise.all(rows.map(mapProduct));
  }

  async createSale(sale: Omit<Sale, "id" | "createdAt" | "synced">, _userId?: string): Promise<Sale> {
    const row = await request<any>("/api/data/sales", {
      method: "POST",
      body: JSON.stringify({
        productId: sale.productId,
        quantity: sale.quantity,
        unitPrice: sale.unitPrice,
        saleDate: sale.saleDate,
      }),
    });
    return mapSale(row);
  }

  async uploadPrivateImage(uri: string, purpose: "product" | "avatar" = "product"): Promise<string> {
    const fileResponse = await fetch(uri);
    if (!fileResponse.ok) throw new Error("Could not read selected image");
    const blob = await fileResponse.blob();
    const contentType = blob.type || "image/jpeg";
    const upload = await request<{ uploadUrl: string; key: string }>("/api/storage/upload-url", {
      method: "POST",
      body: JSON.stringify({ purpose, contentType, size: blob.size }),
    });
    const bytes = await blob.arrayBuffer();
    const uploaded = await fetch(upload.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: bytes,
    });
    if (!uploaded.ok) throw new Error("Image upload failed");
    return upload.key;
  }

  async uploadProductImage(uri: string): Promise<string> {
    return this.uploadPrivateImage(uri, "product");
  }

  async getPrivateImageUrl(key: string): Promise<string> {
    return (await signedImageUrl(key)) || "";
  }

  async updateProduct(product: Product): Promise<void> {
    await request(`/api/data/products/${encodeURIComponent(product.id)}`, {
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
        imageObjectKey: product.imageObjectKey || (product.imageUrl?.startsWith("users/") ? product.imageUrl : undefined),
      }),
    });
  }

  async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt" | "synced">): Promise<Product> {
    const row = await request<any>("/api/data/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
    return mapProduct(row);
  }

  async deleteProduct(id: string): Promise<void> {
    await request(`/api/data/products/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  async getSalesByDateRange(startDate: number, endDate: number): Promise<Sale[]> {
    const rows = await request<any[]>(`/api/data/sales-range?start=${startDate}&end=${endDate}`);
    return rows.map(mapSale);
  }
}

export const neonService = new NeonService();
