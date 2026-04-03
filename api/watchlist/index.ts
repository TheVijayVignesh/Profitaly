import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../db';
import { watchlists } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const userWatchlist = await db
        .select()
        .from(watchlists)
        .where(eq(watchlists.userId, userId))
        .orderBy(watchlists.addedAt);
      return res.status(200).json(userWatchlist);
    } else if (req.method === 'POST') {
      const { symbol, companyName, exchange } = req.body;
      
      // Check if already in watchlist
      const existing = await db
        .select()
        .from(watchlists)
        .where(and(eq(watchlists.userId, userId), eq(watchlists.symbol, symbol)))
        .limit(1);
      
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Symbol already in watchlist' });
      }
      
      const created = await db
        .insert(watchlists)
        .values({ 
          userId, 
          symbol, 
          companyName, 
          exchange 
        })
        .returning();
      return res.status(201).json(created[0]);
    } else if (req.method === 'DELETE') {
      const { symbol } = req.query;
      
      if (!symbol) {
        return res.status(400).json({ error: 'Symbol is required for deletion' });
      }
      
      const deleted = await db
        .delete(watchlists)
        .where(and(eq(watchlists.userId, userId), eq(watchlists.symbol, symbol as string)))
        .returning();
        
      if (deleted.length === 0) {
        return res.status(404).json({ error: 'Symbol not found in watchlist' });
      }
      
      return res.status(200).json({ message: 'Symbol removed from watchlist' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
