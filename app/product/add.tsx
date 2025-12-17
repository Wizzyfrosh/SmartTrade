import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { Input, Button, CurvedHeader } from '../../src/components';
import { supabase } from '../../src/services/supabase/client';
import { supabaseService } from '../../src/services/supabase/db';
import { useAuth } from '../../src/contexts/AuthContext';
import { useSettings } from '../../src/contexts/SettingsContext';

export default function AddProduct() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuth();
    const { lowStockThreshold, colors } = useSettings();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // Edit Mode State
    const productId = params.id as string;
    const isEditMode = !!productId;

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [category, setCategory] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');
    const [localThreshold, setLocalThreshold] = useState(lowStockThreshold.toString());

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Entry Animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();

        // Load Product Data if Edit Mode
        if (isEditMode) {
            loadProduct();
        } else {
            // Set default threshold for new products from context
            setLocalThreshold(lowStockThreshold.toString());
        }
    }, [productId]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;

            if (data) {
                setName(data.name);
                setSku(data.sku || '');
                setCategory(data.category || '');
                setCostPrice(data.cost_price?.toString() || '');
                setSellingPrice(data.selling_price?.toString() || '');
                setStockQuantity(data.stock_quantity?.toString() || '');
                setLocalThreshold(data.low_stock_threshold?.toString() || lowStockThreshold.toString());
                if (data.image_url) setImage(data.image_url);
            }
        } catch (error) {
            console.error('Error loading product:', error);
            Alert.alert('Error', 'Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

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
            Alert.alert('Error', 'You must be logged in to manage products');
            return;
        }

        try {
            setLoading(true);
            let uploadedImageUrl = image;

            // Upload image if it's a local URI (newly picked)
            if (image && !image.startsWith('http')) {
                uploadedImageUrl = await supabaseService.uploadProductImage(image);
            }

            const productData = {
                name: name.trim(),
                sku: sku.trim() || null,
                category: category.trim() || null,
                costPrice: parseFloat(costPrice),
                sellingPrice: parseFloat(sellingPrice),
                stockQuantity: parseInt(stockQuantity),
                lowStockThreshold: parseInt(localThreshold) || lowStockThreshold, // Fallback to global setting
                imageUrl: uploadedImageUrl,
                userId: user.id,
            };

            if (isEditMode) {
                await supabaseService.updateProduct({
                    id: productId,
                    ...productData,
                    synced: false,
                    createdAt: 0, // Ignored by update
                    updatedAt: 0,
                } as any);
                Alert.alert('Success', 'Product updated successfully');
            } else {
                const { error } = await supabase.from('products').insert({
                    name: productData.name,
                    sku: productData.sku,
                    category: productData.category,
                    cost_price: productData.costPrice,
                    selling_price: productData.sellingPrice,
                    stock_quantity: productData.stockQuantity,
                    low_stock_threshold: productData.lowStockThreshold,
                    image_url: productData.imageUrl,
                    user_id: user.id,
                });
                if (error) throw error;
                Alert.alert('Success', 'Product added successfully');
            }

            router.back();
        } catch (error: any) {
            console.error('Failed to save product:', error);
            Alert.alert('Error', error.message || 'Failed to save product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await supabaseService.deleteProduct(productId);
                            router.back();
                        } catch (error) {
                            console.error('Error deleting product:', error);
                            Alert.alert('Error', 'Failed to delete product');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <CurvedHeader
                title={isEditMode ? "Edit Product" : "Add Product"}
                subtitle={isEditMode ? "Update product details" : "Add a new item to your inventory"}
            />

            <Animated.ScrollView
                style={[styles.scrollView, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Image Picker */}
                <View style={styles.imageSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.image} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="camera" size={40} color={colors.textTertiary} />
                                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                            </View>
                        )}
                        <View style={styles.editBadge}>
                            <Ionicons name="pencil" size={16} color={colors.textWhite} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <Input
                    label="Product Name *"
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter product name"
                    error={errors.name}
                />

                <Input
                    label="SKU / Barcode"
                    value={sku}
                    onChangeText={setSku}
                    placeholder="E.g., 12345678"
                />

                <Input
                    label="Category"
                    value={category}
                    onChangeText={setCategory}
                    placeholder="E.g., Electronics, Clothing"
                />

                <View style={styles.row}>
                    <View style={styles.half}>
                        <Input
                            label="Cost Price *"
                            value={costPrice}
                            onChangeText={setCostPrice}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            error={errors.costPrice}
                        />
                    </View>
                    <View style={styles.half}>
                        <Input
                            label="Selling Price *"
                            value={sellingPrice}
                            onChangeText={setSellingPrice}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            error={errors.sellingPrice}
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.half}>
                        <Input
                            label="Stock Quantity *"
                            value={stockQuantity}
                            onChangeText={setStockQuantity}
                            placeholder="0"
                            keyboardType="number-pad"
                            error={errors.stockQuantity}
                        />
                    </View>
                    <View style={styles.half}>
                        <Input
                            label="Low Stock Alert"
                            value={localThreshold}
                            onChangeText={setLocalThreshold}
                            placeholder="5"
                            keyboardType="number-pad"
                        />
                    </View>
                </View>

                <Button
                    title={loading ? "Saving..." : "Save Product"}
                    onPress={handleSave}
                    loading={loading}
                    disabled={loading}
                    style={styles.saveButton}
                />

                {isEditMode && (
                    <Button
                        title="Delete Product"
                        onPress={handleDelete}
                        variant="outline"
                        style={styles.deleteButton}
                        textStyle={{ color: colors.error }}
                    />
                )}

                <View style={styles.spacer} />
            </Animated.ScrollView>
        </View>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    imageSection: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    imagePicker: {
        position: 'relative',
        width: 120,
        height: 120,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        ...Shadows.md,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    imagePlaceholderText: {
        marginTop: Spacing.xs,
        fontSize: Typography.xs,
        color: colors.textSecondary,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        padding: Spacing.xs,
        borderTopLeftRadius: BorderRadius.md,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    half: {
        flex: 1,
    },
    saveButton: {
        marginTop: Spacing.lg,
    },
    deleteButton: {
        marginTop: Spacing.md,
        borderColor: colors.error,
    },
    spacer: {
        height: 50,
    },
});
