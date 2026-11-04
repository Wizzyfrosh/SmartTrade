import { dataPool } from "../server/db.mjs";
import { authPool } from "../server/auth.mjs";

export default async function handler(_req, res) {
  try {
    const [dataResult, authResult] = await Promise.all([
      dataPool.query("SELECT current_database() AS database_name, current_user AS role_name"),
      authPool.query("SELECT current_database() AS database_name, current_user AS role_name"),
    ]);
    return res.status(200).json({
      status: "ok",
      database: dataResult.rows[0],
      authDatabase: authResult.rows[0],
      storageConfigured: Boolean(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_ENDPOINT_URL_S3 &&
        process.env.NEON_STORAGE_BUCKET
      ),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(503).json({ status: "error", message: error.message });
  }
}
