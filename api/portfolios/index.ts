import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../db';
import { portfolios } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const userPortfolios = await db.select().from(portfolios).where(eq(portfolios.userId, userId));
      return res.status(200).json(userPortfolios);
    } else if (req.method === 'POST') {
      const { name, cashBalance = '10000.00' } = req.body;
      
      const created = await db
        .insert(portfolios)
        .values({ 
          userId, 
          name, 
          cashBalance 
        })
        .returning();
      return res.status(201).json(created[0]);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
