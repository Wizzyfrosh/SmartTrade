import React, { useState } from "react";
import { StyleSheet, Alert, Image } from "react-native";
import { authClient } from "../services/auth/client";
import { Button } from "./Button";

const googleEnabled = process.env.EXPO_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export const GoogleAuthButton = () => {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    if (!googleEnabled) {
      Alert.alert(
        "Google sign-in unavailable",
        "Google OAuth credentials have not been fully configured yet. Please sign in with your email and password."
      );
      return;
    }

    try {
      setLoading(true);
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "smarttrade://",
      });
      if (error) throw new Error(error.message);
    } catch (error: any) {
      Alert.alert("Google Sign-In Error", error?.message || "Unable to start Google sign-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      title={loading ? "Connecting..." : "Continue with Google"}
      onPress={signInWithGoogle}
      variant="outline"
      style={styles.button}
      loading={loading}
      disabled={loading || !googleEnabled}
      icon={<Image source={require("../../assets/icons/google_icon.png")} style={styles.googleIcon} />}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderColor: "#ddd",
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
});
