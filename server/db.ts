import { Pool, PoolClient } from "pg";

const globalForPg = globalThis as typeof globalThis & { smartTradeDataPool?: Pool };

export const dataPool =
  globalForPg.smartTradeDataPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: true },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.smartTradeDataPool = dataPool;
}

export async function withUserTransaction<T>(
  userId: string,
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await dataPool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
