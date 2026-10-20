import "server-only";
import { Pool, type QueryResultRow } from "pg";

// One pool per process (survives hot reloads in development).
const g = globalThis as unknown as { __aihPool?: Pool };

export function dbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function pool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!g.__aihPool) {
    g.__aihPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DB_POOL_MAX || 5),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    g.__aihPool.on("error", (err) => console.error("[db] idle client error", err.message));
  }
  return g.__aihPool;
}

/** Parameterised query. Always pass values through `params`, never string-concatenate them. */
export async function q<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []) {
  const res = await pool().query<T>(sql, params);
  return res.rows;
}

export async function one<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []) {
  const rows = await q<T>(sql, params);
  return rows[0] ?? null;
}

/**
 * For the public site: returns null instead of throwing when the database is missing or down,
 * so pages fall back to the content built into the code.
 */
export async function safeQ<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []) {
  if (!dbConfigured()) return null;
  try {
    return await q<T>(sql, params);
  } catch (err) {
    console.error("[db] public query failed, using built-in content:", (err as Error).message);
    return null;
  }
}

export async function tx<T>(fn: (query: <R extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]) => Promise<R[]>) => Promise<T>) {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(async (sql, params = []) => (await client.query(sql, params)).rows);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
