
import type { NextApiRequest, NextApiResponse } from 'next';
import { isAuthorized } from '../../auth/check';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error('API_KEY environment variable not set');
}

const ai = new GoogleGenAI({ apiKey });

export default async function handler(req: NextApiRequest & { method?: string }, res: NextApiResponse) {
    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Non autorisé' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { categoryName, section } = req.body;

        if (!categoryName || !section) {
            return res.status(400).json({ error: 'categoryName and section are required.' });
        }

        const prompt = `
You are helping me choose an icon for navigation categories in a gaming website sidebar.

I use the "lucide-react" icon library in my React app.
These are the ONLY allowed icons:
Gamepad2, Zap, Target, Car, Sword, ShoppingBag, Book, Headphones, Shirt, Cpu, Star, Trophy

Given this data:
- Section type: ${section}
- Category name: ${categoryName}

Return ONLY one icon name from the allowed list that best matches the meaning of the category.  
NO explanations, NO descriptions.  
Just output the icon name string directly (example: Zap).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const iconName = response.text.trim();
        res.status(200).json({ iconName });

    } catch (error) {
        console.error("API Error in /api/admin/ai/suggest-icon:", error);
        res.status(500).json({ error: 'Erreur interne du serveur.', details: (error as Error).message });
    }
}
