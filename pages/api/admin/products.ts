
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';
import { isAuthorized } from '../auth/check';
import { slugify } from '../../../lib/slugify';

async function generateUniqueSlug(client: any, name: string, currentId: number | null = null): Promise<string> {
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let isUnique = false;
  let counter = 1;

  while (!isUnique) {
    const query = currentId 
      ? 'SELECT id FROM products WHERE slug = $1 AND id != $2'
      : 'SELECT id FROM products WHERE slug = $1';
    
    const params = currentId ? [slug, currentId] : [slug];
    
    const { rows } = await client.query(query, params);

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
      if (!isAuthorized(req)) {
          return res.status(401).json({ error: 'Non autorisé' });
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string || '';
      const sortBy = req.query.sortBy as string || 'id';
      const sortOrder = req.query.sortOrder as string || 'desc';
      const offset = (page - 1) * limit;

      const allowedSortBy = ['id', 'name', 'category', 'view_count'];
      const sanitizedSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'id';
      const sanitizedSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

      let whereClause = '';
      const queryParams: any[] = [];
      if (search) {
        queryParams.push(`%${search}%`);
        whereClause = `WHERE name ILIKE $${queryParams.length}`;
      }
      
      const totalResult = await client.query(`SELECT COUNT(*) FROM products ${whereClause}`, queryParams);
      const totalItems = parseInt(totalResult.rows[0].count, 10);
      const totalPages = Math.ceil(totalItems / limit);

      queryParams.push(limit, offset);
      
      const itemsResult = await client.query(`
        SELECT 
            id, slug, name, image_url AS "imageUrl", '$' || price::text AS price, url, 
            description, gallery, category, view_count, is_pinned AS "isPinned"
        FROM products
        ${whereClause}
        ORDER BY is_pinned DESC, ${sanitizedSortBy} ${sanitizedSortOrder}
        LIMIT $${queryParams.length-1} OFFSET $${queryParams.length}
      `, queryParams);

      return res.status(200).json({
        items: itemsResult.rows,
        pagination: { totalItems, totalPages, currentPage: page, itemsPerPage: limit }
      });
    }

    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Non autorisé' });
    }

    if (req.method === 'POST') {
        const { name, imageUrl, price, url, description, gallery, category, isPinned } = req.body;
        if (!name) return res.status(400).json({ error: 'Le champ "Nom" est obligatoire.' });

        const numericPrice = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
        const slug = await generateUniqueSlug(client, name);
        
        const result = await client.query(
            `INSERT INTO products (name, slug, image_url, price, url, description, gallery, category, is_pinned) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [name, slug, imageUrl, numericPrice, url || '#', description, gallery || [], category, isPinned || false]
        );

        try {
            await res.revalidate('/shop');
            await res.revalidate(`/shop/${slug}`);
        } catch (err) {
            console.error('Revalidation error:', err);
        }

        res.status(201).json(result.rows[0]);

    } else if (req.method === 'PUT') {
        const { id, name, imageUrl, price, url, description, gallery, category, isPinned } = req.body;
        if (!name) return res.status(400).json({ error: 'Le champ "Nom" est obligatoire.' });

        const numericPrice = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
        const slug = await generateUniqueSlug(client, name, id);
        
        const result = await client.query(
            `UPDATE products 
            SET name = $1, slug = $2, image_url = $3, price = $4, url = $5, description = $6, gallery = $7, category = $8, is_pinned = $9
            WHERE id = $10 RETURNING *`,
            [name, slug, imageUrl, numericPrice, url || '#', description, gallery || [], category, isPinned || false, id]
        );
      
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            try {
                await res.revalidate('/shop');
                await res.revalidate(`/shop/${slug}`);
            } catch (err) {
                console.error('Revalidation error:', err);
            }
            res.status(200).json(result.rows[0]);
        }
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      const findRes = await client.query('SELECT slug FROM products WHERE id = $1', [id]);
      const slug = findRes.rows[0]?.slug;

      const result = await client.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Product not found' });
      } else {
        try {
            await res.revalidate('/shop');
            if (slug) await res.revalidate(`/shop/${slug}`);
        } catch (err) {
            console.error('Revalidation error:', err);
        }
        res.status(200).json({ message: 'Product deleted successfully' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("API Error in /api/admin/products:", error);
    res.status(500).json({ error: 'Erreur interne du serveur.', details: (error as Error).message });
  } finally {
    if (client) {
      client.release();
    }
  }
}
