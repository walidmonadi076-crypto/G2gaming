import type { NextApiRequest, NextApiResponse } from 'next';
// FIX: Import Buffer to make the dependency explicit and avoid "Cannot find name 'Buffer'" errors.
import { Buffer } from 'buffer';
import { isAuthorized } from '../../auth/check';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error('API_KEY environment variable not set');
}

const ai = new GoogleGenAI({ apiKey });

// Helper to validate image URLs and fetch image data
async function fetchImage(url: string) {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) }); // 5 second timeout
        if (!response.ok) {
            throw new Error(`Failed to fetch image. Status: ${response.status}`);
        }
        const mimeType = response.headers.get('content-type');
        if (!mimeType || !mimeType.startsWith('image/')) {
            throw new Error('URL does not point to a valid image type.');
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        return {
            inlineData: {
                mimeType,
                data: buffer.toString('base64'),
            },
        };
    } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
             throw new Error('Request to fetch image timed out.');
        }
        throw new Error(`Invalid or inaccessible image URL: ${(error as Error).message}`);
    }
}

// FIX: Add method to NextApiRequest type to resolve TypeScript error.
export default async function handler(req: NextApiRequest & { method?: string }, res: NextApiResponse) {
    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Non autorisé' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { imageUrl, prompt } = req.body;

        if (!imageUrl || !prompt) {
            return res.status(400).json({ error: 'imageUrl et prompt sont obligatoires.' });
        }

        const imagePart = await fetchImage(imageUrl);
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        const text = response.text;
        res.status(200).json({ text });

    } catch (error) {
        console.error("API Error in /api/admin/ai/analyze-image:", error);
        res.status(500).json({ error: 'Erreur interne du serveur lors de l\'analyse de l\'image.', details: (error as Error).message });
    }
}