/**
 * Settings Screen
 * App settings and preferences
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, TextInput, Modal, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { Button, Input, ResponsiveContainer } from '../../src/components';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/services/supabase/client';
import { COUNTRY_CURRENCY_MAP } from '../../src/utils/currency';
import { useSettings } from '../../src/contexts/SettingsContext';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function Settings() {
    const { signOut, user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Use Context
    const { currency, lowStockThreshold, notificationsEnabled, updateSettings, theme, colors } = useSettings();

    // Dynamic Styles
    const styles = useMemo(() => createStyles(colors), [colors]);

    // Sorted Currencies
    const sortedCurrencies = useMemo(() => {
        return Object.entries(COUNTRY_CURRENCY_MAP).sort(([, a], [, b]) =>
            a.countryName.localeCompare(b.countryName)
        );
    }, []);

    // Local state for input (to handle string editing)
    const [localThreshold, setLocalThreshold] = useState(lowStockThreshold.toString());

    useEffect(() => {
        setLocalThreshold(lowStockThreshold.toString());
    }, [lowStockThreshold]);

    const handleThresholdChange = (text: string) => {
        setLocalThreshold(text);
        const num = parseInt(text);
        if (!isNaN(num)) {
            updateSettings({ lowStockThreshold: num });
        }
    };

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState('');
    const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
    const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);

    const handleUpdateProfile = async () => {
        if (!editName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({
                data: { full_name: editName.trim() }
            });

            if (error) throw error;

            Alert.alert('Success', 'Profile updated successfully');
            setIsEditingProfile(false);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                await uploadAvatar(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const uploadAvatar = async (image: ImagePicker.ImagePickerAsset) => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const base64 = image.base64;
            const fileExt = image.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, decode(base64!), {
                    contentType: image.mimeType ?? 'image/jpeg',
                    upsert: true,
                });

            if (uploadError) {
                if (uploadError.message.includes('Bucket not found')) {
                    throw new Error("Storage bucket 'avatars' not found. Please contact admin.");
                }
                throw uploadError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update User Metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            Alert.alert('Success', 'Profile picture updated!');
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            Alert.alert('Error', error.message || 'Failed to upload profile picture');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const openProfileEdit = () => {
        setEditName(user?.user_metadata?.full_name || '');
        setIsEditingProfile(true);
    };

    const THEME_OPTIONS = [
        { label: 'System Default', value: 'system' },
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
    ];

    return (
        <ResponsiveContainer>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Settings</Text>
                    <Text style={styles.headerSubtitle}>Manage your app preferences</Text>
                </View>

                <ScrollView style={styles.content}>
                    {/* Profile Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Profile</Text>
                        <View style={styles.profileCard}>
                            <TouchableOpacity onPress={handlePickImage} >
                                <View style={styles.avatar}>
                                    {user?.user_metadata?.avatar_url ? (
                                        <Image
                                            source={{ uri: user.user_metadata.avatar_url }}
                                            style={styles.avatarImage}
                                        />
                                    ) : (
                                        <Text style={styles.avatarText}>
                                            {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
                                        </Text>
                                    )}
                                    <View style={styles.cameraIconBadge}>
                                        <Ionicons name="camera" size={12} color={colors.textWhite} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.profileInfo}>
                                <Text style={styles.userName}>{user?.user_metadata?.full_name || 'User'}</Text>
                                <Text style={styles.userEmail}>{user?.email}</Text>
                            </View>
                            <TouchableOpacity onPress={openProfileEdit} style={styles.editButton}>
                                <Ionicons name="pencil" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* General Settings */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>General</Text>

                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingLabel}>Currency</Text>
                                <Text style={styles.settingDesc}>Select your preferred currency</Text>
                            </View>
                            <TouchableOpacity style={styles.valueDisplay} onPress={() => setIsCurrencyModalVisible(true)}>
                                <Text style={styles.valueText}>{currency}</Text>
                                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/privacy-policy')}>
                            <View>
                                <Text style={styles.settingLabel}>Privacy Policy</Text>
                                <Text style={styles.settingDesc}>Read our privacy policy</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                        </TouchableOpacity>

                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingLabel}>Theme</Text>
                                <Text style={styles.settingDesc}>App appearance</Text>
                            </View>
                            <TouchableOpacity style={styles.valueDisplay} onPress={() => setIsThemeModalVisible(true)}>
                                <Text style={styles.valueText}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</Text>
                                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingLabel}>Low Stock Alert</Text>
                                <Text style={styles.settingDesc}>Notify when stock is below this limit</Text>
                            </View>
                            <TextInput
                                style={styles.inputSmall}
                                value={localThreshold}
                                onChangeText={handleThresholdChange}
                                keyboardType="number-pad"
                                placeholderTextColor={colors.textTertiary}
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingLabel}>Notifications</Text>
                                <Text style={styles.settingDesc}>Enable push notifications</Text>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={(val) => updateSettings({ notificationsEnabled: val })}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={colors.cardBackground}
                            />
                        </View>
                    </View>

                    <Button
                        title="Sign Out"
                        onPress={handleSignOut}
                        variant="outline"
                        style={styles.signOutButton}
                        icon={<Ionicons name="log-out-outline" size={20} color={colors.primary} />}
                    />
                </ScrollView>

                {/* Edit Profile Modal */}
                <Modal
                    visible={isEditingProfile}
                    transparent
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Edit Profile</Text>
                                <TouchableOpacity onPress={() => setIsEditingProfile(false)}>
                                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalBody}>
                                <Input
                                    label="Full Name"
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder="Enter your full name"
                                />

                                <Button
                                    title={loading ? "Saving..." : "Save Changes"}
                                    onPress={handleUpdateProfile}
                                    loading={loading}
                                    disabled={loading}
                                    style={styles.modalButton}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Currency Selection Modal */}
                <Modal
                    visible={isCurrencyModalVisible}
                    transparent
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContentExtended}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Currency</Text>
                                <TouchableOpacity onPress={() => setIsCurrencyModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.currencyList}>
                                {sortedCurrencies.map(([countryCode, currencyInfo]) => (
                                    <TouchableOpacity
                                        key={countryCode}
                                        style={[
                                            styles.currencyItem,
                                            currency === currencyInfo.code && styles.currencyItemActive
                                        ]}
                                        onPress={() => {
                                            updateSettings({ currency: currencyInfo.code });
                                            setIsCurrencyModalVisible(false);
                                        }}
                                    >
                                        <View>
                                            <Text style={styles.currencyCode}>{currencyInfo.code}</Text>
                                            <Text style={styles.currencyCountry}>{currencyInfo.countryName}</Text>
                                        </View>
                                        {currency === currencyInfo.code && (
                                            <Ionicons name="checkmark" size={20} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Theme Selection Modal */}
                <Modal
                    visible={isThemeModalVisible}
                    transparent
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Theme</Text>
                                <TouchableOpacity onPress={() => setIsThemeModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.currencyList}>
                                {THEME_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.currencyItem,
                                            theme === option.value && styles.currencyItemActive
                                        ]}
                                        onPress={() => {
                                            updateSettings({ theme: option.value as any });
                                            setIsThemeModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.currencyCode}>{option.label}</Text>
                                        {theme === option.value && (
                                            <Ionicons name="checkmark" size={20} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </Modal>
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
        padding: Spacing.lg,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: Typography.lg,
        fontWeight: Typography.semibold,
        color: colors.textPrimary,
        marginBottom: Spacing.md,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: colors.cardBackground,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadows.sm,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.full,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        overflow: 'hidden',
        position: 'relative',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: '100%',
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: colors.textWhite,
        fontSize: Typography['2xl'],
        fontWeight: Typography.bold,
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
        color: colors.textPrimary,
    },
    userEmail: {
        fontSize: Typography.sm,
        color: colors.textSecondary,
    },
    editButton: {
        padding: Spacing.sm,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    settingLabel: {
        fontSize: Typography.base,
        fontWeight: Typography.medium,
        color: colors.textPrimary,
    },
    settingDesc: {
        fontSize: Typography.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    valueDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    valueText: {
        fontSize: Typography.base,
        color: colors.textSecondary,
    },
    inputSmall: {
        width: 80,
        padding: Spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: BorderRadius.md,
        textAlign: 'center',
        fontSize: Typography.base,
        color: colors.textPrimary,
    },
    signOutButton: {
        marginTop: Spacing.xl,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.cardBackground,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        paddingBottom: Spacing['3xl'],
    },
    modalContentExtended: {
        backgroundColor: colors.cardBackground,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        paddingBottom: Spacing['3xl'],
        height: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    modalTitle: {
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
        color: colors.textPrimary,
    },
    modalBody: {
        gap: Spacing.lg,
    },
    modalButton: {
        marginTop: Spacing.md,
    },
    currencyList: {
        marginBottom: Spacing.md,
    },
    currencyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    currencyItemActive: {
        backgroundColor: colors.blueBg,
        marginHorizontal: -Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderBottomWidth: 0,
    },
    currencyCode: {
        fontSize: Typography.base,
        fontWeight: Typography.bold,
        color: colors.textPrimary,
    },
    currencyCountry: {
        fontSize: Typography.xs,
        color: colors.textSecondary,
    },
});
