import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

const authBaseURL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://smarttrade-inventotryapp.vercel.app";

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [
    expoClient({
      scheme: "smarttrade",
      storagePrefix: "smarttrade",
      storage: SecureStore,
    }),
  ],
});

export type AuthSession = typeof authClient.$Infer.Session;
export type AuthUser = AuthSession["user"];
