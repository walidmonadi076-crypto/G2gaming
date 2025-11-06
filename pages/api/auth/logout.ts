import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secureCookie = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  
  // On supprime les deux cookies (authentification et CSRF)
  res.setHeader('Set-Cookie', [
      `admin_auth=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict${secureCookie}`,
      `csrf_token=; Path=/; Max-Age=0; SameSite=Strict${secureCookie}`
  ]);
  
  return res.status(200).json({ success: true });
}
