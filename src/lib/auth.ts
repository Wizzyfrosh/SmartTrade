import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { Pool } from "pg";

// Vercel scopes these values by deployment environment. Use the same variable
// names in Preview and Production; Vercel supplies the environment-specific value.
const databaseUrl = process.env.BETTER_AUTH_DATABASE_URL;
const authSecret = process.env.BETTER_AUTH_SECRET;
const authUrl = process.env.BETTER_AUTH_URL;

if (!databaseUrl) throw new Error("BETTER_AUTH_DATABASE_URL is required");
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
  // Vercel and canonical web hosts are added from baseURL.allowedHosts.
  "smarttrade://",
  ...(process.env.NODE_ENV !== "production"
    ? ["http://localhost:8081", "http://localhost:19006"]
    : []),
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []),
];

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

async function sendPasswordResetEmail(to: string, resetUrl: string, userName?: string | null) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "SmartTrade";

  if (!apiKey || !senderEmail) {
    throw new Error("Brevo password-reset email configuration is incomplete.");
  }

  const safeName = escapeHtml(userName?.trim() || "there");
  const safeUrl = escapeHtml(resetUrl);
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "accept": "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject: "Reset your SmartTrade password",
      textContent: [
        `Hello ${userName?.trim() || "there"},`,
        "",
        "We received a request to reset your SmartTrade password.",
        "Use the secure link below to choose a new password:",
        resetUrl,
        "",
        "This link expires in 60 minutes and can only be used once.",
        "If you did not request this change, you can ignore this email.",
        "",
        "SmartTrade Support",
      ].join("\n"),
      htmlContent: `<!doctype html><html><body style="margin:0;padding:32px;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;padding:36px" cellspacing="0" cellpadding="0"><tr><td><div style="font-size:22px;font-weight:700;color:#0f766e">SmartTrade</div><h1 style="font-size:24px;margin:28px 0 12px">Reset your password</h1><p style="font-size:15px;line-height:1.6">Hello ${safeName},</p><p style="font-size:15px;line-height:1.6">We received a request to reset your SmartTrade password. Use the button below to choose a new password.</p><p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;padding:14px 22px;border-radius:9px;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:700">Reset password</a></p><p style="font-size:13px;line-height:1.6;color:#64748b">This link expires in 60 minutes and can only be used once. If you did not request this change, you can safely ignore this email.</p><p style="font-size:13px;color:#64748b;margin-top:28px">SmartTrade Support</p></td></tr></table></td></tr></table></body></html>`,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("Brevo password-reset delivery failed", {
      status: response.status,
      response: errorBody.slice(0, 500),
    });
    throw new Error("Unable to deliver password-reset email.");
  }
}

export const auth = betterAuth({
  appName: "SmartTrade",
  // Resolve auth URLs and cookie scope from the actual host serving this deployment.
  // This supports the canonical domain and this Vercel project's deployment hosts
  // without redirecting API requests across origins.
  baseURL: {
    allowedHosts: [
      "smarttrade.froshcodeorbit.site",
      "smarttrade-inventotryapp.vercel.app",
      "*.umanor-wisdom-chizoba-s-projects.vercel.app",
    ],
    protocol: "https",
    fallback: authUrl,
  },
  secret: authSecret,
  database: pool,
  trustedOrigins: [...new Set(trustedOrigins)],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendPasswordResetEmail(user.email, url, user.name);
      } catch (error) {
        // Do not expose account existence or provider details to the requester.
        console.error("SmartTrade password-reset email could not be sent.", error);
      }
    },
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
