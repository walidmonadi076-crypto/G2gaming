import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';
import { isAuthorized } from '../auth/check';

const OGADS_SCRIPT_KEY = 'ogads_script_src';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const client = await getDbClient();

  try {
    if (req.method === 'GET') {
      const result = await client.query('SELECT value FROM site_settings WHERE key = $1', [OGADS_SCRIPT_KEY]);
      const src = result.rows[0]?.value || '';
      return res.status(200).json({ [OGADS_SCRIPT_KEY]: src });
    }
    
    if (req.method === 'POST') {
      const { ogads_script_src: rawScript } = req.body;
      if (typeof rawScript !== 'string') {
        return res.status(400).json({ error: 'Le champ ogads_script_src est invalide.' });
      }

      let finalSrc = rawScript.trim();

      // If it looks like a script tag, try to extract the src
      if (finalSrc.startsWith('<script')) {
        const srcRegex = /src="([^"]+)"/;
        const match = finalSrc.match(srcRegex);
        if (match && match[1]) {
          finalSrc = match[1];
        } else {
          // It looked like a script tag but we couldn't find a src.
          return res.status(400).json({ error: 'Impossible d\'extraire l\'URL du script. Assurez-vous que le code est valide et contient un attribut src="...".' });
        }
      }

      // Basic validation that it's a valid URL now, unless it's an empty string
      if (finalSrc) {
        try {
          new URL(finalSrc);
        } catch (_) {
          return res.status(400).json({ error: `L'URL extraite ou fournie est invalide: ${finalSrc}` });
        }
      }
      
      await client.query(
        `INSERT INTO site_settings (key, value) 
         VALUES ($1, $2)
         ON CONFLICT (key) 
         DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [OGADS_SCRIPT_KEY, finalSrc]
      );
      
      return res.status(200).json({ success: true, message: 'Paramètres mis à jour.' });
    }
    
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error("API Error in /api/admin/settings:", error);
    res.status(500).json({ error: 'Erreur interne du serveur.', details: (error as Error).message });
  } finally {
    client.release();
  }
}