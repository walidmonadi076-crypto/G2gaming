
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
  theme?: 'dark' | 'light' | 'colorful' | 'retro';
  description: string;
  videoUrl?: string;
  downloadUrl: string; // Used for PC or Android
  downloadUrlIos?: string; // Specific for iOS
  gallery: string[];
  view_count?: number;
  rating?: number; // New: Manual Rating (0-100)
  downloadsCount?: number; // New: Manual Download Count
  isPinned?: boolean; // New: Pin to top
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
  price: string;
  url: string;
  description: string;
  gallery: string[];
  category: string;
  view_count?: number;
  isPinned?: boolean;
  // Database Columns
  rating?: number;
  reviewsCount?: number; // Mapped from reviews_count
  features?: {
    colors?: string[]; 
    accessoryIds?: number[]; 
    sectionTitle?: string;
  };
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
