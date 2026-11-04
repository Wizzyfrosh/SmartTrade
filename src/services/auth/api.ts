import { Platform } from "react-native";
import Constants from "expo-constants";
import { authClient } from "./client";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  "https://smarttrade-inventotryapp.vercel.app";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (!headers.has("content-type") && init.body && typeof init.body === "string") {
    headers.set("content-type", "application/json");
  }

  if (Platform.OS !== "web") {
    const cookie = await authClient.getCookie();
    if (cookie) headers.set("cookie", cookie);
  }

  return fetch(new URL(path.replace(/^\//, ""), API_URL.endsWith("/") ? API_URL : API_URL + "/").toString(), {
    ...init,
    headers,
    credentials: Platform.OS === "web" ? "include" : "omit",
    cache: init.cache ?? "no-store",
  });
}
