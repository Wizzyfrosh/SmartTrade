/**
 * Add Product Screen
 * Add or edit product with Supabase integration
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { Input, Button } from '../../src/components';
import { supabase } from '../../src/services/supabase/client';
import { PRODUCT_CATEGORIES } from '../../src/constants/config';
import { useAuth } from '../../src/contexts/AuthContext';

export default function AddProduct() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [category, setCategory] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');
    const [lowStockThreshold, setLowStockThreshold] = useState('5');

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Product name is required';
        }

        if (!costPrice || isNaN(parseFloat(costPrice)) || parseFloat(costPrice) < 0) {
            newErrors.costPrice = 'Valid cost price is required';
        }

        if (!sellingPrice || isNaN(parseFloat(sellingPrice)) || parseFloat(sellingPrice) < 0) {
            newErrors.sellingPrice = 'Valid selling price is required';
        }

        if (!stockQuantity || isNaN(parseInt(stockQuantity)) || parseInt(stockQuantity) < 0) {
            newErrors.stockQuantity = 'Valid stock quantity is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fix the errors before saving');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'You must be logged in to add products');
            return;
        }

        try {
            setLoading(true);

            const { error } = await supabase.from('products').insert({
                name: name.trim(),
                sku: sku.trim() || null,
                category: category.trim() || null,
                cost_price: parseFloat(costPrice),
                selling_price: parseFloat(sellingPrice),
                stock_quantity: parseInt(stockQuantity),
                low_stock_threshold: parseInt(lowStockThreshold) || 5,
                user_id: user.id,
            });

            if (error) throw error;

            Alert.alert(
                'Success',
                'Product added successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Failed to save product:', error);
            Alert.alert('Error', error.message || 'Failed to save product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Add Product</Text>
                <Text style={styles.headerSubtitle}>Add a new item to your inventory</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Input
                    label="Product Name"
                    placeholder="Enter product name"
                    value={name}
                    onChangeText={setName}
                    error={errors.name}
                    required
                />

                <Input
                    label="SKU"
                    placeholder="Enter SKU (optional)"
                    value={sku}
                    onChangeText={setSku}
                />

                <View style={styles.categorySection}>
                    <Text style={styles.label}>Category</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryScroll}
                        contentContainerStyle={styles.categoryScrollContent}
                    >
                        {PRODUCT_CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryChip,
                                    category === cat && styles.categoryChipSelected
                                ]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={[
                                    styles.categoryChipText,
                                    category === cat && styles.categoryChipTextSelected
                                ]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <Input
                        placeholder="Or type a custom category"
                        value={category}
                        onChangeText={setCategory}
                    />
                </View>

                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <Input
                            label="Cost Price"
                            placeholder="0.00"
                            value={costPrice}
                            onChangeText={setCostPrice}
                            keyboardType="decimal-pad"
                            error={errors.costPrice}
                            required
                        />
                    </View>
                    <View style={styles.halfWidth}>
                        <Input
                            label="Selling Price"
                            placeholder="0.00"
                            value={sellingPrice}
                            onChangeText={setSellingPrice}
                            keyboardType="decimal-pad"
                            error={errors.sellingPrice}
                            required
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <Input
                            label="Stock Quantity"
                            placeholder="0"
                            value={stockQuantity}
                            onChangeText={setStockQuantity}
                            keyboardType="number-pad"
                            error={errors.stockQuantity}
                            required
                        />
                    </View>
                    <View style={styles.halfWidth}>
                        <Input
                            label="Low Stock Alert"
                            placeholder="5"
                            value={lowStockThreshold}
                            onChangeText={setLowStockThreshold}
                            keyboardType="number-pad"
                        />
                    </View>
                </View>

                <Button
                    title={loading ? 'Saving...' : 'Save Product'}
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
    categorySection: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    categoryScroll: {
        marginBottom: Spacing.sm,
    },
    categoryScrollContent: {
        paddingRight: Spacing.lg,
    },
    categoryChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.cardBackground,
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: Spacing.sm,
    },
    categoryChipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    categoryChipText: {
        fontSize: Typography.sm,
        color: Colors.textPrimary,
    },
    categoryChipTextSelected: {
        color: Colors.textWhite,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    halfWidth: {
        flex: 1,
    },
    saveButton: {
        marginTop: Spacing.lg,
        marginBottom: Spacing.md,
    },
});
