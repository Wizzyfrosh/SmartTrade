import { authClient } from "./client";

export async function authenticatedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const cookie = await authClient.getCookie();
  const headers = new Headers(init.headers);

  if (cookie) headers.set("Cookie", cookie);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(
    `${process.env.EXPO_PUBLIC_API_URL || "https://smarttrade-inventotryapp.vercel.app"}${path}`,
    {
      ...init,
      headers,
      credentials: "omit",
    },
  );
}
