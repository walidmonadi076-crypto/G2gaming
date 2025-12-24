
import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "pg";
import { isAuthorized } from "./auth/check";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL not configured" });
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query('BEGIN');

    // Update Games Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        image_url TEXT,
        category VARCHAR(100),
        tags TEXT[],
        theme VARCHAR(50),
        accent_color VARCHAR(20),
        description TEXT,
        video_url TEXT,
        download_url TEXT,
        gallery TEXT[],
        view_count INTEGER DEFAULT 0,
        platform VARCHAR(20) DEFAULT 'pc',
        requirements JSONB,
        download_url_ios TEXT,
        icon_url TEXT,
        background_url TEXT,
        rating DECIMAL(5,2) DEFAULT 95,
        downloads_count INTEGER DEFAULT 1000,
        is_pinned BOOLEAN DEFAULT FALSE
      );
    `);
    await client.query(`ALTER TABLE games ADD COLUMN IF NOT EXISTS accent_color VARCHAR(20)`);

    // Update Blog Posts Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        image_url TEXT,
        video_url TEXT,
        author VARCHAR(100),
        publish_date DATE,
        rating DECIMAL(3, 1),
        accent_color VARCHAR(20),
        affiliate_url TEXT,
        content TEXT,
        category VARCHAR(100),
        view_count INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE
      );
    `);
    await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS accent_color VARCHAR(20)`);

    // Update Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        image_url TEXT,
        video_url TEXT,
        price DECIMAL(10, 2),
        url TEXT,
        accent_color VARCHAR(20),
        description TEXT,
        gallery TEXT[],
        category VARCHAR(100),
        view_count INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE
      );
    `);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS accent_color VARCHAR(20)`);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: "Database logic updated for Neon support. Accent colors added." });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: (error as Error).message });
  } finally {
    await client.end();
  }
}
