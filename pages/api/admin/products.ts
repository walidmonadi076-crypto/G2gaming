import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';
import { isAuthorized } from '../auth/check';
import { slugify } from '../../../lib/slugify';

async function generateUniqueSlug(client: any, name: string, currentId: number | null = null): Promise<string> {
  let slug = slugify(name);
  let isUnique = false;
  let counter = 1;

  while (!isUnique) {
    let query = 'SELECT id FROM products WHERE slug = $1';
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
      slug = `${slugify(name)}-${counter}`;
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
    const { id, name, imageUrl, price, url, description, gallery, category } = req.body;
    
    if (req.method === 'POST' || req.method === 'PUT') {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: 'Le champ "Nom" est obligatoire.' });
        }
        // ... (autres validations)
    }
    
    let numericPrice = 0;
    if (typeof price === 'string') {
        numericPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    } else if (typeof price === 'number') {
        numericPrice = price;
    }
    const safeGallery = Array.isArray(gallery) ? gallery.filter(g => typeof g === 'string' && g.trim() !== '') : [];
    const safeUrl = url || '#';
    const safeDescription = description || '';

    if (req.method === 'POST') {
      const slug = await generateUniqueSlug(client, name);
      const result = await client.query(
        `INSERT INTO products (name, slug, image_url, price, url, description, gallery, category) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [name, slug, imageUrl, numericPrice, safeUrl, safeDescription, safeGallery, category]
      );
      
      res.status(201).json(result.rows[0]);

    } else if (req.method === 'PUT') {
      const slug = await generateUniqueSlug(client, name, id);
      const result = await client.query(
        `UPDATE products 
         SET name = $1, slug = $2, image_url = $3, price = $4, url = $5, description = $6, gallery = $7, category = $8 
         WHERE id = $9 RETURNING *`,
        [name, slug, imageUrl, numericPrice, safeUrl, safeDescription, safeGallery, category, id]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Product not found' });
      } else {
        res.status(200).json(result.rows[0]);
      }
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      await client.query('DELETE FROM products WHERE id = $1', [id]);
      res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("API Error in /api/admin/products:", error);
    res.status(500).json({ error: 'Erreur interne du serveur.', details: (error as Error).message });
  } finally {
    client.release();
  }
}