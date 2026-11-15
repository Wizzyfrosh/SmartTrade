import { toNodeHandler } from "better-auth/node";
import { auth } from "../../src/lib/auth.js";

const betterAuthHandler = toNodeHandler(auth);

export default async function authHandler(req: Parameters<typeof betterAuthHandler>[0], res: Parameters<typeof betterAuthHandler>[1]) {
  // Temporary production diagnostics: never log request bodies, credentials, or tokens.
  console.info("[SmartTrade Auth] Request received", {
    method: req.method,
    path: (req.url || "").split("?")[0],
    origin: req.headers.origin,
    host: req.headers.host,
  });

  try {
    await betterAuthHandler(req, res);
  } catch (error) {
    console.error("[SmartTrade Auth] Handler failed", {
      method: req.method,
      path: (req.url || "").split("?")[0],
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (!res.headersSent) {
      res.statusCode = 500;
      res.end("Authentication service error");
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
