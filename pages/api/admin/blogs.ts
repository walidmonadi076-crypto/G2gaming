import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';
import { isAuthorized } from '../auth/check';
import { slugify } from '../../../lib/slugify';

async function generateUniqueSlug(client: any, title: string, currentId: number | null = null): Promise<string> {
  let slug = slugify(title);
  let isUnique = false;
  let counter = 1;

  while (!isUnique) {
    let query = 'SELECT id FROM blog_posts WHERE slug = $1';
    const params: any[] = [slug];
    
    if (currentId) {
      query += ' AND id != $2';
      params.push(currentId);
    }

    const { rows } = await client.query(query, params);
    
    if (rows.length === 0) {
      isUnique = true;
    } else {
      counter++;
      slug = `${slugify(title)}-${counter}`;
    }
  }
  return slug;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const client = await getDbClient();

  try {
    const { id, title, summary, imageUrl, videoUrl, author, publishDate, rating, affiliateUrl, content, category } = req.body;
    
    if (req.method === 'POST' || req.method === 'PUT') {
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ error: 'Le champ "Titre" est obligatoire.' });
        }
        // ... (autres validations)
    }
    
    const numericRating = parseFloat(rating) || 0;
    const safeVideoUrl = videoUrl || null;
    const safeAffiliateUrl = affiliateUrl || null;
    const safePublishDate = publishDate || new Date().toISOString().split('T')[0];


    if (req.method === 'POST') {
      const slug = await generateUniqueSlug(client, title);
      const result = await client.query(
        `INSERT INTO blog_posts (title, slug, summary, image_url, video_url, author, publish_date, rating, affiliate_url, content, category) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [title, slug, summary, imageUrl, safeVideoUrl, author, safePublishDate, numericRating, safeAffiliateUrl, content, category]
      );
      
      res.status(201).json(result.rows[0]);

    } else if (req.method === 'PUT') {
      const slug = await generateUniqueSlug(client, title, id);
      const result = await client.query(
        `UPDATE blog_posts 
         SET title = $1, slug = $2, summary = $3, image_url = $4, video_url = $5, author = $6, publish_date = $7, rating = $8, affiliate_url = $9, content = $10, category = $11 
         WHERE id = $12 RETURNING *`,
        [title, slug, summary, imageUrl, safeVideoUrl, author, safePublishDate, numericRating, safeAffiliateUrl, content, category, id]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Blog post not found' });
      } else {
        res.status(200).json(result.rows[0]);
      }

    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      await client.query('DELETE FROM blog_posts WHERE id = $1', [id]);
      res.status(200).json({ message: 'Blog post deleted successfully' });
    } else {
      res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("API Error in /api/admin/blogs:", error);
    res.status(500).json({ error: 'Erreur interne du serveur.', details: (error as Error).message });
  } finally {
     client.release();
  }
}