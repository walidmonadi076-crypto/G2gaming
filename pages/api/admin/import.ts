
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';
import { isAuthorized } from '../auth/check';
import { slugify } from '../../../lib/slugify';

// Helper to parse CSV line respecting quotes
function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuote = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuote) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        cur += char;
      }
    } else {
      if (char === '"') {
        inQuote = true;
      } else if (char === ',') {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
  }
  result.push(cur.trim());
  return result;
}

// Helper to ensure unique slug
async function getUniqueSlug(client: any, table: string, title: string) {
  let baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const res = await client.query(`SELECT id FROM ${table} WHERE slug = $1`, [slug]);
    if (res.rowCount === 0) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export default async function handler(req: NextApiRequest & { method?: string }, res: NextApiResponse) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type, csvData } = req.body;

  if (!csvData || !type) {
    return res.status(400).json({ error: 'Missing CSV data or type' });
  }

  const client = await getDbClient();
  let successCount = 0;
  let failCount = 0;
  const errors: string[] = [];

  try {
    const lines = csvData.split(/\r?\n/).filter((line: string) => line.trim() !== '');
    // Remove header
    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1);

    for (let i = 0; i < rows.length; i++) {
      const rowData = parseCSVLine(rows[i]);
      if (rowData.length < 1) continue;

      // Map headers to values
      const data: any = {};
      headers.forEach((h: string, idx: number) => {
        data[h.trim()] = rowData[idx];
      });

      try {
        if (type === 'games') {
            const title = data['title'];
            if (!title) throw new Error(`Row ${i + 2}: Title is required`);
            
            const slug = await getUniqueSlug(client, 'games', title);
            const tags = data['tags'] ? data['tags'].split('|').map((t: string) => t.trim()) : [];
            const gallery = data['gallery'] ? data['gallery'].split('|').map((g: string) => g.trim()) : [];

            await client.query(
                `INSERT INTO games (title, slug, image_url, category, tags, theme, description, video_url, download_url, gallery)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    title, 
                    slug, 
                    data['imageUrl'] || '', 
                    data['category'] || 'Action', 
                    tags, 
                    data['theme'] || 'dark', 
                    data['description'] || '', 
                    data['videoUrl'] || null, 
                    data['downloadUrl'] || '#', 
                    gallery
                ]
            );

        } else if (type === 'blogs') {
            const title = data['title'];
            if (!title) throw new Error(`Row ${i + 2}: Title is required`);

            const slug = await getUniqueSlug(client, 'blog_posts', title);

            await client.query(
                `INSERT INTO blog_posts (title, slug, summary, image_url, video_url, author, publish_date, rating, affiliate_url, content, category)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    title,
                    slug,
                    data['summary'] || '',
                    data['imageUrl'] || '',
                    data['videoUrl'] || null,
                    data['author'] || 'Admin',
                    data['publishDate'] || new Date().toISOString().split('T')[0],
                    parseFloat(data['rating']) || 5,
                    data['affiliateUrl'] || null,
                    data['content'] || '',
                    data['category'] || 'General'
                ]
            );

        } else if (type === 'products') {
            const name = data['name'];
            if (!name) throw new Error(`Row ${i + 2}: Name is required`);

            const slug = await getUniqueSlug(client, 'products', name);
            const gallery = data['gallery'] ? data['gallery'].split('|').map((g: string) => g.trim()) : [];

            await client.query(
                `INSERT INTO products (name, slug, image_url, price, url, description, gallery, category)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    name,
                    slug,
                    data['imageUrl'] || '',
                    parseFloat(data['price']) || 0,
                    data['url'] || '#',
                    data['description'] || '',
                    gallery,
                    data['category'] || 'Gear'
                ]
            );
        }
        successCount++;
      } catch (err) {
        failCount++;
        errors.push((err as Error).message);
      }
    }

    res.status(200).json({ success: true, successCount, failCount, errors });
  } catch (error) {
    console.error("CSV Import Error:", error);
    res.status(500).json({ error: 'Server error processing CSV' });
  } finally {
    client.release();
  }
}
