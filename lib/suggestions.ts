
// lib/suggestions.ts

interface SuggestionQuery {
  tag?: string;
  category?: string;
  limit?: number;
}

// Helper to fetch related free deals client-side
export async function getRelatedFreeDeals(tag?: string, store?: string) {
  try {
    const params = new URLSearchParams();
    if (tag) {
        // Clean tag for API matching (simple heuristic)
        const cleanTag = tag.split(' ')[0].toLowerCase();
        params.append('tag', cleanTag);
    }
    if (store) params.append('store', store);
    params.append('limit', '4');

    // Use relative URL for client-side fetching to support both dev and prod
    const res = await fetch(`/api/free-games?${params.toString()}`);
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.deals || [];
  } catch (error) {
    console.error("Failed to fetch related deals", error);
    return [];
  }
}
