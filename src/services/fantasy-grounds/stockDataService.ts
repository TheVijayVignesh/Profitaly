import { Stock, MarketRegion } from '@/types/fantasy-grounds';

const TWELVE_DATA_API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY || '00c14c2a6d1e4233a8976d6d5facafc8';
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'd08vre9r01qju5m93bh0d08vre9r01qju5m93bhg';

// Cache for stock data to avoid excessive API calls
const stockCache: Record<string, { data: Stock; timestamp: number }> = {};
const CACHE_EXPIRY = 60000; // 1 minute

/**
 * Fetch stocks from a specific market region
 */
export const fetchStocksByMarket = async (marketRegion: MarketRegion): Promise<Stock[]> => {
  try {
    // Different endpoints based on market region
    const endpoint = '';
    let symbols: string[] = [];
    
    switch (marketRegion) {
      case 'NYSE':
        symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'JPM', 'V', 'PG', 'JNJ'];
        break;
      case 'NASDAQ':
        symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NVDA', 'PYPL', 'INTC', 'CMCSA'];
        break;
      case 'NSE':
        symbols = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS', 'ICICIBANK.NS', 'HDFC.NS', 'KOTAKBANK.NS', 'SBIN.NS', 'BAJFINANCE.NS'];
        break;
      default:
        throw new Error('Invalid market region');
    }

    // Fetch data for all symbols in parallel
    const stocksPromises = symbols.map(symbol => fetchStockData(symbol, marketRegion));
    return await Promise.all(stocksPromises);
  } catch (error) {
    console.error('Error fetching stocks by market:', error);
    throw error;
  }
};

/**
 * Fetch data for a specific stock
 */
export const fetchStockData = async (symbol: string, marketRegion: MarketRegion): Promise<Stock> => {
  const cacheKey = `${symbol}_${marketRegion}`;
  const now = Date.now();
  
  // Return cached data if available and not expired
  if (stockCache[cacheKey] && now - stockCache[cacheKey].timestamp < CACHE_EXPIRY) {
    return stockCache[cacheKey].data;
  }
  
  try {
    // Use TwelveData API for real-time stock data
    const response = await fetch(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`);
    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch stock data');
    }
    
    const stock: Stock = {
      symbol: data.symbol,
      name: data.name || symbol,
      price: parseFloat(data.close),
      previousClose: parseFloat(data.previous_close),
      change: parseFloat(data.close) - parseFloat(data.previous_close),
      changePercent: ((parseFloat(data.close) - parseFloat(data.previous_close)) / parseFloat(data.previous_close)) * 100,
      volume: parseInt(data.volume || '0'),
      marketCap: data.market_cap ? parseFloat(data.market_cap) : undefined
    };
    
    // Cache the result
    stockCache[cacheKey] = {
      data: stock,
      timestamp: now
    };
    
    return stock;
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    
    // Fallback to Finnhub if TwelveData fails
    try {
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
      const data = await response.json();
      
      const stock: Stock = {
        symbol: symbol,
        name: symbol, // Finnhub doesn't return name in quote endpoint
        price: data.c,
        previousClose: data.pc,
        change: data.c - data.pc,
        changePercent: ((data.c - data.pc) / data.pc) * 100,
        volume: data.v,
        marketCap: undefined // Finnhub doesn't return market cap in quote endpoint
      };
      
      // Cache the result
      stockCache[cacheKey] = {
        data: stock,
        timestamp: now
      };
      
      return stock;
    } catch (fallbackError) {
      console.error(`Fallback error fetching stock data for ${symbol}:`, fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Search for stocks by keyword
 */
export const searchStocks = async (query: string, marketRegion: MarketRegion): Promise<Stock[]> => {
  try {
    const response = await fetch(`https://api.twelvedata.com/symbol_search?symbol=${query}&apikey=${TWELVE_DATA_API_KEY}`);
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }
    
    // Filter by market region if specified
    let filteredResults = data.data;
    if (marketRegion === 'NYSE') {
      filteredResults = data.data.filter((item: any) => item.exchange === 'NYSE');
    } else if (marketRegion === 'NASDAQ') {
      filteredResults = data.data.filter((item: any) => item.exchange === 'NASDAQ');
    } else if (marketRegion === 'NSE') {
      filteredResults = data.data.filter((item: any) => item.exchange === 'NSE');
    }
    
    // Limit results and fetch details for each stock
    const limitedResults = filteredResults.slice(0, 10);
    const stocksPromises = limitedResults.map((item: any) => 
      fetchStockData(item.symbol, marketRegion)
    );
    
    return await Promise.all(stocksPromises);
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};
