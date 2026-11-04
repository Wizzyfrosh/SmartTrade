import type { IncomingMessage, ServerResponse } from "node:http";
import { dataPool } from "../server/db";

type Response = ServerResponse & { status: (code: number) => Response; json: (value: unknown) => void };

export default async function handler(_req: IncomingMessage, res: Response) {
  try {
    await dataPool.query("SELECT 1");
    return res.status(200).json({
      status: "ok",
      database: "connected",
      authConfigured: Boolean(process.env.BETTER_AUTH_DATABASE_URL && process.env.BETTER_AUTH_SECRET),
      storageConfigured: Boolean(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_ENDPOINT_URL_S3 &&
        process.env.NEON_STORAGE_BUCKET
      ),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(503).json({ status: "error", database: "unavailable" });
  }
}
