import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

export const AUTH_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  "https://smarttrade.froshcodeorbit.site";

if (!AUTH_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL or expo.extra.apiUrl must be configured for this build");
}

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  plugins: [
    expoClient({
      scheme: "smarttrade",
      storagePrefix: "smarttrade",
      storage: SecureStore,
    }),
  ],
});
