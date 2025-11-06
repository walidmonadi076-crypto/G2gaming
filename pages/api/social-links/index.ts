import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';
import type { SocialLink } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SocialLink[] | { error: string }>
) {
  const client = await getDbClient();
  try {
    const result = await client.query(
      'SELECT id, name, url, icon_svg FROM social_links ORDER BY id ASC'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  } finally {
    client.release();
  }
}
