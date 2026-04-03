import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../db';
import { recommendations } from '../../src/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { isActive } = req.query;
      
      let userRecommendations;
      
      if (isActive !== undefined) {
        userRecommendations = await db
          .select()
          .from(recommendations)
          .where(and(eq(recommendations.userId, userId), eq(recommendations.isActive, isActive === 'true')))
          .orderBy(desc(recommendations.generatedAt));
      } else {
        userRecommendations = await db
          .select()
          .from(recommendations)
          .where(eq(recommendations.userId, userId))
          .orderBy(desc(recommendations.generatedAt));
      }
      
      return res.status(200).json(userRecommendations);
    } else if (req.method === 'POST') {
      const { symbol, reasoning, riskLevel, score, isActive = true } = req.body;
      
      const created = await db
        .insert(recommendations)
        .values({ 
          userId, 
          symbol, 
          reasoning, 
          riskLevel, 
          score, 
          isActive 
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
