import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';

const ALLOWED_TABLES = {
  games: 'games',
  blogs: 'blog_posts',
  products: 'products',
};

// FIX: Add method to NextApiRequest type to resolve TypeScript error.
export default async function handler(req: NextApiRequest & { method?: string }, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type, slug } = req.body;

  if (!type || !slug || !Object.keys(ALLOWED_TABLES).includes(type)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  
  // @ts-ignore
  const tableName = ALLOWED_TABLES[type];
  const client = await getDbClient();
  
  try {
    // Using a prepared statement to prevent SQL injection
    const query = `UPDATE ${tableName} SET view_count = COALESCE(view_count, 0) + 1 WHERE slug = $1`;
    await client.query(query, [slug]);
    res.status(202).json({ success: true });
  } catch (error) {
    console.error(`Error tracking view for ${type}/${slug}:`, error);
    // Return a 500 error but don't expose details
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}
