
import type { ReactElement } from 'react';

export interface Game {
  id: number;
  slug: string;
  title: string;
  imageUrl: string;
  iconUrl?: string;
  backgroundUrl?: string;
  category: string;
  platform?: 'mobile' | 'pc' | 'web';
  tags?: string[];
  theme?: 'dark' | 'light' | 'colorful' | 'retro' | 'neon';
  accentColor?: string; // New: Hex color for neon glows
  description: string;
  videoUrl?: string;
  downloadUrl: string;
  downloadUrlIos?: string;
  gallery: string[];
  view_count?: number;
  rating?: number;
  downloadsCount?: number;
  isPinned?: boolean;
  requirements?: {
    os: string;
    ram: string;
    storage: string;
    processor?: string;
  };
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  imageUrl: string;
  videoUrl?: string;
  price: string;
  url: string;
  accentColor?: string; // New: Hex color
  description: string;
  gallery: string[];
  category: string;
  view_count?: number;
  isPinned?: boolean;
}

export interface Comment {
  id: number;
  author: string;
  avatarUrl: string;
  date: string;
  text: string;
  status: 'pending' | 'approved';
  email: string;
  phone?: string;
  blog_post_id?: number;
  blog_title?: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  summary: string;
  imageUrl: string;
  videoUrl?: string;
  author: string;
  publishDate: string;
  rating: number;
  accentColor?: string; // New: Hex color
  affiliateUrl: string;
  content: string;
  category: string;
  view_count?: number;
  isPinned?: boolean;
}

export interface SocialLink {
  id: number;
  name: string;
  url: string;
  icon_svg: string;
}

export interface Ad {
  placement: string;
  code: string;
  fallback_code?: string;
}

export interface SiteSettings {
  site_name: string;
  site_icon_url: string;
  ogads_script_src: string;
  hero_title: string;
  hero_subtitle: string;
  hero_button_text: string;
  hero_button_url: string;
  hero_bg_url: string;
  promo_enabled: boolean;
  promo_text: string;
  promo_button_text: string;
  promo_button_url: string;
  recaptcha_site_key: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface CategorySetting {
  section: 'games' | 'blogs' | 'products';
  name: string;
  icon_name: string;
  show_in_sidebar: boolean;
  sort_order: number;
  count?: number;
}
