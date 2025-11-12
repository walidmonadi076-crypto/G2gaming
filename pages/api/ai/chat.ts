
import type { NextRequest } from 'next/server';

// This API endpoint is deprecated and no longer in use.
export default async function handler(req: NextRequest) {
    return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
    });
}

// Keep edge runtime config to avoid build errors if dependencies are edge-specific
export const config = {
    runtime: 'edge',
};
