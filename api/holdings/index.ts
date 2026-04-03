import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../db';
import { holdings } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { portfolioId } = req.query;
      
      let holdingsList;
      
      if (portfolioId) {
        holdingsList = await db.select().from(holdings).where(eq(holdings.portfolioId, portfolioId as string));
      } else {
        holdingsList = await db.select().from(holdings).where(eq(holdings.userId, userId));
      }
      
      return res.status(200).json(holdingsList);
    } else if (req.method === 'POST') {
      const { portfolioId, symbol, companyName, quantity, averageCost, exchange } = req.body;
      
      // Check if holding already exists
      const existing = await db
        .select()
        .from(holdings)
        .where(and(eq(holdings.portfolioId, portfolioId), eq(holdings.symbol, symbol)))
        .limit(1);
      
      if (existing.length > 0) {
        // Update existing holding
        const updated = await db
          .update(holdings)
          .set({ 
            quantity, 
            averageCost, 
            companyName, 
            exchange,
            updatedAt: new Date()
          })
          .where(eq(holdings.id, existing[0].id))
          .returning();
        return res.status(200).json(updated[0]);
      } else {
        // Create new holding
        const created = await db
          .insert(holdings)
          .values({ 
            portfolioId, 
            userId, 
            symbol, 
            companyName, 
            quantity, 
            averageCost, 
            exchange 
          })
          .returning();
        return res.status(201).json(created[0]);
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
