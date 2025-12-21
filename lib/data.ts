// lib/data.ts
import { query } from '../db';
import type { BlogPost, Comment, Product, Game, SiteSettings } from '../types';

// Same Favicon constant for backend-origin defaults
const FAVICON_DATA_URI = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Cdefs%3E%3ClinearGradient%20id='g2-grad'%20x1='0'%20y1='0'%20x2='1'%20y2='1'%3E%3Cstop%20offset='0%25'%20stop-color='%23a855f7'/%3E%3Cstop%20offset='100%25'%20stop-color='%233b82f6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle%20cx='16'%20cy='16'%20r='15'%20fill='url(%23g2-grad)'/%3E%3Ctext%20x='16'%20y='22'%20font-family='Impact,%20sans-serif'%20font-size='18'%20fill='white'%20text-anchor='middle'%3EG2%3C/text%3E%3C/svg%3E";

/* ========== 📰 BLOG POSTS ========== */

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const result = await query(`
    SELECT 
      id, slug, title, summary, image_url AS "imageUrl", video_url AS "videoUrl",
      author, publish_date AS "publishDate", rating::float, affiliate_url AS "affiliateUrl",
      content, category, is_pinned AS "isPinned", view_count
    FROM blog_posts ORDER BY is_pinned DESC, id DESC
  `);
  return result.rows;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const result = await query(`
    SELECT 
      id, slug, title, summary, image_url AS "imageUrl", video_url AS "videoUrl",
      author, publish_date AS "publishDate", rating::float, affiliate_url AS "affiliateUrl",
      content, category, is_pinned AS "isPinned", view_count
    FROM blog_posts WHERE slug = $1
  `, [slug]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function getRelatedBlogs(excludeId: number, category: string, limit: number = 4): Promise<BlogPost[]> {
  const result = await query(`
    SELECT id, slug, title, summary, image_url AS "imageUrl", author, publish_date AS "publishDate", rating::float, category
    FROM blog_posts WHERE id != $1 AND category = $2 LIMIT $3
  `, [excludeId, category, limit]);
  return result.rows;
}

export async function getPopularBlogs(excludeId: number, limit: number = 4): Promise<BlogPost[]> {
  const result = await query(`
    SELECT id, slug, title, summary, image_url AS "imageUrl", author, publish_date AS "publishDate", rating::float, category
    FROM blog_posts WHERE id != $1 ORDER BY view_count DESC LIMIT $2
  `, [excludeId, limit]);
  return result.rows;
}

/* ========== 💬 COMMENTS ========== */

export async function getCommentsByBlogId(blogId: number): Promise<Comment[]> {
  const result = await query(`
    SELECT id, author, avatar_url AS "avatarUrl", text, date
    FROM comments WHERE blog_post_id = $1 AND status = 'approved' ORDER BY id DESC
  `, [blogId]);
  return result.rows;
}

/* ========== 🛍️ PRODUCTS ========== */

export async function getAllProducts(): Promise<Product[]> {
  const result = await query(`
    SELECT 
        id, slug, name, image_url AS "imageUrl", video_url AS "videoUrl", '$' || price::text AS price, url, 
        description, gallery, category, is_pinned AS "isPinned", view_count
    FROM products ORDER BY is_pinned DESC, id DESC
  `);
  return result.rows;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const result = await query(`
    SELECT 
        id, slug, name, image_url AS "imageUrl", video_url AS "videoUrl", '$' || price::text AS price, url, 
        description, gallery, category, is_pinned AS "isPinned", view_count
    FROM products WHERE slug = $1
  `, [slug]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function getRelatedProducts(excludeId: number, category: string, limit: number = 4): Promise<Product[]> {
  const result = await query(`
    SELECT id, slug, name, image_url AS "imageUrl", video_url AS "videoUrl", '$' || price::text AS price, category
    FROM products WHERE id != $1 AND category = $2 LIMIT $3
  `, [excludeId, category, limit]);
  return result.rows;
}

export async function getTrendingProducts(excludeId: number, limit: number = 4): Promise<Product[]> {
  const result = await query(`
    SELECT id, slug, name, image_url AS "imageUrl", video_url AS "videoUrl", '$' || price::text AS price, category
    FROM products WHERE id != $1 ORDER BY view_count DESC LIMIT $2
  `, [excludeId, limit]);
  return result.rows;
}

/* ========== 🎮 GAMES ========== */

export async function getAllGames(): Promise<Game[]> {
  const result = await query(`
    SELECT
      id, slug, title, image_url AS "imageUrl", category, tags, theme, description,
      video_url AS "videoUrl", download_url AS "downloadUrl", download_url_ios AS "downloadUrlIos", gallery, platform, requirements,
      icon_url AS "iconUrl", background_url AS "backgroundUrl",
      rating, downloads_count AS "downloadsCount", is_pinned AS "isPinned", view_count
    FROM games ORDER BY is_pinned DESC, id DESC
  `);
  return result.rows;
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const result = await query(`
    SELECT
      id, slug, title, image_url AS "imageUrl", category, tags, theme, description,
      video_url AS "videoUrl", download_url AS "downloadUrl", download_url_ios AS "downloadUrlIos", gallery, platform, requirements,
      icon_url AS "iconUrl", background_url AS "backgroundUrl",
      rating, downloads_count AS "downloadsCount", is_pinned AS "isPinned", view_count
    FROM games WHERE slug = $1
  `, [slug]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function getRelatedGames(excludeId: number, category: string, limit: number = 4): Promise<Game[]> {
  const result = await query(`
    SELECT id, slug, title, image_url AS "imageUrl", category, rating, downloads_count AS "downloadsCount"
    FROM games WHERE id != $1 AND category = $2 LIMIT $3
  `, [excludeId, category, limit]);
  return result.rows;
}

export async function getTrendingGames(excludeId: number, limit: number = 4): Promise<Game[]> {
  const result = await query(`
    SELECT id, slug, title, image_url AS "imageUrl", category, rating, downloads_count AS "downloadsCount"
    FROM games WHERE id != $1 ORDER BY view_count DESC LIMIT $2
  `, [excludeId, limit]);
  return result.rows;
}

/* ========== ⚙️ SITE SETTINGS ========== */

export async function getSiteSettings(): Promise<SiteSettings> {
  const result = await query('SELECT key, value FROM site_settings');
  const settings = result.rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);

  const parseBoolean = (value: string | undefined) => value === 'true';

  return {
    site_name: settings.site_name || 'G2gaming',
    site_icon_url: settings.site_icon_url || FAVICON_DATA_URI,
    ogads_script_src: settings.ogads_script_src || '',
    hero_title: settings.hero_title || 'Welcome to<br />G2gaming',
    hero_subtitle: settings.hero_subtitle || 'Your ultimate gaming destination.',
    hero_button_text: settings.hero_button_text || 'Explore Games',
    hero_button_url: settings.hero_button_url || '/games',
    hero_bg_url: settings.hero_bg_url || 'https://picsum.photos/seed/banner/1200/400',
    promo_enabled: parseBoolean(settings.promo_enabled ?? 'true'),
    promo_text: settings.promo_text || 'Climb the new G2gaming leaderboards',
    promo_button_text: settings.promo_button_text || 'Explore games',
    promo_button_url: settings.promo_button_url || '/games',
    recaptcha_site_key: settings.recaptcha_site_key || '6Lcm1QUsAAAAAP4bS9QiKH9jCpDXQ3ktJsgQwcO4',
  };
}