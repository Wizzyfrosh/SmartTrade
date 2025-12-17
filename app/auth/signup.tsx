import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Image,
    Animated,
    Easing,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Modal,
    ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { Input, Button } from '../../src/components';
import { supabase } from '../../src/services/supabase/client';
import { Ionicons } from '@expo/vector-icons';
import { GoogleAuthButton } from '../../src/components/GoogleAuthButton';
import { LinearGradient } from 'expo-linear-gradient';
import { COUNTRY_CURRENCY_MAP, getCurrencyByCountry } from '../../src/utils/currency';
import { CountryFlag } from '../../src/components/CountryFlag';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');



export default function Signup() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('NG');
    const [showCountryPicker, setShowCountryPicker] = useState(false);

    // Sorted countries list
    const sortedCountries = React.useMemo(() => {
        return Object.entries(COUNTRY_CURRENCY_MAP)
            .sort(([, a], [, b]) => a.countryName.localeCompare(b.countryName));
    }, []);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const decorAnim1 = useRef(new Animated.Value(-100)).current;
    const decorAnim2 = useRef(new Animated.Value(-100)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Staggered entrance animations
        Animated.sequence([
            Animated.parallel([
                Animated.timing(decorAnim1, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.back(1.2)),
                }),
                Animated.timing(decorAnim2, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.back(1.2)),
                }),
            ]),
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 4,
                tension: 100,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.cubic),
                }),
            ]),
        ]).start();

        // Continuous animations
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1500,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 10,
                    duration: 2000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        ).start();
    }, []);

    const passwordsMatch = password && confirmPassword && password === confirmPassword;

    const handleSignup = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        country: selectedCountry,
                    },
                },
            });

            if (error) throw error;

            // Save currency based on selected country
            const currencyInfo = getCurrencyByCountry(selectedCountry);
            const settings = {
                currency: currencyInfo.code,
                lowStockThreshold: 5,
                notificationsEnabled: true,
            };
            await AsyncStorage.setItem('user_settings', JSON.stringify(settings));

            Alert.alert(
                'Success! 🎉',
                'Account created successfully! Please sign in.',
                [{ text: 'Sign In', onPress: () => router.replace('/auth/login') }]
            );
        } catch (error: any) {
            Alert.alert('Signup Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Decorative Background Elements */}
            <Animated.View
                style={[
                    styles.decorCircle1,
                    { transform: [{ translateX: decorAnim1 }, { scale: pulseAnim }] }
                ]}
            />
            <Animated.View
                style={[
                    styles.decorCircle2,
                    { transform: [{ translateX: decorAnim2 }, { translateY: floatAnim }] }
                ]}
            />
            <Animated.View style={[styles.decorCircle3, { transform: [{ scale: pulseAnim }] }]} />

            {/* Gradient Accent Bar */}
            <Animated.View style={[styles.accentBar, { transform: [{ translateX: decorAnim1 }] }]}>
                <LinearGradient
                    colors={['#F97316', '#FB923C', '#FDBA74']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBar}
                />
            </Animated.View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <Animated.ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>

                    {/* Logo Section */}
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            { transform: [{ scale: logoScale }] }
                        ]}
                    >
                        <View style={styles.logoWrapper}>
                            <Image
                                source={require('../../assets/icons/app_logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                    </Animated.View>

                    {/* Header Text */}
                    <Animated.View
                        style={[
                            styles.headerTextContainer,
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        <Text style={styles.welcomeText}>Create Account</Text>
                        <Text style={styles.subtitleText}>Join SmartTrade and grow your business</Text>
                    </Animated.View>

                    {/* Form Section */}
                    <Animated.View
                        style={[
                            styles.formContainer,
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        <GoogleAuthButton />

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <View style={styles.dividerBadge}>
                                <Text style={styles.dividerText}>OR</Text>
                            </View>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.inputsContainer}>
                            <Input
                                placeholder="Full Name"
                                value={name}
                                onChangeText={setName}
                                icon={<Ionicons name="person-outline" size={20} color={Colors.primary} />}
                            />

                            <Input
                                placeholder="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                icon={<Ionicons name="mail-outline" size={20} color={Colors.primary} />}
                            />

                            {/* Country Picker */}
                            <TouchableOpacity
                                style={styles.countrySelector}
                                onPress={() => setShowCountryPicker(true)}
                            >
                                <View style={styles.countrySelectorLeft}>
                                    <Ionicons name="globe-outline" size={20} color={Colors.primary} />
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <CountryFlag countryCode={selectedCountry} size={20} />
                                        <Text style={styles.countrySelectorText}>
                                            {COUNTRY_CURRENCY_MAP[selectedCountry]?.countryName || 'Select Country'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.countrySelectorRight}>
                                    <View style={styles.currencyBadge}>
                                        <Text style={styles.currencyBadgeText}>
                                            {getCurrencyByCountry(selectedCountry).code}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
                                </View>
                            </TouchableOpacity>

                            <Input
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />}
                                rightIcon={
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={Colors.textSecondary}
                                    />
                                }
                                onRightIconPress={() => setShowPassword(!showPassword)}
                            />

                            <Input
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                icon={<Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />}
                                error={confirmPassword && !passwordsMatch ? "Passwords do not match" : undefined}
                                rightIcon={
                                    <Ionicons
                                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={Colors.textSecondary}
                                    />
                                }
                                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            />

                            <Button
                                title={loading ? "Creating Account..." : "Create Account"}
                                onPress={handleSignup}
                                loading={loading}
                                style={styles.signUpButton}
                            />
                        </View>

                        <View style={styles.footer}>
                            <View style={{ alignItems: 'center', gap: 4 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.footerText}>Already have an account? </Text>
                                    <Link href="/auth/login" asChild>
                                        <TouchableOpacity>
                                            <Text style={styles.link}>Sign In</Text>
                                        </TouchableOpacity>
                                    </Link>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 16 }}>
                                    <Text style={[styles.footerText, { fontSize: 12 }]}>By signing up, you agree to our </Text>
                                    <Link href="/privacy-policy" asChild>
                                        <TouchableOpacity>
                                            <Text style={[styles.link, { fontSize: 12 }]}>Privacy Policy</Text>
                                        </TouchableOpacity>
                                    </Link>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </Animated.ScrollView>
            </KeyboardAvoidingView>

            {/* Country Picker Modal */}
            <Modal
                visible={showCountryPicker}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Country</Text>
                            <TouchableOpacity
                                onPress={() => setShowCountryPicker(false)}
                                style={styles.modalCloseBtn}
                            >
                                <Ionicons name="close" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.countryList} showsVerticalScrollIndicator={false}>
                            {sortedCountries.map(([code, info]) => (
                                <TouchableOpacity
                                    key={code}
                                    style={[
                                        styles.countryItem,
                                        selectedCountry === code && styles.countryItemActive
                                    ]}
                                    onPress={() => {
                                        setSelectedCountry(code);
                                        setShowCountryPicker(false);
                                    }}
                                >
                                    <View style={styles.countryItemContent}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <CountryFlag countryCode={code} size={20} />
                                            <Text style={styles.countryName}>
                                                {info.countryName}
                                            </Text>
                                        </View>
                                        <Text style={styles.countryCurrency}>
                                            {info.code} ({info.symbol})
                                        </Text>
                                    </View>
                                    {selectedCountry === code && (
                                        <View style={styles.checkmarkCircle}>
                                            <Ionicons name="checkmark" size={16} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFC',
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Platform.OS === 'android' ? 40 : 60,
        paddingBottom: Spacing['3xl'],
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        ...Shadows.sm,
    },
    // Decorative elements
    decorCircle1: {
        position: 'absolute',
        top: -60,
        left: -60,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: Colors.orange + '15',
    },
    decorCircle2: {
        position: 'absolute',
        top: 100,
        left: -40,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary + '20',
    },
    decorCircle3: {
        position: 'absolute',
        top: height * 0.35,
        right: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.purple + '15',
    },
    accentBar: {
        position: 'absolute',
        top: 140,
        left: 0,
        width: 6,
        height: 80,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        overflow: 'hidden',
    },
    gradientBar: {
        flex: 1,
    },
    // Logo
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    logoWrapper: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.lg,
    },
    logo: {
        width: 60,
        height: 60,
    },
    // Header text
    headerTextContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    welcomeText: {
        fontSize: Typography['2xl'],
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    subtitleText: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    // Form
    formContainer: {
        flex: 1,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerBadge: {
        backgroundColor: '#FAFBFC',
        paddingHorizontal: Spacing.md,
    },
    dividerText: {
        color: Colors.textTertiary,
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
    },
    inputsContainer: {
        gap: Spacing.md,
    },
    countrySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md + 2,
        ...Shadows.sm,
    },
    countrySelectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    countrySelectorRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    countrySelectorText: {
        fontSize: Typography.base,
        color: Colors.textPrimary,
    },
    currencyBadge: {
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    currencyBadgeText: {
        fontSize: Typography.xs,
        fontWeight: Typography.bold,
        color: Colors.primary,
    },
    signUpButton: {
        marginTop: Spacing.md,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        height: 56,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
        paddingBottom: Spacing.xl,
    },
    footerText: {
        color: Colors.textSecondary,
        fontSize: Typography.base,
    },
    link: {
        color: Colors.primary,
        fontSize: Typography.base,
        fontWeight: Typography.bold,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing['3xl'],
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    modalTitle: {
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
    },
    modalCloseBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countryList: {
        paddingHorizontal: Spacing.lg,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xs,
    },
    countryItemActive: {
        backgroundColor: Colors.mintBg,
    },
    countryItemContent: {
        flex: 1,
    },
    countryName: {
        fontSize: Typography.base,
        fontWeight: Typography.medium,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    countryCurrency: {
        fontSize: Typography.xs,
        color: Colors.textSecondary,
    },
    checkmarkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
