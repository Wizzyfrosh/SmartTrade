import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Typography, BorderRadius } from "../../src/constants/theme";
import { Input, Button } from "../../src/components";
import { authClient } from "../../src/services/auth/client";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string | string[]; error?: string }>();
  const router = useRouter();
  const token = useMemo(() => Array.isArray(params.token) ? params.token[0] : params.token, [params.token]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!token) {
      Alert.alert("Invalid reset link", "This password reset link is missing its token. Request a new link.");
      return;
    }
    if (password.length < 8 || password.length > 128) {
      Alert.alert("Password requirements", "Your password must contain between 8 and 128 characters.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match", "Enter the same password in both fields.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await authClient.resetPassword({ newPassword: password, token });
      if (error) throw new Error(error.message);
      Alert.alert("Password updated", "Your SmartTrade password has been changed. Sign in with your new password.", [
        { text: "Continue", onPress: () => router.replace("/auth/login") },
      ]);
    } catch (error: any) {
      Alert.alert("Unable to reset password", error?.message || "This link may have expired or already been used. Request a new reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark-outline" size={30} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Create a new password</Text>
        <Text style={styles.subtitle}>Choose a strong password you have not used for SmartTrade before.</Text>
        {!token ? (
          <>
            <Text style={styles.error}>This reset link is invalid or incomplete.</Text>
            <Button title="Request a new link" onPress={() => router.replace("/auth/forgot-password")} style={styles.submit} />
          </>
        ) : (
          <>
            <Input
              label="New password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />}
              rightIcon={<Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />}
              onRightIconPress={() => setShowPassword((value) => !value)}
            />
            <Input
              label="Confirm new password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />}
            />
            <Button title="Update password" onPress={handleReset} loading={loading} disabled={loading} style={styles.submit} />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FAFBFC" },
  container: { flex: 1, width: "100%", maxWidth: 480, alignSelf: "center", justifyContent: "center", padding: Spacing.xl },
  iconWrap: { width: 64, height: 64, borderRadius: BorderRadius.lg, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginBottom: Spacing.xl },
  title: { fontSize: Typography["2xl"], fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.base, lineHeight: 24, color: Colors.textSecondary, marginBottom: Spacing["2xl"] },
  error: { color: Colors.error, fontSize: Typography.sm },
  submit: { marginTop: Spacing.lg, minHeight: 52 },
});
