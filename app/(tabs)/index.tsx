/**
 * Dashboard Screen
 * Main screen showing business overview and quick actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { StatCard, Card, EmptyState, SyncIndicator } from '../../src/components';
import { supabaseService } from '../../src/services/supabase/db';
import { formatCurrency } from '../../src/utils/currency';
import { getGreeting } from '../../src/utils/date';
import { useAuth } from '../../src/contexts/AuthContext';
import type { Product, Sale } from '../../src/types';

export default function Dashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [todaySales, setTodaySales] = useState<Sale[]>([]);
    const [currencyCode] = useState('NGN'); // TODO: Get from settings

    const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load dashboard stats
            const dashboardStats = await supabaseService.getDashboardStats();
            setStats(dashboardStats);

            // Load low stock products
            const lowStock = await supabaseService.getLowStockProducts();
            setLowStockProducts(lowStock);

            // Load today's sales
            const sales = await supabaseService.getTodaySales();
            setTodaySales(sales);

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadDashboardData();
    }, []);

    if (loading && !stats) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()}, {userName}</Text>
                        <Text style={styles.date}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </Text>
                    </View>
                    <SyncIndicator status="synced" lastSyncTime={Date.now()} />
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statsRow}>
                        <StatCard
                            icon={<Ionicons name="cash" size={24} color={Colors.primary} />}
                            label="Today's Revenue"
                            value={formatCurrency(stats?.todayRevenue || 0, currencyCode)}
                            backgroundColor={Colors.mintBg}
                            iconColor={Colors.primary}
                            onPress={() => router.push('/(tabs)/sales')}
                        />
                        <StatCard
                            icon={<Ionicons name="trending-up" size={24} color={Colors.blue} />}
                            label="Today's Profit"
                            value={formatCurrency(stats?.todayProfit || 0, currencyCode)}
                            backgroundColor={Colors.blueBg}
                            iconColor={Colors.blue}
                            onPress={() => router.push('/(tabs)/reports')}
                        />
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard
                            icon={<Ionicons name="cube" size={24} color={Colors.orange} />}
                            label="Total Products"
                            value={stats?.totalProducts || 0}
                            backgroundColor={Colors.orangeBg}
                            iconColor={Colors.orange}
                            onPress={() => router.push('/(tabs)/inventory')}
                        />
                        <StatCard
                            icon={<Ionicons name="alert-circle" size={24} color={Colors.red} />}
                            label="Low Stock"
                            value={stats?.lowStockItems || 0}
                            backgroundColor={Colors.redBg}
                            iconColor={Colors.red}
                            onPress={() => router.push('/(tabs)/inventory')}
                        />
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionGrid}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/sale/add')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: Colors.primary }]}>
                                <Ionicons name="cart-outline" size={24} color={Colors.textWhite} />
                            </View>
                            <Text style={styles.actionLabel}>Record Sale</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/product/add')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: Colors.blue }]}>
                                <Ionicons name="add-circle-outline" size={24} color={Colors.textWhite} />
                            </View>
                            <Text style={styles.actionLabel}>Add Product</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/(tabs)/inventory')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: Colors.orange }]}>
                                <Ionicons name="search-outline" size={24} color={Colors.textWhite} />
                            </View>
                            <Text style={styles.actionLabel}>Search Item</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/(tabs)/reports')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: Colors.purple }]}>
                                <Ionicons name="bar-chart-outline" size={24} color={Colors.textWhite} />
                            </View>
                            <Text style={styles.actionLabel}>View Reports</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Low Stock Alerts */}
                {lowStockProducts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/inventory')}>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        {lowStockProducts.map((product) => (
                            <Card key={product.id} style={styles.alertCard} onPress={() => { }}>
                                <View style={styles.alertContent}>
                                    <View style={styles.alertIcon}>
                                        <Ionicons name="warning" size={20} color={Colors.warning} />
                                    </View>
                                    <View style={styles.alertInfo}>
                                        <Text style={styles.alertProductName}>{product.name}</Text>
                                        <Text style={styles.alertProductStock}>
                                            {product.stockQuantity} {product.stockQuantity === 1 ? 'piece' : 'pieces'} remaining
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.restockButton}
                                        onPress={() => router.push({ pathname: '/product/add', params: { id: product.id } })}
                                    >
                                        <Text style={styles.restockText}>Restock</Text>
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        ))}
                    </View>
                )}

                {/* Recent Sales */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Sales</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/sales')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {todaySales.length === 0 ? (
                        <EmptyState
                            icon={<Ionicons name="cart-outline" size={48} color={Colors.textTertiary} />}
                            title="No sales today"
                            message="Record your first sale to see it here."
                            actionLabel="Record Sale"
                            onAction={() => router.push('/sale/add')}
                        />
                    ) : (
                        todaySales.map((sale) => (
                            <Card key={sale.id} style={styles.saleCard} onPress={() => { }}>
                                <View style={styles.saleContent}>
                                    <View style={[styles.saleIcon, { backgroundColor: Colors.mintBg }]}>
                                        <Ionicons name="checkmark" size={16} color={Colors.primary} />
                                    </View>
                                    <View style={styles.saleInfo}>
                                        <Text style={styles.saleAmount}>{formatCurrency(sale.totalRevenue, currencyCode)}</Text>
                                        <Text style={styles.saleTime}>
                                            {new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    <View style={styles.saleDetails}>
                                        <Text style={styles.saleQuantity}>{sale.quantity} items</Text>
                                        <Text style={styles.saleProfit}>+{formatCurrency(sale.profit, currencyCode)} profit</Text>
                                    </View>
                                </View>
                            </Card>
                        ))
                    )}
                </View>

                <View style={styles.footerSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: Typography.base,
        color: Colors.textSecondary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xl,
    },
    greeting: {
        fontSize: Typography['2xl'],
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    date: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
    },
    statsGrid: {
        gap: Spacing.md,
        marginBottom: Spacing['2xl'],
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    section: {
        marginBottom: Spacing['2xl'],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
    },
    seeAll: {
        fontSize: Typography.sm,
        color: Colors.primary,
        fontWeight: Typography.medium,
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    actionButton: {
        flexBasis: '47%',
        flexGrow: 1,
        backgroundColor: Colors.cardBackground,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        ...Shadows.sm,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    actionLabel: {
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
        color: Colors.textPrimary,
    },
    alertCard: {
        marginBottom: Spacing.sm,
        padding: Spacing.md,
    },
    alertContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    alertIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.orangeBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    alertInfo: {
        flex: 1,
    },
    alertProductName: {
        fontSize: Typography.base,
        fontWeight: Typography.semibold,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    alertProductStock: {
        fontSize: Typography.sm,
        color: Colors.error,
        fontWeight: Typography.medium,
    },
    restockButton: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.primary + '10',
        borderRadius: BorderRadius.full,
    },
    restockText: {
        fontSize: Typography.xs,
        fontWeight: Typography.medium,
        color: Colors.primary,
    },
    saleCard: {
        marginBottom: Spacing.sm,
        padding: Spacing.md,
    },
    saleContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    saleIcon: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    saleInfo: {
        flex: 1,
    },
    saleAmount: {
        fontSize: Typography.base,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
    },
    saleTime: {
        fontSize: Typography.xs,
        color: Colors.textSecondary,
    },
    saleDetails: {
        alignItems: 'flex-end',
    },
    saleQuantity: {
        fontSize: Typography.sm,
        color: Colors.textPrimary,
        fontWeight: Typography.medium,
    },
    saleProfit: {
        fontSize: Typography.xs,
        color: Colors.success,
        fontWeight: Typography.medium,
    },
    footerSpacer: {
        height: 80, // Space for tab bar
    },
});
