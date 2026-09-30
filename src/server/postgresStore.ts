import { Pool } from 'pg';

interface JsonStoreRow<T> {
  payload: T;
}

let pool: Pool | undefined;
let writeQueue: Promise<void> = Promise.resolve();

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for production storage.');
  }
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

export async function initializePostgresStore(): Promise<void> {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS nduluni_app_store (
      store_key TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function readPostgresStore<T>(key: string): Promise<T | undefined> {
  const result = await getPool().query<JsonStoreRow<T>>(
    'SELECT payload FROM nduluni_app_store WHERE store_key = $1',
    [key]
  );
  return result.rows[0]?.payload;
}

export async function writePostgresStore<T>(key: string, payload: T): Promise<void> {
  const serialized = JSON.stringify(payload);
  const write = writeQueue.then(() => getPool().query(
    `INSERT INTO nduluni_app_store (store_key, payload, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (store_key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [key, serialized]
  )).then(() => undefined);
  writeQueue = write.catch(() => undefined);
  await write;
}

export async function closePostgresStore(): Promise<void> {
  if (!pool) return;
  await pool.end();
  pool = undefined;
}
