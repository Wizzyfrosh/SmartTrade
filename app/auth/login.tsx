import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { Input, Button } from '../../src/components';
import { supabase } from '../../src/services/supabase/client';
import { Ionicons } from '@expo/vector-icons';
import { GoogleAuthButton } from '../../src/components/GoogleAuthButton';

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            console.log('Attempting login with:', email);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error('Login error:', error); // Debug log
                throw error;
            }

            console.log('Login successful:', data);
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
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="cart" size={40} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>Welcome to SmartTrade</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                <GoogleAuthButton />

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.form}>
                    <Input
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        icon={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
                    />

                    <Input
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
                    />

                    <Button
                        title={loading ? "Signing in..." : "Sign In"}
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginButton}
                    />

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Need an account? </Text>
                        <Link href="/auth/signup" asChild>
                            <TouchableOpacity>
                                <Text style={styles.link}>Sign up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    content: {
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#fff',
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        marginBottom: Spacing.xl,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f9ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Typography.xl,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    brandTitle: {
        fontSize: Typography.xl,
        fontWeight: '900',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
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
    dividerText: {
        marginHorizontal: Spacing.md,
        color: Colors.textSecondary,
        fontSize: Typography.sm,
    },
    form: {
        gap: Spacing.md,
    },
    loginButton: {
        marginTop: Spacing.sm,
        backgroundColor: '#7c8591', // Muted grey/blue from screenshot
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    forgotPasswordText: {
        color: Colors.textSecondary,
        fontSize: Typography.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.lg,
    },
    footerText: {
        color: Colors.textSecondary,
        fontSize: Typography.sm,
    },
    link: {
        color: Colors.primary,
        fontSize: Typography.sm,
        fontWeight: Typography.bold,
    },
});
