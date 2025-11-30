
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';
import { isAuthorized } from '../auth/check';

// This function ensures the category_settings table exists and syncs categories from content tables
async function ensureCategorySettings(client: any) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS category_settings (
      section VARCHAR(20) NOT NULL,
      name VARCHAR(255) NOT NULL,
      icon_name VARCHAR(50),
      show_in_sidebar BOOLEAN DEFAULT TRUE,
      sort_order INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (section, name)
    );
  `);

  // Sync Games
  await client.query(`
    INSERT INTO category_settings (section, name, icon_name)
    SELECT DISTINCT 'games', category, 'Gamepad2' 
    FROM games 
    WHERE category IS NOT NULL AND category != ''
    ON CONFLICT (section, name) DO NOTHING;
  `);

  // Sync Blogs
  await client.query(`
    INSERT INTO category_settings (section, name, icon_name)
    SELECT DISTINCT 'blogs', category, 'Book'
    FROM blog_posts 
    WHERE category IS NOT NULL AND category != ''
    ON CONFLICT (section, name) DO NOTHING;
  `);

  // Sync Products
  await client.query(`
    INSERT INTO category_settings (section, name, icon_name)
    SELECT DISTINCT 'products', category, 'ShoppingBag'
    FROM products 
    WHERE category IS NOT NULL AND category != ''
    ON CONFLICT (section, name) DO NOTHING;
  `);
}

export default async function handler(req: NextApiRequest & { method?: string }, res: NextApiResponse) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  let client;
  try {
    client = await getDbClient();
    await ensureCategorySettings(client);

    if (req.method === 'GET') {
      const result = await client.query(`
        SELECT 
          cs.*,
          CASE 
            WHEN cs.section = 'games' THEN (SELECT COUNT(*) FROM games WHERE category = cs.name)
            WHEN cs.section = 'blogs' THEN (SELECT COUNT(*) FROM blog_posts WHERE category = cs.name)
            WHEN cs.section = 'products' THEN (SELECT COUNT(*) FROM products WHERE category = cs.name)
            ELSE 0
          END as count
        FROM category_settings cs
        ORDER BY cs.section, cs.sort_order ASC, cs.name ASC
      `);
      res.status(200).json(result.rows);
    } else if (req.method === 'PUT') {
      const { section, name, icon_name, show_in_sidebar, sort_order } = req.body;
      
      await client.query(`
        INSERT INTO category_settings (section, name, icon_name, show_in_sidebar, sort_order)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (section, name) 
        DO UPDATE SET 
          icon_name = EXCLUDED.icon_name,
          show_in_sidebar = EXCLUDED.show_in_sidebar,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW()
      `, [section, name, icon_name, show_in_sidebar, sort_order]);
      
      res.status(200).json({ success: true });
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("API Error in /api/admin/categories:", error);
    res.status(500).json({ error: 'Erreur interne du serveur.', details: (error as Error).message });
  } finally {
    if (client) {
      client.release();
    }
  }
}
