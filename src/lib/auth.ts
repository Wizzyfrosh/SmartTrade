import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { Pool } from "pg";

const isPreview = process.env.VERCEL_ENV === "preview";
const databaseUrl = isPreview
  ? process.env.SMARTTRADE_PREVIEW_AUTH_DATABASE_URL
  : process.env.BETTER_AUTH_DATABASE_URL;
const authSecret = isPreview
  ? process.env.SMARTTRADE_PREVIEW_AUTH_SECRET
  : process.env.BETTER_AUTH_SECRET;
const authUrl = isPreview
  ? process.env.SMARTTRADE_PREVIEW_AUTH_URL
  : process.env.BETTER_AUTH_URL;

if (!databaseUrl) throw new Error(isPreview ? "SMARTTRADE_PREVIEW_AUTH_DATABASE_URL is required" : "BETTER_AUTH_DATABASE_URL is required");
if (!authSecret) throw new Error(isPreview ? "SMARTTRADE_PREVIEW_AUTH_SECRET is required" : "BETTER_AUTH_SECRET is required");
if (!authUrl) throw new Error(isPreview ? "SMARTTRADE_PREVIEW_AUTH_URL is required" : "BETTER_AUTH_URL is required");

const globalForPool = globalThis as typeof globalThis & { smartTradePool?: Pool };
const pool = globalForPool.smartTradePool ?? new Pool({
  connectionString: databaseUrl,
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});
if (process.env.NODE_ENV !== "production") globalForPool.smartTradePool = pool;

const trustedOrigins = [
  authUrl,
  "smarttrade://",
  ...(process.env.NODE_ENV !== "production"
    ? ["http://localhost:8081", "http://localhost:19006"]
    : []),
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []),
];

export const auth = betterAuth({
  appName: "SmartTrade",
  baseURL: authUrl,
  secret: authSecret,
  database: pool,
  trustedOrigins: [...new Set(trustedOrigins)],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {},
  plugins: [expo()],
});
