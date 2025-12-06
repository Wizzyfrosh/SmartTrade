/**
 * Inventory Screen
 * Manage products and stock levels
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { StatCard, Card, EmptyState, Button } from '../../src/components';
import { supabaseService } from '../../src/services/supabase/db';
import { formatCurrency } from '../../src/utils/currency';
import type { Product } from '../../src/types';

export default function Inventory() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currencyCode] = useState('NGN');

    useEffect(() => {
        loadInventory();
    }, []);

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
                            icon={<Ionicons name="cube" size={24} color={Colors.blue} />}
                            label="Total Products"
                            value={stats?.totalProducts || 0}
                            backgroundColor={Colors.cardBackground}
                        />
                    </View>
                    <View style={styles.statHalf}>
                        <StatCard
                            icon={<Ionicons name="warning" size={24} color={Colors.orange} />}
                            label="Low Stock"
                            value={stats?.lowStockItems || 0}
                            backgroundColor={Colors.orangeBg}
                        />
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statHalf}>
                        <StatCard
                            icon={<Ionicons name="close-circle" size={24} color={Colors.red} />}
                            label="Out of Stock"
                            value={stats?.outOfStockItems || 0}
                            backgroundColor={Colors.redBg}
                        />
                    </View>
                    <View style={styles.statHalf}>
                        <StatCard
                            icon={<Ionicons name="cash" size={24} color={Colors.primary} />}
                            label="Stock Value"
                            value={formatCurrency(stats?.stockValue || 0, currencyCode)}
                            backgroundColor={Colors.mintBg}
                        />
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products by name or SKU..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor={Colors.textTertiary}
                    />
                </View>

                {/* Filters */}
                <View style={styles.filters}>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>All Categories</Text>
                        <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>All Stock</Text>
                        <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Products List */}
                {products.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={<Ionicons name="cube-outline" size={64} color={Colors.textTertiary} />}
                            title="No products yet"
                            message="Start by adding your first product to inventory"
                            actionLabel="Add Product"
                            onAction={() => router.push('/product/add')}
                        />
                    </Card>
                ) : (
                    <View style={styles.productsList}>
                        {products.map((product) => (
                            <Card key={product.id} style={styles.productCard}>
                                <View style={styles.productRow}>
                                    <View style={styles.productIcon}>
                                        <Ionicons name="cube" size={24} color={Colors.blue} />
                                    </View>
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName}>{product.name}</Text>
                                        <Text style={styles.productSKU}>SKU: {product.sku || 'N/A'}</Text>
                                        <Text style={styles.productPrice}>
                                            {formatCurrency(product.sellingPrice, currencyCode)}
                                        </Text>
                                    </View>
                                    <View style={styles.productStock}>
                                        <Text style={[
                                            styles.stockQuantity,
                                            product.stockQuantity === 0 && styles.stockOut,
                                            product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0 && styles.stockLow,
                                        ]}>
                                            {product.stockQuantity}
                                        </Text>
                                        <Text style={styles.stockLabel}>in stock</Text>
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </View>
                )}

                <View style={{ height: Spacing['3xl'] }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
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
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    headerSubtitle: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
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
        backgroundColor: Colors.cardBackground,
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
        color: Colors.textPrimary,
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
        backgroundColor: Colors.cardBackground,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    filterText: {
        fontSize: Typography.sm,
        color: Colors.textPrimary,
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
        backgroundColor: Colors.blueBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: Typography.base,
        fontWeight: Typography.semibold,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    productSKU: {
        fontSize: Typography.xs,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    productPrice: {
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
        color: Colors.primary,
    },
    productStock: {
        alignItems: 'center',
    },
    stockQuantity: {
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
        color: Colors.primary,
    },
    stockLow: {
        color: Colors.orange,
    },
    stockOut: {
        color: Colors.red,
    },
    stockLabel: {
        fontSize: Typography.xs,
        color: Colors.textSecondary,
    },
});
