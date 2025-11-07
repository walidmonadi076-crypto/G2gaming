import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ scriptUrl: string | null } | { error: string }>
) {
  const client = await getDbClient();
  try {
    const result = await client.query(
      "SELECT value FROM site_settings WHERE key = 'ogads_script_src'"
    );
    const scriptTag = result.rows[0]?.value || null;
    let scriptUrl = null;

    if (scriptTag && typeof scriptTag === 'string') {
      // Use a regex to extract the src attribute's value
      const srcMatch = scriptTag.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        scriptUrl = srcMatch[1];
      }
    }

    res.status(200).json({ scriptUrl });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  } finally {
    client.release();
  }
}