import { Pool, type PoolClient } from "pg";

const connectionString = process.env.VERCEL_ENV === "preview"
  ? process.env.SMARTTRADE_PREVIEW_DATABASE_URL
  : process.env.SMARTTRADE_DATABASE_URL;
if (process.env.VERCEL_ENV === "preview" && !connectionString) {
  throw new Error("SMARTTRADE_PREVIEW_DATABASE_URL is required; preview APIs will not fall back to production");
}
if (!connectionString) {
  throw new Error("SMARTTRADE_DATABASE_URL or DATABASE_URL is required for business-data APIs");
}

const globalForPool = globalThis as typeof globalThis & { smartTradeBusinessPool?: Pool };
export const businessPool =
  globalForPool.smartTradeBusinessPool ??
  new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPool.smartTradeBusinessPool = businessPool;
}

export async function withUserTransaction<T>(
  userId: string,
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await businessPool.connect();
  try {
    await client.query("BEGIN");
    // Transaction-local context is cleared automatically on COMMIT/ROLLBACK.
    await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
