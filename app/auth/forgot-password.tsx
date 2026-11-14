import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Typography, BorderRadius } from "../../src/constants/theme";
import { Input, Button } from "../../src/components";
import { authClient } from "../../src/services/auth/client";

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();
  const [email, setEmail] = useState(typeof params.email === "string" ? params.email : "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert("Check your email", "Enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await authClient.requestPasswordReset({
        email: normalizedEmail,
        redirectTo: "https://smarttrade.froshcodeorbit.site/auth/reset-password",
      });
      if (error) throw new Error(error.message);
      setSubmitted(true);
    } catch (error) {
      // Keep the response generic; do not reveal whether an account exists.
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.replace("/auth/login")}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed-outline" size={30} color={Colors.primary} />
        </View>
        <Text style={styles.title}>{submitted ? "Check your inbox" : "Forgot password?"}</Text>
        <Text style={styles.subtitle}>
          {submitted
            ? "If an account exists for that email, you will receive a password reset link shortly. Check your inbox and spam folder."
            : "Enter the email address associated with your SmartTrade account. We will send you a secure link to reset your password."}
        </Text>
        {!submitted ? (
          <>
            <Input
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              icon={<Ionicons name="mail-outline" size={20} color={Colors.primary} />}
            />
            <Button
              title="Send reset link"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submit}
            />
          </>
        ) : (
          <Button title="Back to sign in" onPress={() => router.replace("/auth/login")} style={styles.submit} />
        )}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <Link href="/auth/login" style={styles.link}>Sign in</Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FAFBFC" },
  container: { flex: 1, width: "100%", maxWidth: 480, alignSelf: "center", justifyContent: "center", padding: Spacing.xl },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", marginBottom: Spacing["2xl"], borderWidth: 1, borderColor: Colors.border },
  iconWrap: { width: 64, height: 64, borderRadius: BorderRadius.lg, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginBottom: Spacing.xl },
  title: { fontSize: Typography["2xl"], fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.base, lineHeight: 24, color: Colors.textSecondary, marginBottom: Spacing["2xl"] },
  submit: { marginTop: Spacing.md, minHeight: 52 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: Spacing["2xl"] },
  footerText: { color: Colors.textSecondary, fontSize: Typography.sm },
  link: { color: Colors.primaryDark, fontWeight: Typography.semibold, fontSize: Typography.sm },
});
