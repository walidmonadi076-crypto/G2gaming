import type { NextApiRequest, NextApiResponse } from 'next';
import { isAuthorized } from '../../auth/check';
import { GoogleGenAI } from '@google/genai';

// FIX: Initializing GoogleGenAI directly with process.env.API_KEY as per the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            return res.status(400).json({ error: 'Le prompt est obligatoire.' });
        }

        // FIX: Using gemini-3-flash-preview as the standard model for basic text tasks.
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert copywriter for a gaming website called G2gaming. Your task is to generate compelling, engaging, and SEO-friendly content for games, blog posts, and products based on user prompts. Maintain a knowledgeable yet exciting tone."
            }
        });

        const text = response.text;
        res.status(200).json({ text });

    } catch (error) {
        console.error("API Error in /api/admin/ai/generate-text:", error);
        res.status(500).json({ error: 'Erreur interne du serveur lors de la génération de texte.', details: (error as Error).message });
    }
}