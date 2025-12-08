
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const offset = (page - 1) * limit;
  
  const store = req.query.store as string; // Filter by store (e.g. 'Steam')
  const platform = req.query.platform as string; // Filter by platform
  const tag = req.query.tag as string; // Filter by tag
  const sortBy = req.query.sortBy as string || 'newest'; // 'newest', 'ending_soon', 'value'

  const client = await getDbClient();

  try {
    // Check if table exists (graceful degradation)
    const tableCheck = await client.query(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'free_game_deals'
        );
    `);
    
    if (!tableCheck.rows[0].exists) {
         return res.status(200).json({ deals: [], pagination: { total: 0, page, limit } });
    }

    // Build Query
    let whereClause = `WHERE is_active = TRUE AND (ends_at IS NULL OR ends_at > NOW())`;
    const values: any[] = [];
    let paramCounter = 1;

    if (store) {
      whereClause += ` AND store_name ILIKE $${paramCounter}`;
      values.push(`%${store}%`);
      paramCounter++;
    }

    if (platform) {
      whereClause += ` AND platform ILIKE $${paramCounter}`;
      values.push(platform);
      paramCounter++;
    }
    
    if (tag) {
       whereClause += ` AND $${paramCounter} = ANY(tags)`;
       values.push(tag);
       paramCounter++;
    }

    // Sort Logic
    let orderBy = 'ORDER BY created_at DESC';
    if (sortBy === 'ending_soon') {
      orderBy = 'ORDER BY ends_at ASC NULLS LAST'; 
    } else if (sortBy === 'value') {
      orderBy = 'ORDER BY normal_price DESC';
    }

    // 1. Get Total Count
    const countQuery = `SELECT COUNT(*) FROM free_game_deals ${whereClause}`;
    const countRes = await client.query(countQuery, values);
    const totalItems = parseInt(countRes.rows[0].count, 10);

    // 2. Get Data
    const dataQuery = `
      SELECT id, title, store_name, normal_price, sale_price, image_url, deal_url, ends_at, tags, platform 
      FROM free_game_deals 
      ${whereClause} 
      ${orderBy} 
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;
    
    values.push(limit, offset);
    
    const result = await client.query(dataQuery, values);
    
    // Cache headers for performance
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    res.status(200).json({
      deals: result.rows,
      pagination: {
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit)
      }
    });

  } catch (error) {
    console.error('API Error /api/free-games:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
}
