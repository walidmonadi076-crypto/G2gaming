import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';

export default async function handler(req: NextApiRequest & { method?: string }, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { section } = req.query;
  if (!section || typeof section !== 'string') {
      return res.status(400).json({ error: 'Section parameter is required' });
  }

  // Map public section names to DB section names
  // Sidebar uses: games, blog, shop
  // DB/Admin uses: games, blogs, products
  const sectionMap: Record<string, string> = {
      'games': 'games',
      'blog': 'blogs',
      'shop': 'products'
  };

  const dbSection = sectionMap[section];
  if (!dbSection) {
      return res.status(400).json({ error: 'Invalid section' });
  }

  let client;
  try {
    client = await getDbClient();
    
    // Check if table exists first to avoid crashing on first run
    const tableCheck = await client.query(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'category_settings'
        );
    `);
    
    if (!tableCheck.rows[0].exists) {
        // Fallback if table doesn't exist yet
        return res.status(200).json([]);
    }

    const result = await client.query(`
      SELECT name, icon_name
      FROM category_settings
      WHERE section = $1 AND show_in_sidebar = TRUE
      ORDER BY sort_order ASC, name ASC
    `, [dbSection]);

    // Format for frontend
    const categories = result.rows.map(row => ({
        id: row.name, // Use name as ID for simplicity in filtering
        name: row.name,
        slug: row.name, // Slugify if needed, but current app uses name param
        icon_name: row.icon_name || 'Gamepad2'
    }));

    // Cache for performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json(categories);

  } catch (error) {
    console.error("API Error in /api/public/sidebar-categories:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) client.release();
  }
}