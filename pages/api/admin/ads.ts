
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';
import { isAuthorized } from '../auth/check';

export default async function handler(req: NextApiRequest & { method?: string }, res: NextApiResponse) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  let client;
  try {
    client = await getDbClient();
    if (req.method === 'GET') {
      const result = await client.query('SELECT placement, code, fallback_code FROM ads');
      res.status(200).json(result.rows);
    } else if (req.method === 'POST') {
      const adConfigs: Record<string, { code: string, fallback_code: string }> = req.body;
      
      await client.query('BEGIN');
      for (const placement in adConfigs) {
        const { code, fallback_code } = adConfigs[placement];
        await client.query(
          `INSERT INTO ads (placement, code, fallback_code) 
           VALUES ($1, $2, $3)
           ON CONFLICT (placement) 
           DO UPDATE SET code = EXCLUDED.code, fallback_code = EXCLUDED.fallback_code, updated_at = NOW()`,
          [placement, code, fallback_code]
        );
      }
      await client.query('COMMIT');
      res.status(200).json({ success: true, message: 'Ad ecosystem synchronized.' });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) client.release();
  }
}
