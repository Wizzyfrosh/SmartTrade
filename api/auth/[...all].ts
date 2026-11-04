import { toNodeHandler } from "better-auth/node";
export const config = { api: { bodyParser: false } };

export default async function handler(req: any, res: any) {
  try {
    const { auth } = await import("../../server/auth.js");
    return toNodeHandler(auth.handler)(req, res);
  } catch (error) {
    console.error("Better Auth route initialization failed:", error);
    return res.status(500).json({ error: "Authentication service unavailable" });
  }
}
