
// lib/suggestions.ts

// Helper to fetch related free deals client-side
// This avoids complex server-side logic and allows the suggestion engine
// to run independently of the main page rendering.
export async function getRelatedFreeDeals(tag?: string, store?: string) {
  try {
    const params = new URLSearchParams();
    // Prioritize tag matching
    if (tag) {
        // Clean tag for API
        const cleanTag = tag.split(' ')[0].toLowerCase();
        params.append('tag', cleanTag);
    }
    if (store) params.append('store', store);
    params.append('limit', '4');

    // Use a relative URL which works for client-side fetch
    const res = await fetch(`/api/free-games?${params.toString()}`);
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.deals || [];
  } catch (error) {
    console.error("Failed to fetch related deals", error);
    return [];
  }
}
