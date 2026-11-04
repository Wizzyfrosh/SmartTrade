import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { Pool } from "pg";

const globalForPg = globalThis as typeof globalThis & { smartTradePool?: Pool };

const pool =
  globalForPg.smartTradePool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: true },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.smartTradePool = pool;
}

const trustedOrigins = [
  "https://smarttrade-inventotryapp.vercel.app",
  "smarttrade://",
  "http://localhost:8081",
  "http://localhost:19006",
  ...(process.env.NODE_ENV === "development"
    ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
    : []),
];

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  appName: "SmartTrade",
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  plugins: [expo()],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  ...(googleConfigured
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        },
      }
    : {}),
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
