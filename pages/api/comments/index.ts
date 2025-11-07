import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../db';
import type { Comment } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Comment | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { postId, author, text, recaptchaToken } = req.body;

    // --- reCAPTCHA Verification ---
    if (!recaptchaToken) {
      return res.status(400).json({ error: 'Le jeton reCAPTCHA est manquant.' });
    }
    const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6Lcm1QUsAAAAAO4ClV3H-_pYeUlNPL-AJhRgwoI9';
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}&remoteip=${req.socket.remoteAddress}`;
    
    const recaptchaResponse = await fetch(verificationUrl, { method: 'POST' });
    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      console.warn('reCAPTCHA verification failed:', recaptchaData['error-codes']);
      return res.status(400).json({ error: 'La vérification reCAPTCHA a échoué. Veuillez réessayer.' });
    }

    // --- Input Validation ---
    if (!postId || !author || !text) {
      return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    }
    if (author.trim().length < 2 || author.trim().length > 50) {
      return res.status(400).json({ error: 'Le nom doit contenir entre 2 et 50 caractères.' });
    }
    if (text.trim().length < 10 || text.trim().length > 1000) {
      return res.status(400).json({ error: 'Le commentaire doit contenir entre 10 et 1000 caractères.' });
    }

    const client = await getDbClient();
    try {
      // --- Database Insertion ---
      const sanitizedAuthor = author.trim();
      const sanitizedText = text.trim();
      const avatarUrl = `https://i.pravatar.cc/40?u=${Date.now()}`;
      const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      const result = await client.query(
        `INSERT INTO comments (blog_post_id, author, avatar_url, date, text, status) 
         VALUES ($1, $2, $3, $4, $5, 'pending') 
         RETURNING id, author, avatar_url AS "avatarUrl", date, text, status, blog_post_id as "blog_post_id"`,
        [postId, sanitizedAuthor, avatarUrl, date, sanitizedText]
      );
      
      const newComment: Comment = result.rows[0];
      return res.status(201).json(newComment);
    } catch (dbError) {
      console.error("Database Error in /api/comments:", dbError);
      return res.status(500).json({ error: 'Une erreur interne est survenue lors de la sauvegarde du commentaire.' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("API Error in /api/comments:", error);
    return res.status(500).json({ error: 'Une erreur interne du serveur est survenue.' });
  }
}
