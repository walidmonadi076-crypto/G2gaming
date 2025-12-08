-- Create table for Free Game Deals
CREATE TABLE IF NOT EXISTS free_game_deals (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,                -- 'cheapshark', 'epic', 'steam', etc.
  source_deal_id TEXT,                 -- unique ID from the source
  title TEXT NOT NULL,
  store_name TEXT,                     -- 'Steam', 'Epic Games Store', 'GOG', etc.
  store_id TEXT,                       -- Store ID provided by API
  normal_price NUMERIC(10,2),
  sale_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  deal_url TEXT,
  image_url TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  tags TEXT[],                         -- e.g. {'free', 'rpg', 'steam'}
  platform TEXT,                       -- 'PC', 'Console', 'Multi'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint to prevent duplicates from the same source
  CONSTRAINT unique_source_deal UNIQUE (source, source_deal_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_free_game_deals_is_active ON free_game_deals(is_active);
CREATE INDEX IF NOT EXISTS idx_free_game_deals_ends_at ON free_game_deals(ends_at);
CREATE INDEX IF NOT EXISTS idx_free_game_deals_store_name ON free_game_deals(store_name);
CREATE INDEX IF NOT EXISTS idx_free_game_deals_tags ON free_game_deals USING GIN(tags);

-- Optional: Partial index to quickly find currently active deals
CREATE INDEX IF NOT EXISTS idx_active_deals 
ON free_game_deals(id) 
WHERE is_active = TRUE AND (ends_at IS NULL OR ends_at > NOW());