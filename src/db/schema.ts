import { pgTable, text, numeric, timestamp, jsonb, boolean, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase UID
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  investmentProfile: jsonb('investment_profile'),
  preferences: jsonb('preferences'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const portfolios = pgTable('portfolios', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  cashBalance: numeric('cash_balance', { precision: 15, scale: 2 }).default('10000.00'),
  totalValue: numeric('total_value', { precision: 15, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const holdings = pgTable('holdings', {
  id: uuid('id').primaryKey().defaultRandom(),
  portfolioId: uuid('portfolio_id').notNull().references(() => portfolios.id),
  userId: text('user_id').notNull(),
  symbol: text('symbol').notNull(),
  companyName: text('company_name'),
  quantity: numeric('quantity', { precision: 15, scale: 6 }).notNull(),
  averageCost: numeric('average_cost', { precision: 15, scale: 4 }).notNull(),
  exchange: text('exchange'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id),
  portfolioId: uuid('portfolio_id').references(() => portfolios.id),
  symbol: text('symbol').notNull(),
  type: text('type').notNull(), // 'BUY' | 'SELL'
  quantity: numeric('quantity', { precision: 15, scale: 6 }).notNull(),
  price: numeric('price', { precision: 15, scale: 4 }).notNull(),
  total: numeric('total', { precision: 15, scale: 2 }).notNull(),
  exchange: text('exchange'),
  executedAt: timestamp('executed_at').defaultNow(),
});

export const watchlists = pgTable('watchlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id),
  symbol: text('symbol').notNull(),
  companyName: text('company_name'),
  exchange: text('exchange'),
  addedAt: timestamp('added_at').defaultNow(),
});

export const recommendations = pgTable('recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id),
  symbol: text('symbol').notNull(),
  reasoning: text('reasoning'),
  riskLevel: text('risk_level'),
  score: numeric('score', { precision: 5, scale: 2 }),
  isActive: boolean('is_active').default(true),
  generatedAt: timestamp('generated_at').defaultNow(),
});
