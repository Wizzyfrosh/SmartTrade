import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { EmptyState, Button, StatCard, Card } from '../../src/components';
import { supabaseService } from '../../src/services/supabase/db';
import { exportSalesReport, exportInventory } from '../../src/utils/csv-export';
import { formatCurrency } from '../../src/utils/currency';
import { getDateRange } from '../../src/utils/date';
import { useSettings } from '../../src/contexts/SettingsContext';
import type { Sale, Product } from '../../src/types';

type Period = 'today' | 'week' | 'month';

export default function Reports() {
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState<Period>('today');
    const [sales, setSales] = useState<Sale[]>([]);
    const [expenses, setExpenses] = useState(0); // Placeholder if we had expense tracking
    const [products, setProducts] = useState<Product[]>([]);
    const { currency, colors } = useSettings();
    const styles = useMemo(() => createStyles(colors), [colors]);

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Get Date Range
            const { start, end } = getDateRange(period);

            // 2. Fetch Sales
            const salesData = await supabaseService.getSalesByDateRange(start, end);
            setSales(salesData);

            // 3. Fetch Products (for inventory export and calculations)
            const productsData = await supabaseService.getAllProducts();
            setProducts(productsData);

        } catch (error) {
            console.error('Error loading report data:', error);
            Alert.alert('Error', 'Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
        const totalCost = sales.reduce((sum, sale) => sum + sale.totalCost, 0);
        const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
        const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
        const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        return {
            revenue: totalRevenue,
            cost: totalCost,
            profit: totalProfit,
            items: totalItemsSold,
            margin: margin.toFixed(1) + '%',
        };
    };

    const handleExportSales = async () => {
        try {
            if (sales.length === 0) {
                Alert.alert('No Data', 'There are no sales to export for this period.');
                return;
            }
            await exportSalesReport(sales, products, currency, period);
            Alert.alert('Success', 'Sales report exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to export sales report');
        }
    };

    const handleExportInventory = async () => {
        try {
            if (products.length === 0) {
                Alert.alert('No Data', 'There are no products to export.');
                return;
            }
            await exportInventory(products, currency);
            Alert.alert('Success', 'Inventory exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to export inventory');
        }
    };

    const stats = calculateStats();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sales Reports</Text>
                <Text style={styles.headerSubtitle}>Analyze your business performance</Text>
            </View>

            <View style={styles.content}>
                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    {(['today', 'week', 'month'] as Period[]).map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.periodTab, period === p && styles.periodTabActive]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <View style={styles.statsGrid}>
                                <View style={styles.statHalf}>
                                    <StatCard
                                        icon={<Ionicons name="cash" size={24} color={colors.primary} />}
                                        label="Revenue"
                                        value={formatCurrency(stats.revenue, currency)}
                                        backgroundColor={colors.mintBg}
                                    />
                                </View>
                                <View style={styles.statHalf}>
                                    <StatCard
                                        icon={<Ionicons name="trending-up" size={24} color={colors.blue} />}
                                        label="Profit"
                                        value={formatCurrency(stats.profit, currency)}
                                        backgroundColor={colors.blueBg}
                                    />
                                </View>
                            </View>

                            <View style={styles.statsGrid}>
                                <View style={styles.statHalf}>
                                    <StatCard
                                        icon={<Ionicons name="cart" size={24} color={colors.orange} />}
                                        label="Items Sold"
                                        value={stats.items}
                                        backgroundColor={colors.orangeBg}
                                    />
                                </View>
                                <View style={styles.statHalf}>
                                    <StatCard
                                        icon={<Ionicons name="pie-chart" size={24} color={colors.purple} />}
                                        label="Margin"
                                        value={stats.margin}
                                        backgroundColor={colors.purpleLight}
                                    />
                                </View>
                            </View>

                            {/* Export Actions */}
                            <Text style={styles.sectionTitle}>Quick Actions</Text>

                            <TouchableOpacity style={styles.actionButton} onPress={handleExportSales}>
                                <View style={[styles.actionIcon, { backgroundColor: colors.blueBg }]}>
                                    <Ionicons name="download-outline" size={24} color={colors.blue} />
                                </View>
                                <View style={styles.actionInfo}>
                                    <Text style={styles.actionTitle}>Export Sales Report</Text>
                                    <Text style={styles.actionDesc}>Download CSV of sales for this period</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton} onPress={handleExportInventory}>
                                <View style={[styles.actionIcon, { backgroundColor: colors.orangeBg }]}>
                                    <Ionicons name="list-outline" size={24} color={colors.orange} />
                                </View>
                                <View style={styles.actionInfo}>
                                    <Text style={styles.actionTitle}>Export Inventory</Text>
                                    <Text style={styles.actionDesc}>Download full inventory list as CSV</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerTitle: {
        fontSize: Typography['2xl'],
        fontWeight: Typography.bold,
        color: colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    headerSubtitle: {
        fontSize: Typography.sm,
        color: colors.textSecondary,
    },
    content: {
        flex: 1,
    },
    periodSelector: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    periodTab: {
        flex: 1,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        borderRadius: BorderRadius.full,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
    },
    periodTabActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    periodText: {
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
        color: colors.textSecondary,
    },
    periodTextActive: {
        color: colors.textWhite,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingTop: 0,
    },
    loader: {
        marginTop: Spacing.xl,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    statHalf: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: Typography.lg,
        fontWeight: Typography.semibold,
        color: colors.textPrimary,
        marginVertical: Spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: colors.cardBackground,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadows.sm,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    actionInfo: {
        flex: 1,
    },
    actionTitle: {
        fontSize: Typography.base,
        fontWeight: Typography.medium,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    actionDesc: {
        fontSize: Typography.xs,
        color: colors.textSecondary,
    },
});
