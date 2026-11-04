import { Platform } from "react-native";
import { authClient } from "./client";

export async function authenticatedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const isNative = Platform.OS !== "web";

  if (isNative) {
    const cookie = await authClient.getCookie();
    if (cookie) headers.set("Cookie", cookie);
  }

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(
    `${process.env.EXPO_PUBLIC_API_URL || "https://smarttrade-inventotryapp.vercel.app"}${path}`,
    {
      ...init,
      headers,
      credentials: isNative ? "omit" : "include",
    },
  );
}
