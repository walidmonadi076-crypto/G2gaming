
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../../db';

// CheapShark Store ID Mapping (Cached or hardcoded for efficiency)
// This list can be dynamically fetched from https://www.cheapshark.com/api/1.0/stores
const STORE_MAP: Record<string, string> = {
  "1": "Steam",
  "2": "GamersGate",
  "3": "GreenManGaming",
  "4": "Amazon",
  "5": "GameStop",
  "6": "Direct2Drive",
  "7": "GOG",
  "8": "Origin",
  "11": "Humble Store",
  "13": "Uplay",
  "15": "Fanatical",
  "25": "Epic Games Store",
  "35": "Blizzard Shop"
  // Add others as needed
};

interface CheapSharkDeal {
  dealID: string;
  title: string;
  storeID: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  thumb: string;
  steamRatingText?: string;
  steamAppID?: string;
  releaseDate?: number;
  lastChange?: number;
  dealRating?: string;
  gameID: string;
}

// FIX: Add method to NextApiRequest type to resolve TypeScript error.
export default async function handler(req: NextApiRequest & { method?: string }, res: NextApiResponse) {
  // Allow POST (for cron/manual trigger) or GET (for testing)
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const client = await getDbClient();

  try {
    // 1. Fetch Free Games from CheapShark (upperPrice=0)
    // exact=0 allows finding anything 0.00 even if it's technically 0.001
    const response = await fetch('https://www.cheapshark.com/api/1.0/deals?upperPrice=0&exact=0'); 
    
    if (!response.ok) {
      throw new Error(`CheapShark API error: ${response.statusText}`);
    }
    
    const deals: CheapSharkDeal[] = await response.json();
    console.log(`Fetched ${deals.length} potential free deals from CheapShark.`);

    // 2. Process and Upsert into Database
    let upsertCount = 0;

    await client.query('BEGIN');

    for (const deal of deals) {
      // Double check it's actually free or close to it
      if (parseFloat(deal.salePrice) > 0) continue; 

      const storeName = STORE_MAP[deal.storeID] || 'Unknown Store';
      // CheapShark redirect URL
      const dealUrl = `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`;
      
      // Infer platform/tags based on store
      const tags = ['free'];
      let platform = 'PC'; // Default assumption for CheapShark
      
      if (storeName.includes('Steam')) { tags.push('steam'); }
      if (storeName.includes('Epic')) { tags.push('epic'); }
      if (storeName.includes('GOG')) { tags.push('gog', 'drm-free'); }
      
      // Basic UPSERT query
      const queryText = `
        INSERT INTO free_game_deals (
          source, source_deal_id, title, store_name, store_id, 
          normal_price, sale_price, currency, deal_url, image_url, 
          tags, platform, is_active, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        ON CONFLICT (source, source_deal_id) 
        DO UPDATE SET 
          title = EXCLUDED.title,
          sale_price = EXCLUDED.sale_price,
          normal_price = EXCLUDED.normal_price,
          image_url = EXCLUDED.image_url,
          is_active = EXCLUDED.is_active,
          updated_at = NOW()
        RETURNING id;
      `;
      
      const values = [
        'cheapshark',                       // source
        deal.dealID,                        // source_deal_id
        deal.title,                         // title
        storeName,                          // store_name
        deal.storeID,                       // store_id
        parseFloat(deal.normalPrice) || 0,  // normal_price
        0.00,                               // sale_price
        'USD',                              // currency
        dealUrl,                            // deal_url
        deal.thumb,                         // image_url
        tags,                               // tags
        platform,                           // platform
        true                                // is_active
      ];

      await client.query(queryText, values);
      upsertCount++;
    }

    await client.query('COMMIT');

    res.status(200).json({ 
      success: true, 
      message: `Synced ${upsertCount} free deals from CheapShark.`,
      source: 'CheapShark'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Sync Error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  } finally {
    client.release();
  }
}
