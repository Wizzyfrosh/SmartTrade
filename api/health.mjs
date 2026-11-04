import { dataPool } from "../server/db.mjs";
import { authPool } from "../server/auth.mjs";

export default async function handler(_req, res) {
  try {
    await Promise.all([
      dataPool.query("SELECT 1"),
      authPool.query("SELECT 1"),
    ]);
    return res.status(200).json({
      status: "ok",
      database: "connected",
      authDatabase: "connected",
      storageConfigured: Boolean(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_ENDPOINT_URL_S3 &&
        process.env.NEON_STORAGE_BUCKET
      ),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(503).json({ status: "error", message: "Backend unavailable" });
  }
}
