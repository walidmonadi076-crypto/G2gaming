import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ script: string | null } | { error: string }>
) {
  const client = await getDbClient();
  try {
    const result = await client.query(
      "SELECT value FROM site_settings WHERE key = 'ogads_script_src'"
    );
    const script = result.rows[0]?.value || null;
    res.status(200).json({ script });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  } finally {
    client.release();
  }
}
