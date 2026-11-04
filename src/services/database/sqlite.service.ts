/**
 * SQLite Database Service
 * Handles all local database operations for SmartTrade
 */

import * as SQLite from 'expo-sqlite';
import { DB_NAME } from '../../constants/config';
import type { Product, Sale, OutboxItem } from '../../types';

class DatabaseService {
    private db: SQLite.SQLiteDatabase | null = null;
    private currentUserId: string | null = null;

    /**
     * Initialize database and create tables
     */
    async init(userId: string): Promise<void> {
        if (!userId) throw new Error('A signed-in user is required to open local SmartTrade data');
        if (this.db && this.currentUserId === userId) return;
        if (this.db && this.currentUserId !== userId) {
            await this.db.closeAsync();
            this.db = null;
            this.currentUserId = null;
        }
        try {
            const suffix = userId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 32);
            let hash = 2166136261;
            for (let index = 0; index < userId.length; index += 1) {
                hash ^= userId.charCodeAt(index);
                hash = Math.imul(hash, 16777619);
            }
            const scopedDatabaseName = `${DB_NAME.replace(/\.db$/, '')}-${suffix}-${(hash >>> 0).toString(16)}.db`;
            this.db = await SQLite.openDatabaseAsync(scopedDatabaseName);
            this.currentUserId = userId;
            await this.createTables();
            console.log('✅ Database initialized successfully');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create all database tables
     */
    private async createTables(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        // Products table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT UNIQUE,
        category TEXT,
        cost_price REAL NOT NULL,
        selling_price REAL NOT NULL,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 5,
        barcode TEXT,
        image_url TEXT,
        image_object_key TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        synced INTEGER DEFAULT 0
      );
    `);

        const productColumns = await this.db.getAllAsync<{ name: string }>('PRAGMA table_info(products)');
        if (!productColumns.some((column) => column.name === 'image_object_key')) {
            await this.db.execAsync('ALTER TABLE products ADD COLUMN image_object_key TEXT');
        }

        // Sales table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        cost_price REAL NOT NULL,
        total_revenue REAL NOT NULL,
        total_cost REAL NOT NULL,
        profit REAL NOT NULL,
        sale_date INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);

        // Outbox table for sync queue
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS outbox (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        retry_count INTEGER DEFAULT 0,
        last_error TEXT
      );
    `);

        const outboxColumns = await this.db.getAllAsync<{ name: string }>('PRAGMA table_info(outbox)');
        if (!outboxColumns.some((column) => column.name === 'last_error')) {
            await this.db.execAsync('ALTER TABLE outbox ADD COLUMN last_error TEXT');
        }

        // Settings table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

        // Create indexes for performance
        await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
      CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
      CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
      CREATE INDEX IF NOT EXISTS idx_outbox_created ON outbox(created_at);
    `);
    }

    /**
     * Get database instance
     */
    getDb(): SQLite.SQLiteDatabase {
        if (!this.db) throw new Error('Database not initialized');
        return this.db;
    }

    // ==================== PRODUCT OPERATIONS ====================

    /**
     * Create a new product
     */
    async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<Product> {
        if (!this.db) throw new Error('Database not initialized');

        const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();

        const newProduct: Product = {
            id,
            ...product,
            createdAt: now,
            updatedAt: now,
            synced: false,
        };

        await this.db.withTransactionAsync(async () => {
            await this.db!.runAsync(
                `INSERT INTO products (id, name, sku, category, cost_price, selling_price, stock_quantity,
                 low_stock_threshold, barcode, image_url, image_object_key, created_at, updated_at, synced)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [newProduct.id, newProduct.name, newProduct.sku || null, newProduct.category || null,
                 newProduct.costPrice, newProduct.sellingPrice, newProduct.stockQuantity,
                 newProduct.lowStockThreshold, newProduct.barcode || null, newProduct.imageUrl || null, newProduct.imageObjectKey || null,
                 newProduct.createdAt, newProduct.updatedAt, 0]
            );
            await this.addToOutbox('product', id, 'INSERT', newProduct);
        });

        return newProduct;
    }

    /**
     * Get all products
     */
    async getAllProducts(): Promise<Product[]> {
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.getAllAsync<any>(
            'SELECT * FROM products ORDER BY created_at DESC'
        );

        return result.map(this.mapRowToProduct);
    }

    /**
     * Refresh the local read cache from the authenticated server.
     * Never overwrite unsynced local edits.
     */
    async cacheProducts(products: Product[]): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.withTransactionAsync(async () => {
            for (const product of products) {
                await this.db!.runAsync(
                    `INSERT INTO products
                     (id,name,sku,category,cost_price,selling_price,stock_quantity,low_stock_threshold,
                      barcode,image_url,image_object_key,created_at,updated_at,synced)
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)
                     ON CONFLICT(id) DO UPDATE SET
                       name=excluded.name,sku=excluded.sku,category=excluded.category,
                       cost_price=excluded.cost_price,selling_price=excluded.selling_price,
                       stock_quantity=excluded.stock_quantity,low_stock_threshold=excluded.low_stock_threshold,
                       barcode=excluded.barcode,image_url=excluded.image_url,image_object_key=excluded.image_object_key,
                       updated_at=excluded.updated_at,synced=1
                     WHERE products.synced=1`,
                    [product.id, product.name, product.sku || null, product.category || null,
                     product.costPrice, product.sellingPrice, product.stockQuantity,
                     product.lowStockThreshold, product.barcode || null, product.imageUrl || null,
                     product.imageObjectKey || null, product.createdAt, product.updatedAt]
                );
            }
        });
    }

    /**
     * Get product by ID
     */
    async getProductById(id: string): Promise<Product | null> {
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.getFirstAsync<any>(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );

        return result ? this.mapRowToProduct(result) : null;
    }

    /**
     * Update product
     */
    async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
        if (!this.db) throw new Error('Database not initialized');

        const existing = await this.getProductById(id);
        if (!existing) throw new Error('Product not found');

        const updated: Product = {
            ...existing,
            ...updates,
            id, // Ensure ID doesn't change
            updatedAt: Date.now(),
            synced: false,
        };

        await this.db.withTransactionAsync(async () => {
            await this.db!.runAsync(
                `UPDATE products SET name = ?, sku = ?, category = ?, cost_price = ?, selling_price = ?,
                 stock_quantity = ?, low_stock_threshold = ?, barcode = ?, image_url = ?, image_object_key = ?,
                 updated_at = ?, synced = ? WHERE id = ?`,
                [updated.name, updated.sku || null, updated.category || null, updated.costPrice,
                 updated.sellingPrice, updated.stockQuantity, updated.lowStockThreshold,
                 updated.barcode || null, updated.imageUrl || null, updated.imageObjectKey || null, updated.updatedAt, 0, id]
            );
            await this.addToOutbox('product', id, 'UPDATE', updated);
        });

        return updated;
    }

    /**
     * Delete product
     */
    async deleteProduct(id: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.withTransactionAsync(async () => {
            await this.addToOutbox('product', id, 'DELETE', { id });
            await this.db!.runAsync('DELETE FROM products WHERE id = ?', [id]);
        });
    }

    /**
     * Search products
     */
    async searchProducts(query: string, category?: string): Promise<Product[]> {
        if (!this.db) throw new Error('Database not initialized');

        let sql = 'SELECT * FROM products WHERE (name LIKE ? OR sku LIKE ? OR barcode LIKE ?)';
        const params: any[] = [`%${query}%`, `%${query}%`, `%${query}%`];

        if (category && category !== 'All Categories') {
            sql += ' AND category = ?';
            params.push(category);
        }

        sql += ' ORDER BY created_at DESC';

        const result = await this.db.getAllAsync<any>(sql, params);
        return result.map(this.mapRowToProduct);
    }

    /**
     * Get low stock products
     */
    async getLowStockProducts(): Promise<Product[]> {
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.getAllAsync<any>(
            'SELECT * FROM products WHERE stock_quantity <= low_stock_threshold AND stock_quantity > 0 ORDER BY stock_quantity ASC'
        );

        return result.map(this.mapRowToProduct);
    }

    /**
     * Get out of stock products
     */
    async getOutOfStockProducts(): Promise<Product[]> {
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.getAllAsync<any>(
            'SELECT * FROM products WHERE stock_quantity = 0 ORDER BY name ASC'
        );

        return result.map(this.mapRowToProduct);
    }

    // ==================== SALES OPERATIONS ====================

    /**
     * Create a new sale
     */
    async createSale(sale: Omit<Sale, 'id' | 'createdAt' | 'synced'>): Promise<Sale> {
        if (!this.db) throw new Error('Database not initialized');

        const id = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();

        const newSale: Sale = {
            id,
            ...sale,
            createdAt: now,
            synced: false,
        };

        // Keep the sale, stock decrement and outbox event in one transaction.
        // A failed stock check or insert rolls back all three writes.
        await this.db.withTransactionAsync(async () => {
            const stockUpdate = await this.db!.runAsync(
                `UPDATE products
                 SET stock_quantity = stock_quantity - ?, updated_at = ?, synced = 0
                 WHERE id = ? AND stock_quantity >= ?`,
                [newSale.quantity, now, newSale.productId, newSale.quantity]
            );

            if (stockUpdate.changes !== 1) {
                const product = await this.db!.getFirstAsync<{ id: string }>(
                    'SELECT id FROM products WHERE id = ?',
                    [newSale.productId]
                );
                if (!product) throw new Error('Product not found');
                throw new Error('Insufficient stock');
            }

            await this.db!.runAsync(
                `INSERT INTO sales (id, product_id, quantity, unit_price, cost_price, total_revenue,
                 total_cost, profit, sale_date, created_at, synced)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newSale.id,
                    newSale.productId,
                    newSale.quantity,
                    newSale.unitPrice,
                    newSale.costPrice,
                    newSale.totalRevenue,
                    newSale.totalCost,
                    newSale.profit,
                    newSale.saleDate,
                    newSale.createdAt,
                    0,
                ]
            );

            await this.addToOutbox('sale', id, 'INSERT', newSale);
        });

        return newSale;
    }

    /**
     * Get all sales
     */
    async getAllSales(): Promise<Sale[]> {
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.getAllAsync<any>(
            'SELECT * FROM sales ORDER BY sale_date DESC'
        );

        return result.map(this.mapRowToSale);
    }

    /**
     * Cache server sales without overwriting pending local sales.
     */
    async cacheSales(sales: Sale[]): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.withTransactionAsync(async () => {
            for (const sale of sales) {
                await this.db!.runAsync(
                    `INSERT INTO sales
                     (id,product_id,quantity,unit_price,cost_price,total_revenue,total_cost,profit,
                      sale_date,created_at,synced)
                     VALUES (?,?,?,?,?,?,?,?,?,?,1)
                     ON CONFLICT(id) DO UPDATE SET
                       product_id=excluded.product_id,quantity=excluded.quantity,
                       unit_price=excluded.unit_price,cost_price=excluded.cost_price,
                       total_revenue=excluded.total_revenue,total_cost=excluded.total_cost,
                       profit=excluded.profit,sale_date=excluded.sale_date,synced=1
                     WHERE sales.synced=1`,
                    [sale.id, sale.productId, sale.quantity, sale.unitPrice, sale.costPrice,
                     sale.totalRevenue, sale.totalCost, sale.profit, sale.saleDate, sale.createdAt]
                );
            }
        });
    }

    /**
     * Get sales by date range
     */
    async getSalesByDateRange(startDate: number, endDate: number): Promise<Sale[]> {
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.getAllAsync<any>(
            'SELECT * FROM sales WHERE sale_date >= ? AND sale_date <= ? ORDER BY sale_date DESC',
            [startDate, endDate]
        );

        return result.map(this.mapRowToSale);
    }

    /**
     * Get sales for today
     */
    async getTodaySales(): Promise<Sale[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = today.getTime();
        const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

        return this.getSalesByDateRange(startOfDay, endOfDay);
    }

    // ==================== OUTBOX OPERATIONS ====================

    /**
     * Add item to outbox for sync
     */
    private async addToOutbox(
        entityType: 'product' | 'sale',
        entityId: string,
        operation: 'INSERT' | 'UPDATE' | 'DELETE',
        payload: any
    ): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const id = `outbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await this.db.runAsync(
            'INSERT INTO outbox (id, entity_type, entity_id, operation, payload, created_at, retry_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, entityType, entityId, operation, JSON.stringify(payload), Date.now(), 0]
        );
    }

    /**
     * Get all outbox items
     */
    async getOutboxItems(): Promise<OutboxItem[]> {
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.getAllAsync<any>(
            'SELECT * FROM outbox ORDER BY created_at ASC'
        );

        return result.map(this.mapRowToOutboxItem);
    }

    /**
     * Acknowledge a synced outbox item and update its local entity atomically.
     */
    async acknowledgeOutboxItem(item: OutboxItem): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.withTransactionAsync(async () => {
            await this.db!.runAsync('DELETE FROM outbox WHERE id = ?', [item.id]);
            if (item.entityType === 'product' && item.operation !== 'DELETE') {
                await this.db!.runAsync(
                    `UPDATE products SET synced = 1 WHERE id = ?
                     AND NOT EXISTS (SELECT 1 FROM outbox WHERE entity_type = 'product' AND entity_id = ?)`,
                    [item.entityId, item.entityId]
                );
            } else if (item.entityType === 'sale') {
                await this.db!.runAsync('UPDATE sales SET synced = 1 WHERE id = ?', [item.entityId]);
                const payload = JSON.parse(item.payload) as Sale;
                await this.db!.runAsync(
                    `UPDATE products SET synced = 1 WHERE id = ?
                     AND NOT EXISTS (SELECT 1 FROM outbox WHERE entity_type = 'product' AND entity_id = ?)`,
                    [payload.productId, payload.productId]
                );
            }
        });
    }

    async recordOutboxFailure(id: string, message: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.runAsync(
            'UPDATE outbox SET retry_count = retry_count + 1, last_error = ? WHERE id = ?',
            [message.slice(0, 500), id]
        );
    }

    async getPendingOutboxCount(): Promise<number> {
        if (!this.db) throw new Error('Database not initialized');
        const row = await this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM outbox');
        return Number(row?.count ?? 0);
    }

    /**
     * Delete outbox item
     */
    async deleteOutboxItem(id: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.runAsync('DELETE FROM outbox WHERE id = ?', [id]);
    }

    /**
     * Clear all outbox items
     */
    async clearOutbox(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.runAsync('DELETE FROM outbox');
    }

    // ==================== SETTINGS OPERATIONS ====================

    /**
     * Get setting value
     */
    async getSetting(key: string): Promise<string | null> {
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.getFirstAsync<{ value: string }>(
            'SELECT value FROM settings WHERE key = ?',
            [key]
        );

        return result?.value || null;
    }

    /**
     * Set setting value
     */
    async setSetting(key: string, value: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.runAsync(
            'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
            [key, value]
        );
    }

    // ==================== HELPER METHODS ====================

    /**
     * Map database row to Product object
     */
    private mapRowToProduct(row: any): Product {
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
            imageObjectKey: row.image_object_key ?? undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            synced: row.synced === 1,
        };
    }

    /**
     * Map database row to Sale object
     */
    private mapRowToSale(row: any): Sale {
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
            createdAt: row.created_at,
            synced: row.synced === 1,
        };
    }

    /**
     * Map database row to OutboxItem object
     */
    private mapRowToOutboxItem(row: any): OutboxItem {
        return {
            id: row.id,
            entityType: row.entity_type,
            entityId: row.entity_id,
            operation: row.operation,
            payload: row.payload,
            createdAt: row.created_at,
            retryCount: row.retry_count,
            lastError: row.last_error ?? null,
        };
    }

    /**
     * Get dashboard statistics
     */
    async getDashboardStats(): Promise<any> {
        if (!this.db) throw new Error('Database not initialized');

        // Get total products
        const totalProducts = await this.db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM products'
        );

        // Get low stock items
        const lowStockItems = await this.db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM products WHERE stock_quantity <= low_stock_threshold AND stock_quantity > 0'
        );

        // Get out of stock items
        const outOfStockItems = await this.db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM products WHERE stock_quantity = 0'
        );

        // Get stock value
        const stockValue = await this.db.getFirstAsync<{ total: number }>(
            'SELECT SUM(stock_quantity * cost_price) as total FROM products'
        );

        // Get today's sales
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = today.getTime();
        const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

        const todayStats = await this.db.getFirstAsync<any>(
            `SELECT 
        COUNT(*) as sales_count,
        COALESCE(SUM(total_revenue), 0) as revenue,
        COALESCE(SUM(profit), 0) as profit
       FROM sales WHERE sale_date >= ? AND sale_date <= ?`,
            [startOfDay, endOfDay]
        );

        return {
            totalProducts: totalProducts?.count || 0,
            lowStockItems: lowStockItems?.count || 0,
            outOfStockItems: outOfStockItems?.count || 0,
            stockValue: stockValue?.total || 0,
            todayRevenue: todayStats?.revenue || 0,
            todayProfit: todayStats?.profit || 0,
            todaySales: todayStats?.sales_count || 0,
        };
    }
}

// Export singleton instance
export const dbService = new DatabaseService();
