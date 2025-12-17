import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { Button, EmptyState, Card, ResponsiveContainer } from '../../src/components';
import { supabaseService } from '../../src/services/supabase/db';
import { formatCurrency } from '../../src/utils/currency';
import { useSettings } from '../../src/contexts/SettingsContext';
import type { Sale } from '../../src/types';

export default function Sales() {
    const router = useRouter();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { currency, colors } = useSettings();
    const styles = useMemo(() => createStyles(colors), [colors]);

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
                <View style={[styles.saleIcon, { backgroundColor: colors.mintBg }]}>
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                </View>
                <View style={styles.saleInfo}>
                    <Text style={styles.saleAmount}>{formatCurrency(item.totalRevenue, currency)}</Text>
                    <Text style={styles.saleDate}>
                        {new Date(item.saleDate).toLocaleDateString()} • {new Date(item.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View style={styles.saleDetails}>
                    <Text style={styles.saleQuantity}>{item.quantity} items</Text>
                    <Text style={styles.saleProfit}>+{formatCurrency(item.profit, currency)} profit</Text>
                </View>
            </View>
        </Card>
    );

    return (
        <ResponsiveContainer>
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
                            icon={<Ionicons name="cart-outline" size={64} color={colors.textTertiary} />}
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
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                            }
                        />
                    )}
                </View>
            </SafeAreaView>
        </ResponsiveContainer>
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
        color: colors.textPrimary,
    },
    saleDate: {
        fontSize: Typography.xs,
        color: colors.textSecondary,
    },
    saleDetails: {
        alignItems: 'flex-end',
    },
    saleQuantity: {
        fontSize: Typography.sm,
        color: colors.textPrimary,
        fontWeight: Typography.medium,
    },
    saleProfit: {
        fontSize: Typography.xs,
        color: colors.success,
        fontWeight: Typography.medium,
    },
});
