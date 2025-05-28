/**
 * Utility functions for fetching stock market data
 * Using TwelveData API for stock information
 */

// API key for TwelveData (replace with actual key or environment variable)
const API_KEY = "YOUR_TWELVEDATA_API_KEY"; // In production, use environment variable
const BASE_URL = "https://api.twelvedata.com";

// Demo/mock data for development
const DEMO_STOCKS = {
  "NSE": [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd.", price: 2745.35 },
    { symbol: "TCS", name: "Tata Consultancy Services Ltd.", price: 3456.70 },
    { symbol: "INFY", name: "Infosys Ltd.", price: 1543.20 },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", price: 1678.90 },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", price: 956.45 },
    { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd.", price: 1876.50 },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd.", price: 2543.80 },
    { symbol: "ITC", name: "ITC Ltd.", price: 434.25 },
    { symbol: "SBIN", name: "State Bank of India", price: 624.90 },
    { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd.", price: 876.35 }
  ],
  "NASDAQ": [
    { symbol: "AAPL", name: "Apple Inc.", price: 172.45 },
    { symbol: "MSFT", name: "Microsoft Corporation", price: 389.70 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 145.20 },
    { symbol: "AMZN", name: "Amazon.com, Inc.", price: 178.90 },
    { symbol: "META", name: "Meta Platforms, Inc.", price: 456.45 },
    { symbol: "TSLA", name: "Tesla, Inc.", price: 176.50 },
    { symbol: "NVDA", name: "NVIDIA Corporation", price: 843.80 },
    { symbol: "ADBE", name: "Adobe Inc.", price: 534.25 },
    { symbol: "NFLX", name: "Netflix, Inc.", price: 624.90 },
    { symbol: "PYPL", name: "PayPal Holdings, Inc.", price: 76.35 }
  ],
  "NYSE": [
    { symbol: "JPM", name: "JPMorgan Chase & Co.", price: 172.45 },
    { symbol: "BAC", name: "Bank of America Corporation", price: 39.70 },
    { symbol: "WMT", name: "Walmart Inc.", price: 65.20 },
    { symbol: "XOM", name: "Exxon Mobil Corporation", price: 118.90 },
    { symbol: "JNJ", name: "Johnson & Johnson", price: 156.45 },
    { symbol: "PG", name: "The Procter & Gamble Company", price: 176.50 },
    { symbol: "V", name: "Visa Inc.", price: 243.80 },
    { symbol: "MA", name: "Mastercard Incorporated", price: 434.25 },
    { symbol: "DIS", name: "The Walt Disney Company", price: 114.90 },
    { symbol: "KO", name: "The Coca-Cola Company", price: 76.35 }
  ]
};

/**
 * Search for stocks in a specific market
 * @param {string} query - Search query
 * @param {string} market - Market to search in (NSE, NASDAQ, NYSE)
 * @returns {Promise<Array>} - Array of stock objects
 */
export const searchStocks = async (query, market = "NASDAQ") => {
  if (!query) return [];
  
  // In a real app, this would call an API
  // For now, we'll use the demo data and filter it
  try {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Use demo data for development
    const marketStocks = DEMO_STOCKS[market] || [];
    
    if (!marketStocks.length) return [];
    
    // Filter stocks based on query
    const filteredStocks = marketStocks.filter(stock => {
      const lowercaseQuery = query.toLowerCase();
      return (
        stock.symbol.toLowerCase().includes(lowercaseQuery) ||
        stock.name.toLowerCase().includes(lowercaseQuery)
      );
    });
    
    return filteredStocks;
  } catch (error) {
    console.error("Error searching stocks:", error);
    throw error;
  }
};

/**
 * Fetch current price for a specific stock
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} - Stock price data
 */
export const fetchStockPrice = async (symbol) => {
  if (!symbol) {
    throw new Error("Stock symbol is required");
  }
  
  try {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find stock in demo data
    let stock = null;
    
    // Search across all markets for the symbol
    for (const market in DEMO_STOCKS) {
      const foundStock = DEMO_STOCKS[market].find(s => s.symbol === symbol);
      if (foundStock) {
        stock = foundStock;
        break;
      }
    }
    
    if (!stock) {
      throw new Error(`Stock ${symbol} not found`);
    }
    
    // Add random variation to price to simulate market movement
    const variation = (Math.random() * 4 - 2) / 100; // -2% to +2%
    const price = stock.price * (1 + variation);
    const change = stock.price * variation;
    const changePercent = variation * 100;
    
    return {
      symbol,
      price,
      change,
      changePercent,
      previousClose: stock.price,
      volume: Math.floor(Math.random() * 10000000)
    };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch time series data for a stock
 * @param {string} symbol - Stock symbol
 * @param {string} interval - Time interval (1min, 5min, 15min, 30min, 1h, 1day)
 * @param {number} outputsize - Number of data points to fetch
 * @returns {Promise<Array>} - Array of price data points
 */
export const getTimeSeriesData = async (symbol, interval = "1day", outputsize = 30) => {
  if (!symbol) {
    throw new Error("Stock symbol is required");
  }
  
  try {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Find stock in demo data
    let stock = null;
    
    // Search across all markets for the symbol
    for (const market in DEMO_STOCKS) {
      const foundStock = DEMO_STOCKS[market].find(s => s.symbol === symbol);
      if (foundStock) {
        stock = foundStock;
        break;
      }
    }
    
    if (!stock) {
      throw new Error(`Stock ${symbol} not found`);
    }
    
    // Generate mock time series data
    const data = [];
    const basePrice = stock.price;
    const today = new Date();
    
    // Generate historical data points
    for (let i = outputsize - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Generate a price with some random variation
      const dailyVariation = (Math.random() * 6 - 3) / 100; // -3% to +3%
      // Add a trend bias
      const trendBias = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5) / 100;
      const price = basePrice * (1 + dailyVariation + (trendBias * i));
      
      // Generate typical OHLC values
      const open = price * (1 + (Math.random() * 0.02 - 0.01));
      const high = Math.max(open, price) * (1 + Math.random() * 0.01);
      const low = Math.min(open, price) * (1 - Math.random() * 0.01);
      const close = price;
      
      data.push({
        datetime: date.toISOString(),
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 10000000)
      });
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching time series for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Get stock quote information
 * @param {string} symbol - Stock symbol
 * @param {string} exchange - Exchange name (optional)
 * @returns {Promise<Object>} Quote information
 */
export const getStockQuote = async (symbol, exchange = null) => {
  try {
    const queryParams = new URLSearchParams({
      symbol: symbol,
      apikey: API_KEY
    });
    
    if (exchange) {
      queryParams.append("exchange", exchange);
    }
    
    const response = await fetch(`${BASE_URL}/quote?${queryParams}`);
    const data = await response.json();
    
    if (data.code) {
      throw new Error(data.message || "Failed to fetch stock quote");
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Get multiple stock quotes in a single API call
 * @param {Array<string>} symbols - Array of stock symbols
 * @returns {Promise<Object>} Object with symbols as keys and quotes as values
 */
export const getMultipleQuotes = async (symbols) => {
  if (!symbols || symbols.length === 0) {
    return {};
  }
  
  try {
    const symbolsString = symbols.join(",");
    const queryParams = new URLSearchParams({
      symbols: symbolsString,
      apikey: API_KEY
    });
    
    const response = await fetch(`${BASE_URL}/quote?${queryParams}`);
    const data = await response.json();
    
    if (data.code) {
      throw new Error(data.message || "Failed to fetch multiple quotes");
    }
    
    // Handle response format which could be either an array or a single object
    if (Array.isArray(data)) {
      const result = {};
      data.forEach(quote => {
        result[quote.symbol] = quote;
      });
      return result;
    } else if (symbols.length === 1) {
      return { [symbols[0]]: data };
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching multiple quotes:", error);
    throw error;
  }
}; 