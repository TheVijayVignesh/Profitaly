export type MarketRegion = 'NSE' | 'NYSE' | 'NASDAQ';

export interface Competition {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  marketRegion: MarketRegion;
  initialBalance: number;
  createdBy: string;
  participants: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface Participant {
  userId: string;
  displayName: string;
  photoURL?: string;
  walletBalance: number;
  portfolioValue: number;
  roi: number;
  joinedAt: Date;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface Transaction {
  id: string;
  competitionId: string;
  userId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
}

export interface Portfolio {
  userId: string;
  competitionId: string;
  walletBalance: number;
  positions: Position[];
  transactions: Transaction[];
  totalValue: number;
  roi: number;
}
