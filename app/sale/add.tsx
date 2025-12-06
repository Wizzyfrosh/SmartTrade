/**
 * Record Sale Screen
 * Record a new sale transaction with database integration
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Modal,
    FlatList,
    Platform,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { Input, Button, Card } from '../../src/components';
import { supabaseService } from '../../src/services/supabase/db';
import { formatCurrency } from '../../src/utils/currency';
import type { Product } from '../../src/types';
import { useAuth } from '../../src/contexts/AuthContext';

export default function AddSale() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [currencyCode] = useState('NGN');

    // Form state
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState('1');
    const [unitPrice, setUnitPrice] = useState('');

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const allProducts = await supabaseService.getAllProducts();
            setProducts(allProducts.filter(p => p.stockQuantity > 0)); // Only show in-stock products
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setUnitPrice(product.sellingPrice.toString());
        setShowProductPicker(false);
    };

    const calculateTotals = () => {
        if (!selectedProduct || !quantity || !unitPrice) {
            return { revenue: 0, cost: 0, profit: 0 };
        }

        const qty = parseInt(quantity);
        const price = parseFloat(unitPrice);
        const revenue = qty * price;
        const cost = qty * selectedProduct.costPrice;
        const profit = revenue - cost;

        return { revenue, cost, profit };
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!selectedProduct) {
            newErrors.product = 'Please select a product';
        }

        const qty = parseInt(quantity);
        if (!quantity || isNaN(qty) || qty <= 0) {
            newErrors.quantity = 'Valid quantity is required';
        } else if (selectedProduct && qty > selectedProduct.stockQuantity) {
            newErrors.quantity = `Only ${selectedProduct.stockQuantity} units available`;
        }

        if (!unitPrice || isNaN(parseFloat(unitPrice)) || parseFloat(unitPrice) < 0) {
            newErrors.unitPrice = 'Valid unit price is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm() || !selectedProduct) {
            Alert.alert('Validation Error', 'Please fix the errors before saving');
            return;
        }

        try {
            setLoading(true);

            const totals = calculateTotals();
            const qty = parseInt(quantity);
            const price = parseFloat(unitPrice);

            if (!user) {
                Alert.alert('Error', 'You must be logged in to record sales');
                return;
            }

            await supabaseService.createSale({
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                quantity: qty,
                unitPrice: price,
                costPrice: selectedProduct.costPrice,
                totalRevenue: totals.revenue,
                totalCost: totals.cost,
                profit: totals.profit,
                saleDate: Date.now(),
            }, user.id);

            Alert.alert(
                'Success',
                `Sale recorded successfully!\n\nRevenue: ${formatCurrency(totals.revenue, currencyCode)}\nProfit: ${formatCurrency(totals.profit, currencyCode)}`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            console.error('Failed to record sale:', error);
            Alert.alert('Error', 'Failed to record sale. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const totals = calculateTotals();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Record Sale</Text>
                <Text style={styles.headerSubtitle}>Log a new sale transaction</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Product Selection */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        Select Product <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={[styles.productSelector, errors.product && styles.inputError]}
                        onPress={() => setShowProductPicker(true)}
                    >
                        {selectedProduct ? (
                            <View style={styles.selectedProduct}>
                                <View style={styles.productIcon}>
                                    <Ionicons name="cube" size={20} color={Colors.blue} />
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{selectedProduct.name}</Text>
                                    <Text style={styles.productStock}>
                                        {selectedProduct.stockQuantity} in stock • {formatCurrency(selectedProduct.sellingPrice, currencyCode)}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={styles.placeholderText}>Tap to select product</Text>
                        )}
                        <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    {errors.product && <Text style={styles.errorText}>{errors.product}</Text>}
                </View>

                <Input
                    label="Quantity"
                    placeholder="1"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="number-pad"
                    error={errors.quantity}
                    required
                />

                <Input
                    label="Unit Price"
                    placeholder="0.00"
                    value={unitPrice}
                    onChangeText={setUnitPrice}
                    keyboardType="decimal-pad"
                    error={errors.unitPrice}
                    required
                />

                {/* Sale Summary */}
                {selectedProduct && quantity && unitPrice && (
                    <Card style={styles.summaryCard} backgroundColor={Colors.mintBg}>
                        <Text style={styles.summaryTitle}>Sale Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Revenue:</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(totals.revenue, currencyCode)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Cost:</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(totals.cost, currencyCode)}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.summaryRowHighlight]}>
                            <Text style={styles.summaryLabelBold}>Profit:</Text>
                            <Text style={[styles.summaryValueBold, { color: totals.profit >= 0 ? Colors.primary : Colors.error }]}>
                                {formatCurrency(totals.profit, currencyCode)}
                            </Text>
                        </View>
                    </Card>
                )}

                <Button
                    title={loading ? 'Recording...' : 'Record Sale'}
                    onPress={handleSave}
                    loading={loading}
                    disabled={loading}
                    style={styles.saveButton}
                />

                <Button
                    title="Cancel"
                    onPress={() => router.back()}
                    variant="outline"
                    disabled={loading}
                />
            </ScrollView>

            {/* Product Picker Modal */}
            <Modal
                visible={showProductPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowProductPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Product</Text>
                            <TouchableOpacity onPress={() => setShowProductPicker(false)}>
                                <Ionicons name="close" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={products}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.productItem}
                                    onPress={() => handleProductSelect(item)}
                                >
                                    <View style={styles.productIcon}>
                                        <Ionicons name="cube" size={24} color={Colors.blue} />
                                    </View>
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName}>{item.name}</Text>
                                        <Text style={styles.productStock}>
                                            {item.stockQuantity} in stock • {formatCurrency(item.sellingPrice, currencyCode)}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No products in stock</Text>
                                    <Button
                                        title="Add Product"
                                        onPress={() => {
                                            setShowProductPicker(false);
                                            router.push('/product/add');
                                        }}
                                        style={{ marginTop: Spacing.md }}
                                    />
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
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
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.cardBackground,
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
        padding: Spacing.lg,
    },
    inputContainer: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    required: {
        color: Colors.error,
    },
    productSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.cardBackground,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
    },
    inputError: {
        borderColor: Colors.error,
    },
    selectedProduct: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    productIcon: {
        width: 40,
        height: 40,
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
    productStock: {
        fontSize: Typography.xs,
        color: Colors.textSecondary,
    },
    placeholderText: {
        fontSize: Typography.base,
        color: Colors.textTertiary,
    },
    errorText: {
        fontSize: Typography.xs,
        color: Colors.error,
        marginTop: Spacing.xs,
    },
    summaryCard: {
        marginBottom: Spacing.lg,
        padding: Spacing.lg,
    },
    summaryTitle: {
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    summaryRowHighlight: {
        marginTop: Spacing.sm,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.primary + '30',
    },
    summaryLabel: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
    },
    summaryValue: {
        fontSize: Typography.base,
        fontWeight: Typography.medium,
        color: Colors.textPrimary,
    },
    summaryLabelBold: {
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
    },
    summaryValueBold: {
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
    },
    saveButton: {
        marginTop: Spacing.lg,
        marginBottom: Spacing.md,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.cardBackground,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    emptyState: {
        padding: Spacing['3xl'],
        alignItems: 'center',
    },
    emptyText: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
    },
});
