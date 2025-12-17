import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    StatusBar,
    Image,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { StatCard, Card, EmptyState, Button } from '../../src/components';
import { supabaseService } from '../../src/services/supabase/db';
import { formatCurrency } from '../../src/utils/currency';
import { useSettings } from '../../src/contexts/SettingsContext';
import type { Product } from '../../src/types';

export default function Inventory() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { currency, notificationsEnabled, lowStockThreshold, colors } = useSettings();
    const styles = useMemo(() => createStyles(colors), [colors]);

    useEffect(() => {
        loadInventory();
    }, []);

    // Notification Logic for Low Stock
    useEffect(() => {
        if (notificationsEnabled && stats?.lowStockItems > 0) {
            // In a real app, this would be a local notification
            console.log(`[Notification] You have ${stats.lowStockItems} low stock items.`);
        }
    }, [stats, notificationsEnabled]);

    const loadInventory = async () => {
        try {
            const allProducts = await supabaseService.getAllProducts();
            setProducts(allProducts);

            const dashboardStats = await supabaseService.getDashboardStats();
            setStats(dashboardStats);
        } catch (error) {
            console.error('Failed to load inventory:', error);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            const results = await supabaseService.searchProducts(query);
            setProducts(results);
        } else {
            const allProducts = await supabaseService.getAllProducts();
            setProducts(allProducts);
        }
    };

    const handleProductPress = (product: Product) => {
        router.push({
            pathname: '/product/add',
            params: { id: product.id }
        });
    };

    const getThreshold = (product: Product) => {
        return product.lowStockThreshold !== undefined
            ? product.lowStockThreshold
            : lowStockThreshold;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Inventory Management</Text>
                <Text style={styles.headerSubtitle}>Manage your products and stock levels</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Add Product Button */}
                <Button
                    title="+ Add New Product"
                    onPress={() => router.push('/product/add')}
                    variant="primary"
                    style={styles.addButton}
                />

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statHalf}>
                        <StatCard
                            icon={<Ionicons name="cube" size={24} color={colors.blue} />}
                            label="Total Products"
                            value={stats?.totalProducts || 0}
                            backgroundColor={colors.cardBackground}
                            iconColor={colors.blue}
                        />
                    </View>
                    <View style={styles.statHalf}>
                        <StatCard
                            icon={<Ionicons name="warning" size={24} color={colors.orange} />}
                            label="Low Stock"
                            value={stats?.lowStockItems || 0}
                            backgroundColor={colors.orangeBg}
                            iconColor={colors.orange}
                        />
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statHalf}>
                        <StatCard
                            icon={<Ionicons name="close-circle" size={24} color={colors.red} />}
                            label="Out of Stock"
                            value={stats?.outOfStockItems || 0}
                            backgroundColor={colors.redBg}
                            iconColor={colors.red}
                        />
                    </View>
                    <View style={styles.statHalf}>
                        <StatCard
                            icon={<Ionicons name="cash" size={24} color={colors.primary} />}
                            label="Stock Value"
                            value={formatCurrency(stats?.stockValue || 0, currency)}
                            backgroundColor={colors.mintBg}
                            iconColor={colors.primary}
                        />
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products by name or SKU..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor={colors.textTertiary}
                    />
                </View>

                {/* Filters */}
                <View style={styles.filters}>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>All Categories</Text>
                        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>All Stock</Text>
                        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Products List */}
                {products.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={<Ionicons name="cube-outline" size={64} color={colors.textTertiary} />}
                            title="No products yet"
                            message="Start by adding your first product to inventory"
                            actionLabel="Add Product"
                            onAction={() => router.push('/product/add')}
                        />
                    </Card>
                ) : (
                    <View style={styles.productsList}>
                        {products.map((product) => {
                            const threshold = getThreshold(product);
                            const isLowStock = product.stockQuantity <= threshold && product.stockQuantity > 0;
                            const isOutStock = product.stockQuantity === 0;

                            return (
                                <TouchableOpacity key={product.id} onPress={() => handleProductPress(product)}>
                                    <Card style={styles.productCard}>
                                        <View style={styles.productRow}>
                                            <View style={styles.productIcon}>
                                                {product.imageUrl ? (
                                                    <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                                                ) : (
                                                    <Ionicons name="cube" size={24} color={colors.blue} />
                                                )}
                                            </View>
                                            <View style={styles.productInfo}>
                                                <Text style={styles.productName}>{product.name}</Text>
                                                <Text style={styles.productSKU}>SKU: {product.sku || 'N/A'}</Text>
                                                <Text style={styles.productPrice}>
                                                    {formatCurrency(product.sellingPrice, currency)}
                                                </Text>
                                            </View>
                                            <View style={styles.productStock}>
                                                <Text style={[
                                                    styles.stockQuantity,
                                                    isOutStock && styles.stockOut,
                                                    isLowStock && styles.stockLow,
                                                ]}>
                                                    {product.stockQuantity}
                                                </Text>
                                                <Text style={styles.stockLabel}>in stock</Text>
                                            </View>
                                        </View>
                                    </Card>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <View style={{ height: Spacing['3xl'] }} />
            </ScrollView>
        </View>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
    },
    addButton: {
        marginBottom: Spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    statHalf: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        ...Shadows.sm,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: Spacing.md,
        fontSize: Typography.base,
        color: colors.textPrimary,
    },
    filters: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.cardBackground,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterText: {
        fontSize: Typography.sm,
        color: colors.textPrimary,
    },
    productsList: {
        gap: Spacing.md,
    },
    productCard: {
        padding: Spacing.md,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        backgroundColor: colors.blueBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: Typography.base,
        fontWeight: Typography.semibold,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    productSKU: {
        fontSize: Typography.xs,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    productPrice: {
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
        color: colors.primary,
    },
    productStock: {
        alignItems: 'center',
    },
    stockQuantity: {
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
        color: colors.primary,
    },
    stockLow: {
        color: colors.orange,
    },
    stockOut: {
        color: colors.red,
    },
    stockLabel: {
        fontSize: Typography.xs,
        color: colors.textSecondary,
    },
});
