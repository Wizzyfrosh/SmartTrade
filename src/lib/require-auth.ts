import { fromNodeHeaders } from "better-auth/node";
import type { IncomingMessage, ServerResponse } from "node:http";
import { auth } from "./auth";

export async function requireAuth(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return null;
  }

  return session;
}
