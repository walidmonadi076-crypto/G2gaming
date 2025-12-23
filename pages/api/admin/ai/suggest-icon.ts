import type { NextApiRequest, NextApiResponse } from 'next';
import { isAuthorized } from '../../auth/check';
import { GoogleGenAI } from '@google/genai';

// FIX: Initializing GoogleGenAI directly with process.env.API_KEY as per the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default async function handler(
    req: NextApiRequest & { method?: string },
    res: NextApiResponse
) {
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
Gamepad2, Zap, Target, Car, Sword, ShoppingBag, Book, Headphones, Shirt, Cpu, Star, Trophy, Ghost, Rocket, Users, Puzzle

Given this data:
- Section type: ${section}
- Category name: ${categoryName}

Return ONLY one icon name from the allowed list that best matches the meaning of the category.  
NO explanations, NO descriptions.  
Just output the icon name string directly (example: Zap).
        `;

        // FIX: Using gemini-3-flash-preview as the standard model for simple categorization tasks.
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        // 👇 FIX: تأكد أن response.text ديما string
        const rawText = (response.text ?? '').trim();

        // 👇 لائحة الأيقونات المسموح بها (مطابقة للـ constants ديالك)
        const allowedIcons = [
            // Gaming Core
            'Gamepad2', 'Zap', 'Target', 'Car', 'Sword',
            'Ghost', 'Rocket', 'Puzzle', 'Flame', 'Shield',
            'Crosshair', 'Castle', 'Joystick', 'Controller',
            'LightningBolt', 'Skull', 'SwordShield', 'Planet',

            // Blog / Content
            'Book', 'PenTool', 'FileText', 'Lightbulb', 'MessageSquare',
            'Newspaper', 'Star', 'Camera', 'Clock',

            // Shop / Products
            'ShoppingBag', 'Shirt', 'Headphones', 'Cpu', 'Trophy',
            'Users', 'Tag', 'BadgeDollar', 'Monitor', 'Mouse',
            'Keyboard', 'VR', 'Box', 'Gift'
        ] as const;

        const DEFAULT_ICON = 'Gamepad2';

        // 👇 تحقق واش الجواب ديال Gemini فعلاً أيقونة مسموح بها
        const iconName = allowedIcons.includes(rawText as (typeof allowedIcons)[number])
            ? rawText
            : DEFAULT_ICON;

        return res.status(200).json({ iconName });

    } catch (error) {
        console.error("API Error in /api/admin/ai/suggest-icon:", error);
        return res.status(500).json({
            error: 'Erreur interne du serveur.',
            details: (error as Error).message,
        });
    }
}