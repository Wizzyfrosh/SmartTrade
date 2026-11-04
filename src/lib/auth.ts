import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { Pool } from "pg";

const databaseUrl = process.env.BETTER_AUTH_DATABASE_URL || process.env.DATABASE_URL;
const authSecret = process.env.BETTER_AUTH_SECRET;
const authUrl = process.env.BETTER_AUTH_URL;

if (!databaseUrl) throw new Error("DATABASE_URL is required");
if (!authSecret) throw new Error("BETTER_AUTH_SECRET is required");
if (!authUrl) throw new Error("BETTER_AUTH_URL is required");

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
  "http://localhost:8081",
  "http://localhost:19006",
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
