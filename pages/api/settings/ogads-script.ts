import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ src: string | null } | { error: string }>
) {
  const client = await getDbClient();
  try {
    const result = await client.query(
      "SELECT value FROM site_settings WHERE key = 'ogads_script_src'"
    );
    const src = result.rows[0]?.value || null;
    res.status(200).json({ src });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  } finally {
    client.release();
  }
}