import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../db';
import { portfolios, holdings } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = req.headers['x-user-id'] as string;
  const portfolioId = req.query.id as string;
  
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!portfolioId) return res.status(400).json({ error: 'Portfolio ID required' });

  try {
    if (req.method === 'GET') {
      const portfolio = await db
        .select()
        .from(portfolios)
        .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)))
        .limit(1);
      
      if (portfolio.length === 0) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      const portfolioHoldings = await db
        .select()
        .from(holdings)
        .where(eq(holdings.portfolioId, portfolioId));

      return res.status(200).json({
        ...portfolio[0],
        holdings: portfolioHoldings
      });
    } else if (req.method === 'PUT') {
      const { name, cashBalance, totalValue } = req.body;
      
      const updated = await db
        .update(portfolios)
        .set({ 
          name, 
          cashBalance, 
          totalValue,
          updatedAt: new Date()
        })
        .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)))
        .returning();
        
      if (updated.length === 0) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }
      
      return res.status(200).json(updated[0]);
    } else if (req.method === 'DELETE') {
      const deleted = await db
        .delete(portfolios)
        .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)))
        .returning();
        
      if (deleted.length === 0) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }
      
      return res.status(200).json({ message: 'Portfolio deleted successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
