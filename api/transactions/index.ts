import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../db';
import { transactions } from '../../src/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { portfolioId } = req.query;
      
      let transactionsList;
      
      if (portfolioId) {
        transactionsList = await db
          .select()
          .from(transactions)
          .where(and(eq(transactions.userId, userId), eq(transactions.portfolioId, portfolioId as string)))
          .orderBy(desc(transactions.executedAt));
      } else {
        transactionsList = await db
          .select()
          .from(transactions)
          .where(eq(transactions.userId, userId))
          .orderBy(desc(transactions.executedAt));
      }
      
      return res.status(200).json(transactionsList);
    } else if (req.method === 'POST') {
      const { portfolioId, symbol, type, quantity, price, total, exchange } = req.body;
      
      const created = await db
        .insert(transactions)
        .values({ 
          userId, 
          portfolioId, 
          symbol, 
          type, 
          quantity, 
          price, 
          total, 
          exchange 
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
