/**
 * Sales Screen
 * View and record sales transactions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { Button, EmptyState, Card } from '../../src/components';
import { supabaseService } from '../../src/services/supabase/db';
import { formatCurrency } from '../../src/utils/currency';
import type { Sale } from '../../src/types';

export default function Sales() {
    const router = useRouter();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currencyCode] = useState('NGN');

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        try {
            setLoading(true);
            const allSales = await supabaseService.getAllSales();
            setSales(allSales);
        } catch (error) {
            console.error('Failed to load sales:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadSales();
    }, []);

    const renderSaleItem = ({ item }: { item: Sale }) => (
        <Card style={styles.saleCard}>
            <View style={styles.saleContent}>
                <View style={[styles.saleIcon, { backgroundColor: Colors.mintBg }]}>
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                </View>
                <View style={styles.saleInfo}>
                    <Text style={styles.saleAmount}>{formatCurrency(item.totalRevenue, currencyCode)}</Text>
                    <Text style={styles.saleDate}>
                        {new Date(item.saleDate).toLocaleDateString()} • {new Date(item.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View style={styles.saleDetails}>
                    <Text style={styles.saleQuantity}>{item.quantity} items</Text>
                    <Text style={styles.saleProfit}>+{formatCurrency(item.profit, currencyCode)} profit</Text>
                </View>
            </View>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sales</Text>
                <Text style={styles.headerSubtitle}>Track and manage your sales</Text>
            </View>

            <View style={styles.content}>
                <Button
                    title="+ Record New Sale"
                    onPress={() => router.push('/sale/add')}
                    variant="primary"
                    style={styles.addButton}
                />

                {sales.length === 0 && !loading ? (
                    <EmptyState
                        icon={<Ionicons name="cart-outline" size={64} color={Colors.textTertiary} />}
                        title="No sales yet"
                        message="Record your first sale to see it here"
                        actionLabel="Record Sale"
                        onAction={() => router.push('/sale/add')}
                    />
                ) : (
                    <FlatList
                        data={sales}
                        renderItem={renderSaleItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
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
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
    },
    addButton: {
        marginBottom: Spacing.lg,
    },
    listContent: {
        paddingBottom: Spacing.xl,
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
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    saleInfo: {
        flex: 1,
    },
    saleAmount: {
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
    },
    saleDate: {
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
});
