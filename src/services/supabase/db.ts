import { supabase } from './client';
import { Product, Sale } from '../../types';

import { decode } from 'base64-arraybuffer';


class SupabaseService {

    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = today.getTime();

        try {
            const [
                { count: totalProducts },
                { count: lowStockItems },
                { data: todaySales }
            ] = await Promise.all([
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock_quantity', 5).gt('stock_quantity', 0),
                supabase.from('sales').select('total_revenue, profit').gte('sale_date', startOfDay)
            ]);

            const todayRevenue = todaySales?.reduce((sum, sale) => sum + (sale.total_revenue || 0), 0) || 0;
            const todayProfit = todaySales?.reduce((sum, sale) => sum + (sale.profit || 0), 0) || 0;

            return {
                totalProducts: totalProducts || 0,
                lowStockItems: lowStockItems || 0,
                todayRevenue,
                todayProfit,
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                totalProducts: 0,
                lowStockItems: 0,
                todayRevenue: 0,
                todayProfit: 0,
            };
        }
    }

    async getLowStockProducts(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .lte('stock_quantity', 5)
            .gt('stock_quantity', 0)
            .limit(3);

        if (error) {
            console.error('Error fetching low stock products:', error);
            return [];
        }

        return data.map(this.mapToProduct);
    }

    async getTodaySales(): Promise<Sale[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = today.getTime();

        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .gte('sale_date', startOfDay)
            .order('sale_date', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching today sales:', error);
            return [];
        }

        return data.map(this.mapToSale);
    }

    async getAllSales(): Promise<Sale[]> {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .order('sale_date', { ascending: false });

        if (error) {
            console.error('Error fetching all sales:', error);
            return [];
        }

        return data.map(this.mapToSale);
    }

    async getAllProducts(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all products:', error);
            return [];
        }

        return data.map(this.mapToProduct);
    }

    async searchProducts(query: string): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .ilike('name', `%${query}%`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error searching products:', error);
            return [];
        }

        return data.map(this.mapToProduct);
    }

    async createSale(sale: Omit<Sale, 'id' | 'createdAt' | 'synced'>, userId: string): Promise<Sale> {
        const { data, error } = await supabase
            .from('sales')
            .insert({
                product_id: sale.productId,
                quantity: sale.quantity,
                unit_price: sale.unitPrice,
                cost_price: sale.costPrice,
                total_revenue: sale.totalRevenue,
                total_cost: sale.totalCost,
                profit: sale.profit,
                sale_date: sale.saleDate,
                user_id: userId,
            })
            .select()
            .single();

        if (error) throw error;

        // Update product stock
        const { data: product } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', sale.productId)
            .single();

        if (product) {
            await supabase
                .from('products')
                .update({ stock_quantity: product.stock_quantity - sale.quantity })
                .eq('id', sale.productId);
        }

        return this.mapToSale(data);
    }

    async uploadProductImage(uri: string): Promise<string> {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();

            const fileName = `${Date.now()}.jpg`;
            const filePath = `product-images/${fileName}`;

            const { data, error } = await supabase.storage
                .from('products')
                .upload(filePath, arrayBuffer, {
                    contentType: 'image/jpeg',
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    async updateProduct(product: Product): Promise<void> {
        const { error } = await supabase
            .from('products')
            .update({
                name: product.name,
                sku: product.sku,
                category: product.category,
                cost_price: product.costPrice,
                selling_price: product.sellingPrice,
                stock_quantity: product.stockQuantity,
                low_stock_threshold: product.lowStockThreshold,
                barcode: product.barcode,
                image_url: product.imageUrl,
                updated_at: new Date().toISOString(),
            })
            .eq('id', product.id);

        if (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(id: string): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    async getSalesByDateRange(startDate: number, endDate: number): Promise<Sale[]> {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .gte('sale_date', startDate)
            .lte('sale_date', endDate)
            .order('sale_date', { ascending: false });

        if (error) {
            console.error('Error fetching sales by date range:', error);
            return [];
        }

        return data.map(this.mapToSale);
    }

    private mapToProduct(row: any): Product {
        return {
            id: row.id,
            name: row.name,
            sku: row.sku,
            category: row.category,
            costPrice: row.cost_price,
            sellingPrice: row.selling_price,
            stockQuantity: row.stock_quantity,
            lowStockThreshold: row.low_stock_threshold,
            barcode: row.barcode,
            imageUrl: row.image_url,
            createdAt: new Date(row.created_at).getTime(),
            updatedAt: new Date(row.updated_at || row.created_at).getTime(),
            synced: true,
        };
    }

    private mapToSale(row: any): Sale {
        return {
            id: row.id,
            productId: row.product_id,
            quantity: row.quantity,
            unitPrice: row.unit_price,
            costPrice: row.cost_price,
            totalRevenue: row.total_revenue,
            totalCost: row.total_cost,
            profit: row.profit,
            saleDate: row.sale_date,
            createdAt: new Date(row.created_at).getTime(),
            synced: true,
        };
    }
}

export const supabaseService = new SupabaseService();
