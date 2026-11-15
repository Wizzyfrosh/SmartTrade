import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { Colors, Spacing, Typography, BorderRadius } from "../../src/constants/theme";
import { Input, Button } from "../../src/components";
import { authClient, AUTH_BASE_URL } from "../../src/services/auth/client";

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(typeof params.email === "string" ? params.email : "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMessage("Enter a valid email address to continue.");
      return;
    }

    try {
      setErrorMessage("");
      setLoading(true);
      const { error } = await authClient.requestPasswordReset({
        email: normalizedEmail,
        redirectTo: `${AUTH_BASE_URL.replace(/\/$/, "")}/auth/reset-password`,
      });
      if (error) throw new Error(error.message);
      setSubmitted(true);
    } catch {
      setErrorMessage("We couldn't process your request right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Link href="/auth/login" asChild>
            <TouchableOpacity style={styles.backLink} accessibilityRole="link">
              <Text style={styles.backLinkText}>Back to sign in</Text>
            </TouchableOpacity>
          </Link>

          <View style={styles.brandRow}>
            <View style={styles.brandMark} />
            <Text style={styles.brandName}>SMARTTRADE</Text>
            <Text style={styles.brandDivider}>/</Text>
            <Text style={styles.brandSection}>ACCOUNT ACCESS</Text>
          </View>

          <Text style={styles.eyebrow}>PASSWORD RECOVERY</Text>
          <Text style={styles.title}>{submitted ? "Request received" : "Reset your password"}</Text>
          <Text style={styles.subtitle}>
            {submitted
              ? "If this email is registered with SmartTrade, a secure reset link will be sent. Check your inbox and spam folder."
              : "Enter the email address you use for SmartTrade. We'll send a secure, time-limited link if it is registered with an account."}
          </Text>

          {!submitted ? (
            <View style={styles.form}>
              <Input
                label="Email address"
                placeholder="name@example.com"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (errorMessage) setErrorMessage("");
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
              />
              {errorMessage ? <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text> : null}
              <Button
                title={loading ? "Sending request..." : "Send recovery link"}
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.submit}
              />
            </View>
          ) : (
            <View style={styles.successPanel}>
              <Text style={styles.successTitle}>Next steps</Text>
              <Text style={styles.successText}>Check your inbox and spam folder. If no message arrives, verify the address and try again later.</Text>
              <Button title="Return to sign in" onPress={() => { setSubmitted(false); setErrorMessage(""); }} style={styles.submit} />
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Need help accessing your account?</Text>
            <Text style={styles.footerHint}>Contact SmartTrade support for assistance.</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8FC" },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingVertical: 36 },
  container: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: 28,
  },
  backLink: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", marginBottom: 42 },
  backLinkText: { color: "#344054", fontSize: 14, fontWeight: "600" },
  brandRow: { flexDirection: "row", alignItems: "center", marginBottom: 46 },
  brandMark: { width: 5, height: 22, borderRadius: 3, backgroundColor: "#0F766E", marginRight: 10 },
  brandName: { color: "#101828", fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  brandDivider: { color: "#98A2B3", marginHorizontal: 9, fontSize: 12 },
  brandSection: { color: "#667085", fontSize: 10, fontWeight: "700", letterSpacing: 1.2 },
  eyebrow: { color: "#0F766E", fontSize: 11, fontWeight: "800", letterSpacing: 1.8, marginBottom: 12 },
  title: { color: "#101828", fontSize: 34, lineHeight: 41, fontWeight: "800", letterSpacing: -0.8, marginBottom: 12 },
  subtitle: { color: "#667085", fontSize: 15, lineHeight: 25, marginBottom: 32 },
  form: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E4EAF1", borderRadius: 18, padding: 22 },
  error: { color: "#B42318", backgroundColor: "#FEF3F2", borderColor: "#FECDCA", borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 13, lineHeight: 19, marginTop: 2 },
  submit: { marginTop: 16, minHeight: 54 },
  successPanel: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E4EAF1", borderRadius: 18, padding: 22 },
  successTitle: { color: "#101828", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  successText: { color: "#667085", fontSize: 14, lineHeight: 22 },
  footer: { marginTop: 34, alignItems: "center" },
  footerText: { color: "#344054", fontSize: 13, fontWeight: "600" },
  footerHint: { color: "#98A2B3", fontSize: 12, marginTop: 5, textAlign: "center" },
});
