
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';
import { isAuthorized } from '../auth/check';
import { slugify } from '../../../lib/slugify';

async function generateUniqueSlug(client: any, title: string, currentId: number | null = null): Promise<string> {
  let baseSlug = slugify(title);
  let slug = baseSlug;
  let isUnique = false;
  let counter = 1;
  while (!isUnique) {
    const q = currentId ? 'SELECT id FROM games WHERE slug = $1 AND id != $2' : 'SELECT id FROM games WHERE slug = $1';
    const params = currentId ? [slug, currentId] : [slug];
    const { rows } = await client.query(q, params);
    if (rows.length === 0) isUnique = true;
    else { slug = `${baseSlug}-${counter}`; counter++; }
  }
  return slug;
}

export default async function handler(req: NextApiRequest & { method?: string }, res: NextApiResponse) {
  let client;
  try {
    client = await getDbClient();
    if (req.method === 'GET') {
        if (!isAuthorized(req)) return res.status(401).json({ error: 'Non autorisé' });
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string || '';
        const sortBy = req.query.sortBy as string || 'id';
        const sortOrder = req.query.sortOrder as string || 'desc';
        const offset = (page - 1) * limit;
        const allowedSortBy = ['id', 'title', 'category', 'view_count'];
        const sanitizedSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'id';
        const sanitizedSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';
        let whereClause = '';
        const queryParams: any[] = [];
        if (search) { queryParams.push(`%${search}%`); whereClause = `WHERE title ILIKE $${queryParams.length}`; }
        const totalResult = await client.query(`SELECT COUNT(*) FROM games ${whereClause}`, queryParams);
        const totalItems = parseInt(totalResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalItems / limit);
        queryParams.push(limit, offset);
        const itemsResult = await client.query(`
            SELECT
                id, slug, title, image_url AS "imageUrl", category, tags, theme, accent_color AS "accentColor", description,
                video_url AS "videoUrl", download_url AS "downloadUrl", download_url_ios AS "downloadUrlIos", gallery, view_count, platform, requirements,
                icon_url AS "iconUrl", background_url AS "backgroundUrl",
                rating, downloads_count AS "downloadsCount", is_pinned AS "isPinned"
            FROM games
            ${whereClause}
            ORDER BY is_pinned DESC, ${sanitizedSortBy} ${sanitizedSortOrder}
            LIMIT $${queryParams.length-1} OFFSET $${queryParams.length}
        `, queryParams);
        return res.status(200).json({ items: itemsResult.rows, pagination: { totalItems, totalPages, currentPage: page, itemsPerPage: limit } });
    }

    if (!isAuthorized(req)) return res.status(401).json({ error: 'Non autorisé' });
    
    if (req.method === 'POST') {
      const { title, imageUrl, category, tags, theme, accentColor, description, videoUrl, downloadUrl, downloadUrlIos, gallery, platform, requirements, iconUrl, backgroundUrl, rating, downloadsCount, isPinned } = req.body;
      if (!title) return res.status(400).json({ error: 'Le champ "Titre" est obligatoire.' });
      const slug = await generateUniqueSlug(client, title);
      const result = await client.query(
        `INSERT INTO games (title, slug, image_url, category, tags, theme, accent_color, description, video_url, download_url, download_url_ios, gallery, platform, requirements, icon_url, background_url, rating, downloads_count, is_pinned) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
        [title, slug, imageUrl, category, tags || [], theme || 'dark', accentColor || null, description, videoUrl || null, downloadUrl || '#', downloadUrlIos || null, gallery || [], platform || 'pc', requirements || null, iconUrl || null, backgroundUrl || null, rating || 95, downloadsCount || 1000, isPinned || false]
      );
      res.status(201).json(result.rows[0]);
    } else if (req.method === 'PUT') {
      const { id, title, imageUrl, category, tags, theme, accentColor, description, videoUrl, downloadUrl, downloadUrlIos, gallery, platform, requirements, iconUrl, backgroundUrl, rating, downloadsCount, isPinned } = req.body;
      if (!title) return res.status(400).json({ error: 'Le champ "Titre" est obligatoire.' });
      const newSlug = await generateUniqueSlug(client, title, id);
      const result = await client.query(
        `UPDATE games 
         SET title = $1, slug = $2, image_url = $3, category = $4, tags = $5, theme = $6, accent_color = $7, description = $8, video_url = $9, download_url = $10, download_url_ios = $11, gallery = $12, platform = $13, requirements = $14, icon_url = $15, background_url = $16, rating = $17, downloads_count = $18, is_pinned = $19
         WHERE id = $20 RETURNING *`,
        [title, newSlug, imageUrl, category, tags || [], theme || 'dark', accentColor || null, description, videoUrl || null, downloadUrl || '#', downloadUrlIos || null, gallery || [], platform || 'pc', requirements || null, iconUrl || null, backgroundUrl || null, rating || 95, downloadsCount || 1000, isPinned || false, id]
      );
      if (result.rows.length === 0) res.status(404).json({ message: 'Game not found' });
      else res.status(200).json(result.rows[0]);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      const result = await client.query('DELETE FROM games WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length === 0) res.status(404).json({ message: 'Game not found' });
      else res.status(200).json({ message: 'Game deleted successfully' });
    }
  } catch (error) { res.status(500).json({ error: 'Erreur interne du serveur.', details: (error as Error).message }); }
  finally { if (client) client.release(); }
}
