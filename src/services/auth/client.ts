import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";

export const AUTH_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  "https://smarttrade.froshcodeorbit.site";

if (!AUTH_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL or expo.extra.apiUrl must be configured for this build");
}

// On web, use the host serving the app so authentication cookies stay same-origin.
const authClientBaseURL = Platform.OS === "web" && typeof window !== "undefined"
  ? window.location.origin
  : AUTH_BASE_URL;

export const authClient = createAuthClient({
  baseURL: authClientBaseURL,
  plugins: [
    expoClient({
      scheme: "smarttrade",
      storagePrefix: "smarttrade",
      storage: SecureStore,
    }),
  ],
});
