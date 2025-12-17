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
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { Input, Button } from '../../src/components';
import { supabase } from '../../src/services/supabase/client';
import { Ionicons } from '@expo/vector-icons';
import { GoogleAuthButton } from '../../src/components/GoogleAuthButton';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;
    const decorAnim1 = useRef(new Animated.Value(-100)).current;
    const decorAnim2 = useRef(new Animated.Value(-100)).current;
    const decorAnim3 = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Staggered entrance animations
        Animated.sequence([
            // Decorative elements slide in from left
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
                    delay: 100,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.back(1.2)),
                }),
            ]),
            // Logo bounce in
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 4,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(logoRotate, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.back(1.5)),
                }),
            ]),
            // Content fade in
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

        // Continuous pulse animation for decorative element
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

        // Floating animation for decoration
        Animated.loop(
            Animated.sequence([
                Animated.timing(decorAnim3, {
                    toValue: 10,
                    duration: 2000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(decorAnim3, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        ).start();
    }, []);

    const spinInterpolate = logoRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['-10deg', '0deg'],
    });

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
        } catch (error: any) {
            let message = error.message;
            if (message.includes('Invalid login credentials')) {
                message = 'Invalid email or password. Please check your credentials.';
            }
            Alert.alert('Login Failed', message);
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
                    { transform: [{ translateX: decorAnim2 }, { translateY: decorAnim3 }] }
                ]}
            />
            <Animated.View style={[styles.decorCircle3, { transform: [{ scale: pulseAnim }] }]} />

            {/* Gradient Accent Bar - Left Aligned */}
            <Animated.View style={[styles.accentBar, { transform: [{ translateX: decorAnim1 }] }]}>
                <LinearGradient
                    colors={['#10B981', '#34D399', '#6EE7B7']}
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
                    {/* Logo Section */}
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                transform: [
                                    { scale: logoScale },
                                    { rotate: spinInterpolate }
                                ]
                            }
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

                    {/* Welcome Text */}
                    <Animated.View
                        style={[
                            styles.headerTextContainer,
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        <Text style={styles.welcomeText}>Welcome Back!</Text>
                        <Text style={styles.subtitleText}>Sign in to continue to SmartTrade</Text>
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
                                placeholder="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                icon={<Ionicons name="mail-outline" size={20} color={Colors.primary} />}
                            />

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

                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                            </TouchableOpacity>

                            <Button
                                title={loading ? "Signing in..." : "Sign In"}
                                onPress={handleLogin}
                                loading={loading}
                                style={styles.signInButton}
                            />
                        </View>

                        <View style={styles.footer}>
                            <View style={{ alignItems: 'center', gap: 4 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.footerText}>Don't have an account? </Text>
                                    <Link href="/auth/signup" asChild>
                                        <TouchableOpacity>
                                            <Text style={styles.link}>Sign Up</Text>
                                        </TouchableOpacity>
                                    </Link>
                                </View>
                                <Link href="/privacy-policy" asChild>
                                    <TouchableOpacity style={{ marginTop: 16 }}>
                                        <Text style={[styles.footerText, { fontSize: 12, textDecorationLine: 'underline' }]}>Privacy Policy</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                        </View>
                    </Animated.View>
                </Animated.ScrollView>
            </KeyboardAvoidingView>
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
        paddingTop: height * 0.08,
        paddingBottom: Spacing['3xl'],
    },
    // Decorative elements
    decorCircle1: {
        position: 'absolute',
        top: -60,
        left: -60,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: Colors.primary + '15',
    },
    decorCircle2: {
        position: 'absolute',
        top: 80,
        left: -40,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.orange + '20',
    },
    decorCircle3: {
        position: 'absolute',
        top: height * 0.4,
        right: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.blue + '15',
    },
    accentBar: {
        position: 'absolute',
        top: 120,
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
        marginBottom: Spacing.xl,
    },
    logoWrapper: {
        width: 100,
        height: 100,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.lg,
    },
    logo: {
        width: 80,
        height: 80,
    },
    // Header text
    headerTextContainer: {
        alignItems: 'center',
        marginBottom: Spacing['2xl'],
    },
    welcomeText: {
        fontSize: Typography['3xl'],
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    subtitleText: {
        fontSize: Typography.base,
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
        marginVertical: Spacing.xl,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -Spacing.xs,
    },
    forgotPasswordText: {
        color: Colors.primary,
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
    },
    signInButton: {
        marginTop: Spacing.lg,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        height: 56,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing['2xl'],
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
});
