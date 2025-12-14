
import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "pg";
import { GAMES_DATA } from "../../data/games";
import { BLOGS_DATA, COMMENTS_DATA } from "../../data/blogs";
import { PRODUCTS_DATA } from "../../data/products";
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

    // 1. Ensure Table Structure supports new features (Schema Migration)
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        image_url TEXT,
        category VARCHAR(100),
        tags TEXT[],
        theme VARCHAR(50),
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

    // Ensure columns exist even if table was already created
    await client.query(`ALTER TABLE games ADD COLUMN IF NOT EXISTS platform VARCHAR(20) DEFAULT 'pc'`);
    await client.query(`ALTER TABLE games ADD COLUMN IF NOT EXISTS requirements JSONB`);
    await client.query(`ALTER TABLE games ADD COLUMN IF NOT EXISTS download_url_ios TEXT`);
    await client.query(`ALTER TABLE games ADD COLUMN IF NOT EXISTS icon_url TEXT`);
    await client.query(`ALTER TABLE games ADD COLUMN IF NOT EXISTS background_url TEXT`);
    await client.query(`ALTER TABLE games ADD COLUMN IF NOT EXISTS rating DECIMAL(5,2) DEFAULT 95`);
    await client.query(`ALTER TABLE games ADD COLUMN IF NOT EXISTS downloads_count INTEGER DEFAULT 1000`);
    await client.query(`ALTER TABLE games ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE`);

    // ... (Keep existing blog/product/comment table creation logic) ...
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
        affiliate_url TEXT,
        content TEXT,
        category VARCHAR(100),
        view_count INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE
      );
    `);
    
    await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        image_url TEXT,
        price DECIMAL(10, 2),
        url TEXT,
        description TEXT,
        gallery TEXT[],
        category VARCHAR(100),
        view_count INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE
      );
    `);
    
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        blog_post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
        author VARCHAR(100),
        avatar_url TEXT,
        date VARCHAR(50),
        text TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        email VARCHAR(255),
        phone VARCHAR(50)
      );
    `);

    // 2. Clear existing data
    await client.query("DELETE FROM comments");
    await client.query("DELETE FROM blog_posts");
    await client.query("DELETE FROM games");
    await client.query("DELETE FROM products");
    
    // 3. Reset Sequences
    await client.query("ALTER SEQUENCE comments_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE blog_posts_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE games_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE products_id_seq RESTART WITH 1");

    // 4. Insert Games with new fields
    for (const game of GAMES_DATA) {
      await client.query(
        `INSERT INTO games (id, slug, title, image_url, category, tags, theme, description, video_url, download_url, download_url_ios, gallery, platform, requirements, icon_url, background_url, rating, downloads_count, is_pinned) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
            game.id, 
            game.slug, 
            game.title, 
            game.imageUrl, 
            game.category, 
            game.tags || [], 
            game.theme || null, 
            game.description, 
            game.videoUrl || null, 
            game.downloadUrl, 
            game.downloadUrlIos || null, 
            game.gallery,
            game.platform || 'pc',
            game.requirements || null,
            null, // icon_url 
            null,  // background_url
            95, // default rating
            1500, // default downloads
            false // default is_pinned
        ]
      );
    }

    // 5. Insert Blogs
    for (const blog of BLOGS_DATA) {
      await client.query(
        `INSERT INTO blog_posts (id, slug, title, summary, image_url, video_url, author, publish_date, rating, affiliate_url, content, category, is_pinned) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [blog.id, blog.slug, blog.title, blog.summary, blog.imageUrl, blog.videoUrl || null, blog.author, blog.publishDate, blog.rating, blog.affiliateUrl, blog.content, blog.category, false]
      );
    }

    // 6. Insert Products
    for (const product of PRODUCTS_DATA) {
      const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;
      await client.query(
        `INSERT INTO products (id, slug, name, image_url, price, url, description, gallery, category, is_pinned) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [product.id, product.slug, product.name, product.imageUrl, numericPrice, product.url, product.description, product.gallery, product.category, false]
      );
    }

    // 7. Insert Comments
    for (const [blogId, comments] of Object.entries(COMMENTS_DATA)) {
      for (const comment of (comments as any[])) {
        await client.query(
          `INSERT INTO comments (id, blog_post_id, author, avatar_url, date, text, status, email) 
           VALUES ($1, $2, $3, $4, $5, $6, 'approved', $7)`,
          [comment.id, parseInt(blogId), comment.author, comment.avatarUrl, comment.date, comment.text, `seeduser${comment.id}@example.com`]
        );
      }
    }

    // 8. Fix Sequences
    await client.query(`SELECT setval('games_id_seq', (SELECT MAX(id) FROM games), true)`);
    await client.query(`SELECT setval('blog_posts_id_seq', (SELECT MAX(id) FROM blog_posts), true)`);
    await client.query(`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products), true)`);
    await client.query(`SELECT setval('comments_id_seq', (SELECT MAX(id) FROM comments), true)`);
    
    await client.query('COMMIT');

    res.status(200).json({ 
      success: true, 
      message: "Data migrated and schema updated successfully",
      counts: {
        games: GAMES_DATA.length,
        blogs: BLOGS_DATA.length,
        products: PRODUCTS_DATA.length,
        comments: Object.values(COMMENTS_DATA).flat().length
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  } finally {
    await client.end();
  }
}
