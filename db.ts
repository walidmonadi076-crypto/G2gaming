import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

// تعريف global variable باش نتفاداو المشاكل ديال كثرة الاتصالات فاش كيوقع reload
declare global {
  var pgPool: Pool | undefined;
}

let pool: Pool;

export function getPool(): Pool {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (process.env.NODE_ENV === "production") {
    // في Production كنخدمو ب pool عادي
    // كنقصو عدد connexions (max: 2) باش منتجاوزوش الحدود ديال Vercel/Neon
    if (!pool) {
      pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 2, // Reduced to prevent "too many clients" errors on serverless
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000, // Increased timeout to 15s
        keepAlive: true,
      });
    }
    return pool;
  } else {
    // في Development كنستعملو global variable باش ميتعاودش يتكريا pool كل مرة
    if (!globalThis.pgPool) {
      globalThis.pgPool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
      });
    }
    return globalThis.pgPool;
  }
}

export async function query(text: string, params?: any[]) {
  const pool = getPool();
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 100) {
      console.log("Slow query detected:", { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

export async function getDbClient() {
  const pool = getPool();
  return pool.connect();
}

export async function testConnection() {
  const pool = getPool();

  try {
    const res = await pool.query("SELECT NOW()");
    return res.rows[0];
  } catch (err) {
    console.error("Database Connection Test Failed:", err);
    throw err;
  }
}
