/**
 * CSV Export Utility
 * Generate and export CSV files for reports
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { Sale, Product } from '../types';
import { formatDate, formatDateTime } from './date';
import { formatCurrency } from './currency';

/**
 * Convert array of objects to CSV string
 */
const arrayToCSV = (data: any[], headers: string[]): string => {
    const headerRow = headers.join(',');
    const rows = data.map((row) => {
        return headers.map((header) => {
            const value = row[header];
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
        }).join(',');
    });

    return [headerRow, ...rows].join('\n');
};

/**
 * Export sales report to CSV
 */
export const exportSalesReport = async (
    sales: Sale[],
    products: Product[],
    currencyCode: string,
    period: string
): Promise<void> => {
    try {
        // Create product lookup map
        const productMap = new Map(products.map((p) => [p.id, p]));

        // Prepare data for CSV
        const csvData = sales.map((sale) => {
            const product = productMap.get(sale.productId);
            return {
                Date: formatDateTime(sale.saleDate),
                Product: product?.name || 'Unknown',
                SKU: product?.sku || '-',
                Quantity: sale.quantity,
                'Unit Price': formatCurrency(sale.unitPrice, currencyCode, false),
                'Total Revenue': formatCurrency(sale.totalRevenue, currencyCode, false),
                'Total Cost': formatCurrency(sale.totalCost, currencyCode, false),
                Profit: formatCurrency(sale.profit, currencyCode, false),
            };
        });

        // Calculate totals
        const totals = {
            Date: 'TOTAL',
            Product: '',
            SKU: '',
            Quantity: sales.reduce((sum, s) => sum + s.quantity, 0),
            'Unit Price': '',
            'Total Revenue': formatCurrency(
                sales.reduce((sum, s) => sum + s.totalRevenue, 0),
                currencyCode,
                false
            ),
            'Total Cost': formatCurrency(
                sales.reduce((sum, s) => sum + s.totalCost, 0),
                currencyCode,
                false
            ),
            Profit: formatCurrency(
                sales.reduce((sum, s) => sum + s.profit, 0),
                currencyCode,
                false
            ),
        };

        // Add totals row
        csvData.push(totals);

        // Convert to CSV
        const headers = ['Date', 'Product', 'SKU', 'Quantity', 'Unit Price', 'Total Revenue', 'Total Cost', 'Profit'];
        const csv = arrayToCSV(csvData, headers);

        // Save to file
        const fileName = `SmartTrade_Sales_Report_${period}_${formatDate(Date.now(), 'yyyy-MM-dd')}.csv`;
        const fileUri = `${(FileSystem as any).documentDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(fileUri, csv, {
            encoding: 'utf8',
        });

        // Share the file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Export Sales Report',
                UTI: 'public.comma-separated-values-text',
            });
        } else {
            throw new Error('Sharing is not available on this device');
        }

        console.log('✅ CSV exported successfully:', fileName);
    } catch (error) {
        console.error('❌ CSV export failed:', error);
        throw error;
    }
};

/**
 * Export inventory to CSV
 */
export const exportInventory = async (
    products: Product[],
    currencyCode: string
): Promise<void> => {
    try {
        // Prepare data for CSV
        const csvData = products.map((product) => ({
            Name: product.name,
            SKU: product.sku || '-',
            Category: product.category || '-',
            'Cost Price': formatCurrency(product.costPrice, currencyCode, false),
            'Selling Price': formatCurrency(product.sellingPrice, currencyCode, false),
            'Stock Quantity': product.stockQuantity,
            'Low Stock Threshold': product.lowStockThreshold,
            'Stock Value': formatCurrency(
                product.stockQuantity * product.costPrice,
                currencyCode,
                false
            ),
            Barcode: product.barcode || '-',
            'Created Date': formatDate(product.createdAt),
        }));

        // Convert to CSV
        const headers = [
            'Name',
            'SKU',
            'Category',
            'Cost Price',
            'Selling Price',
            'Stock Quantity',
            'Low Stock Threshold',
            'Stock Value',
            'Barcode',
            'Created Date',
        ];
        const csv = arrayToCSV(csvData, headers);

        // Save to file
        const fileName = `SmartTrade_Inventory_${formatDate(Date.now(), 'yyyy-MM-dd')}.csv`;
        const fileUri = `${(FileSystem as any).documentDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(fileUri, csv, {
            encoding: 'utf8',
        });

        // Share the file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Export Inventory',
                UTI: 'public.comma-separated-values-text',
            });
        } else {
            throw new Error('Sharing is not available on this device');
        }

        console.log('✅ CSV exported successfully:', fileName);
    } catch (error) {
        console.error('❌ CSV export failed:', error);
        throw error;
    }
};
