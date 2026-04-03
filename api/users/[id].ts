import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../db';
import { users } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user[0]);
    } else if (req.method === 'POST') {
      const { email, displayName, photoUrl, investmentProfile, preferences } = req.body;
      
      const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (existingUser.length > 0) {
        // Update existing user
        const updated = await db
          .update(users)
          .set({ 
            email, 
            displayName, 
            photoUrl, 
            investmentProfile, 
            preferences,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId))
          .returning();
        return res.status(200).json(updated[0]);
      } else {
        // Create new user
        const created = await db
          .insert(users)
          .values({ 
            id: userId, 
            email, 
            displayName, 
            photoUrl, 
            investmentProfile, 
            preferences 
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
