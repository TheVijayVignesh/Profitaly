// Mock stock market data for our app

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  exchange: string;
}

export interface StockDetail extends Stock {
  open: number;
  high: number;
  low: number;
  pe: number;
  dividend: number;
  yield: number;
  description: string;
  historicalPrices: { date: string; price: number }[];
  news: { id: string; title: string; date: string; source: string }[];
}

export const popularStocks: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 175.42,
    change: 1.23,
    changePercent: 0.71,
    volume: 54300000,
    marketCap: 2950000000000,
    sector: "Technology",
    exchange: "NASDAQ"
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 342.18,
    change: 5.32,
    changePercent: 1.58,
    volume: 21800000,
    marketCap: 3020000000000,
    sector: "Technology",
    exchange: "NASDAQ"
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 175.36,
    change: 2.65,
    changePercent: 1.53,
    volume: 39200000,
    marketCap: 1810000000000,
    sector: "Consumer Cyclical",
    exchange: "NASDAQ"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc. Class A",
    price: 132.67,
    change: -0.87,
    changePercent: -0.65,
    volume: 18500000,
    marketCap: 1950000000000,
    sector: "Technology",
    exchange: "NASDAQ"
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    price: 298.42,
    change: 4.12,
    changePercent: 1.40,
    volume: 25300000,
    marketCap: 1220000000000,
    sector: "Technology",
    exchange: "NASDAQ"
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 245.67,
    change: -3.25,
    changePercent: -1.31,
    volume: 98700000,
    marketCap: 780000000000,
    sector: "Consumer Cyclical",
    exchange: "NASDAQ"
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 142.89,
    change: -0.45,
    changePercent: -0.31,
    volume: 12300000,
    marketCap: 560000000000,
    sector: "Financial Services",
    exchange: "NYSE"
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    price: 165.72,
    change: 1.28,
    changePercent: 0.78,
    volume: 7800000,
    marketCap: 560000000000,
    sector: "Healthcare",
    exchange: "NYSE"
  },
  {
    symbol: "V",
    name: "Visa Inc.",
    price: 235.14,
    change: 2.87,
    changePercent: 1.24,
    volume: 8200000,
    marketCap: 560000000000,
    sector: "Financial Services",
    exchange: "NYSE"
  },
  {
    symbol: "PG",
    name: "Procter & Gamble Co.",
    price: 156.92,
    change: 0.54,
    changePercent: 0.35,
    volume: 6500000,
    marketCap: 560000000000,
    sector: "Consumer Defensive",
    exchange: "NYSE"
  },
  {
    symbol: "DIS",
    name: "Walt Disney Co.",
    price: 113.87,
    change: -2.35,
    changePercent: -2.02,
    volume: 14700000,
    marketCap: 560000000000,
    sector: "Communication Services",
    exchange: "NYSE"
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc.",
    price: 528.75,
    change: 12.45,
    changePercent: 2.41,
    volume: 8900000,
    marketCap: 560000000000,
    sector: "Communication Services",
    exchange: "NASDAQ"
  },
  {
    symbol: "KO",
    name: "Coca-Cola Co.",
    price: 58.25,
    change: 0.32,
    changePercent: 0.55,
    volume: 5400000,
    marketCap: 560000000000,
    sector: "Consumer Defensive",
    exchange: "NYSE"
  },
  {
    symbol: "PEP",
    name: "PepsiCo Inc.",
    price: 168.42,
    change: 1.15,
    changePercent: 0.69,
    volume: 4700000,
    marketCap: 560000000000,
    sector: "Consumer Defensive",
    exchange: "NASDAQ"
  },
  {
    symbol: "BAC",
    name: "Bank of America Corp.",
    price: 35.78,
    change: -0.67,
    changePercent: -1.84,
    volume: 42300000,
    marketCap: 560000000000,
    sector: "Financial Services",
    exchange: "NYSE"
  }
];

export const trendingSectors = [
  {
    name: "Technology",
    performance: 2.35
  },
  {
    name: "Healthcare",
    performance: 1.2
  },
  {
    name: "Financial",
    performance: -0.8
  },
  {
    name: "Energy",
    performance: -1.5
  },
  {
    name: "Consumer",
    performance: 0.7
  },
  {
    name: "Utilities",
    performance: 0.3
  },
  {
    name: "Real Estate",
    performance: -0.4
  },
  {
    name: "Industrials",
    performance: 1.1
  }
];

export const marketIndices = [
  {
    name: "S&P 500",
    value: 4185.65,
    change: 23.45,
    changePercent: 0.56
  },
  {
    name: "NASDAQ",
    value: 14035.22,
    change: 153.42,
    changePercent: 1.10
  },
  {
    name: "DOW JONES",
    value: 32981.75,
    change: -85.41,
    changePercent: -0.26
  },
  {
    name: "RUSSELL 2000",
    value: 2192.13,
    change: 16.87,
    changePercent: 0.78
  },
  {
    name: "FTSE 100",
    value: 6712.89,
    change: -40.72,
    changePercent: -0.60
  }
];

export const getStockDetails = (symbol: string): StockDetail | null => {
  const stock = popularStocks.find(s => s.symbol === symbol);
  if (!stock) return null;
  
  return {
    ...stock,
    open: stock.price - stock.price * Math.random() * 0.02,
    high: stock.price + stock.price * Math.random() * 0.01,
    low: stock.price - stock.price * Math.random() * 0.015,
    pe: 15 + Math.random() * 10,
    dividend: Math.random() * 2,
    yield: Math.random() * 3,
    description: `${stock.name} is a leading company in the ${stock.sector} sector. It operates globally and is known for its innovative products and services.`,
    historicalPrices: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: stock.price * (0.9 + Math.random() * 0.2)
    })),
    news: [
      { id: '1', title: `${stock.name} Reports Strong Q2 Results`, date: '2023-07-28', source: 'Financial Times' },
      { id: '2', title: `Analysts Upgrade ${stock.name} to Buy`, date: '2023-07-25', source: 'Wall Street Journal' },
      { id: '3', title: `${stock.name} Announces New Product Line`, date: '2023-07-20', source: 'Bloomberg' },
      { id: '4', title: `${stock.name} CEO Discusses Future Growth Plans`, date: '2023-07-15', source: 'CNBC' }
    ]
  };
};

export const searchStocks = (query: string): Stock[] => {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return popularStocks.filter(
    stock => stock.symbol.toLowerCase().includes(lowerQuery) || 
             stock.name.toLowerCase().includes(lowerQuery)
  );
};

// Mock user portfolio
export interface PortfolioHolding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

export const userPortfolio: PortfolioHolding[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 10,
    avgPrice: 155.75,
    currentPrice: 175.42
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    shares: 5,
    avgPrice: 250.35,
    currentPrice: 342.18
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc. Class A",
    shares: 3,
    avgPrice: 120.12,
    currentPrice: 132.67
  }
];

export const portfolioPerformance = [
  { date: "2024-04-10", value: 95000 },
  { date: "2024-04-17", value: 93500 },
  { date: "2024-04-24", value: 97200 },
  { date: "2024-05-01", value: 96800 },
  { date: "2024-05-08", value: 102500 }
];

// Mock learning modules
export interface LearningModule {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  completed?: boolean;
}

export const learningModules: LearningModule[] = [
  {
    id: 'stocks-101',
    title: 'Stocks 101: Getting Started',
    description: 'Learn the basics of stock markets, terminology, and how to start investing.',
    level: 'beginner',
    duration: 30,
    completed: true
  },
  {
    id: 'financial-ratios',
    title: 'Understanding Financial Ratios',
    description: 'Master key financial ratios that help evaluate company performance.',
    level: 'intermediate',
    duration: 45
  },
  {
    id: 'portfolio-management',
    title: 'Portfolio Management Strategies',
    description: 'Learn how to build and manage a diversified investment portfolio.',
    level: 'intermediate',
    duration: 60
  },
  {
    id: 'technical-analysis',
    title: 'Technical Analysis Fundamentals',
    description: 'Understand chart patterns and technical indicators for stock trading.',
    level: 'advanced',
    duration: 75
  }
];

// Trial Room data
export const userTrialBalance = 100000;

export const userTrialPortfolio = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 10,
    avgPrice: 173.50
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    shares: 5,
    avgPrice: 339.25
  }
];

export const userTrialTransactions = [
  {
    id: "t1",
    type: "buy",
    symbol: "AAPL",
    shares: 10,
    price: 173.50,
    timestamp: "2024-05-08T14:30:00Z"
  },
  {
    id: "t2",
    type: "buy",
    symbol: "MSFT",
    shares: 5,
    price: 339.25,
    timestamp: "2024-05-07T10:15:00Z"
  }
];
