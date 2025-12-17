
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
    const q = currentId 
      ? 'SELECT id FROM blog_posts WHERE slug = $1 AND id != $2'
      : 'SELECT id FROM blog_posts WHERE slug = $1';
    
    const params = currentId ? [slug, currentId] : [slug];
    const { rows } = await client.query(q, params);

    if (rows.length === 0) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
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
      if (search) {
        queryParams.push(`%${search}%`);
        whereClause = `WHERE title ILIKE $${queryParams.length} OR author ILIKE $${queryParams.length}`;
      }
      
      const totalResult = await client.query(`SELECT COUNT(*) FROM blog_posts ${whereClause}`, queryParams);
      const totalItems = parseInt(totalResult.rows[0].count, 10);
      const totalPages = Math.ceil(totalItems / limit);

      queryParams.push(limit, offset);
      const itemsResult = await client.query(`
        SELECT 
          id, slug, title, summary, image_url AS "imageUrl", video_url AS "videoUrl",
          author, publish_date AS "publishDate", rating::float, affiliate_url AS "affiliateUrl",
          content, category, view_count, is_pinned AS "isPinned"
        FROM blog_posts
        ${whereClause}
        ORDER BY is_pinned DESC, ${sanitizedSortBy} ${sanitizedSortOrder}
        LIMIT $${queryParams.length-1} OFFSET $${queryParams.length}
      `, queryParams);

      return res.status(200).json({
        items: itemsResult.rows,
        pagination: { totalItems, totalPages, currentPage: page, itemsPerPage: limit }
      });
    }
    
    if (!isAuthorized(req)) return res.status(401).json({ error: 'Non autorisé' });

    if (req.method === 'POST') {
      const { title, summary, imageUrl, videoUrl, author, publishDate, rating, affiliateUrl, content, category, isPinned } = req.body;
      if (!title) return res.status(400).json({ error: 'Le champ "Titre" est obligatoire.' });
      
      const slug = await generateUniqueSlug(client, title);
      const result = await client.query(
        `INSERT INTO blog_posts (title, slug, summary, image_url, video_url, author, publish_date, rating, affiliate_url, content, category, is_pinned) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [title, slug, summary, imageUrl, videoUrl || null, author, publishDate || new Date().toISOString().split('T')[0], parseFloat(rating) || 0, affiliateUrl || null, content, category, isPinned || false]
      );

      try {
          await res.revalidate('/blog');
          await res.revalidate(`/blog/${slug}`);
      } catch (err) { console.error('Revalidation error:', err); }

      res.status(201).json(result.rows[0]);

    } else if (req.method === 'PUT') {
      const { id, title, summary, imageUrl, videoUrl, author, publishDate, rating, affiliateUrl, content, category, isPinned } = req.body;
      if (!title) return res.status(400).json({ error: 'Le champ "Titre" est obligatoire.' });

      const oldData = await client.query('SELECT slug FROM blog_posts WHERE id = $1', [id]);
      const oldSlug = oldData.rows[0]?.slug;

      const newSlug = await generateUniqueSlug(client, title, id);
      const result = await client.query(
        `UPDATE blog_posts 
         SET title = $1, slug = $2, summary = $3, image_url = $4, video_url = $5, author = $6, publish_date = $7, rating = $8, affiliate_url = $9, content = $10, category = $11, is_pinned = $12
         WHERE id = $13 RETURNING *`,
        [title, newSlug, summary, imageUrl, videoUrl || null, author, publishDate || new Date().toISOString().split('T')[0], parseFloat(rating) || 0, affiliateUrl || null, content, category, isPinned || false, id]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Blog post not found' });
      } else {
        try {
            await res.revalidate('/blog');
            if (oldSlug) await res.revalidate(`/blog/${oldSlug}`);
            if (newSlug !== oldSlug) await res.revalidate(`/blog/${newSlug}`);
        } catch (err) { console.error('Revalidation error:', err); }
        res.status(200).json(result.rows[0]);
      }

    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      const findRes = await client.query('SELECT slug FROM blog_posts WHERE id = $1', [id]);
      const slug = findRes.rows[0]?.slug;

      const result = await client.query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Blog post not found' });
      } else {
        try {
            await res.revalidate('/blog');
            if (slug) await res.revalidate(`/blog/${slug}`);
        } catch (err) { console.error('Revalidation error:', err); }
        res.status(200).json({ message: 'Blog post deleted successfully' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("API Error in /api/admin/blogs:", error);
    res.status(500).json({ error: 'Erreur interne du serveur.', details: (error as Error).message });
  } finally {
     if (client) client.release();
  }
}
