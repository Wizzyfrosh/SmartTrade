import React, { useState } from "react";
import { Alert, Image, StyleSheet } from "react-native";
import { authClient } from "../services/auth/client";
import { Button } from "./Button";

export const GoogleAuthButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      if (error) throw new Error(error.message);
    } catch (error: any) {
      Alert.alert("Google Sign-In Error", error?.message || "Unable to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      title={loading ? "Connecting..." : "Continue with Google"}
      onPress={handleGoogleSignIn}
      variant="outline"
      style={styles.button}
      disabled={loading}
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
