import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import pg from "pg";

const { Pool } = pg;
const globalForPg = globalThis;

export const authPool =
  globalForPg.smartTradeAuthPool ||
  new Pool({
    connectionString: process.env.BETTER_AUTH_DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: true },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.smartTradeAuthPool = authPool;
}

const trustedOrigins = [
  "https://smarttrade-inventotryapp.vercel.app",
  "https://dist-git-neon-migration-umanor-wisdom-chizoba-s-projects.vercel.app",
  "smarttrade://",
  "http://localhost:8081",
  "http://localhost:19006",
];

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  appName: "SmartTrade",
  database: authPool,
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
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    database: {
      // The schema is versioned and applied by database/neon migrations.
      // Skip runtime introspection because Neon pooled connections do not
      // expose the metadata consistently to this restricted application role.
      validateSchema: false,
    },
  },
});
