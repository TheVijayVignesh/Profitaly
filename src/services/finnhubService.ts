import axios from 'axios';

// Base URL for Finnhub API
const FINNHUB_API_URL = 'https://finnhub.io/api/v1';

// API key from environment variable - using Vite's import.meta.env format
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';

// Always use mock data in development
const USE_MOCK_DATA = true;

// Log to help debug
console.log(`Finnhub API: ${USE_MOCK_DATA ? 'Using mock data' : (FINNHUB_API_KEY ? 'API key is set' : 'API key is NOT set')}`);

/**
 * Finnhub API Service
 */
class FinnhubService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: FINNHUB_API_URL,
      params: {
        token: FINNHUB_API_KEY
      },
      timeout: 15000 // 15 seconds timeout for real API calls
    });
  }

  /**
   * Get stocks by exchange for trial room
   * @param exchange Exchange code ("NYSE" | "NASDAQ")
   */
  async getStocksByExchange(exchange: string) {
    try {
      // Always use mock data in development
      if (USE_MOCK_DATA || !FINNHUB_API_KEY) {
        console.log(`Using mock stock data for ${exchange}`);
        return this.getMockStocksByExchange(exchange);
      }
      
      const response = await this.axiosInstance.get('/stock/symbol', {
        params: { exchange }
      });
      
      // Map response to our format and filter out non-common stocks
      return response.data
        .filter((stock: any) => stock.type === 'Common Stock' || stock.type === 'ETP')
        .slice(0, 100) // Limit to 100 stocks to avoid performance issues
        .map((stock: any) => ({
          symbol: stock.symbol,
          name: stock.description,
          exchange: exchange,
          sector: this.getRandomSector() // Finnhub doesn't include sector in this endpoint
        }));
    } catch (error) {
      console.error(`Error fetching stocks for ${exchange} from Finnhub:`, error);
      // Return mock data on error
      return this.getMockStocksByExchange(exchange);
    }
  }
  
  /**
   * Get mock stocks for an exchange
   * @param exchange Exchange code
   */
  private getMockStocksByExchange(exchange: string) {
    const baseMockStocks = [
      { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", sector: "Consumer Cyclical" },
      { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", sector: "Automotive" },
      { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE", sector: "Financial Services" },
      { symbol: "JNJ", name: "Johnson & Johnson", exchange: "NYSE", sector: "Healthcare" },
      { symbol: "V", name: "Visa Inc.", exchange: "NYSE", sector: "Financial Services" },
      { symbol: "PG", name: "Procter & Gamble Co.", exchange: "NYSE", sector: "Consumer Defensive" },
      { symbol: "UNH", name: "UnitedHealth Group Inc.", exchange: "NYSE", sector: "Healthcare" },
      { symbol: "HD", name: "Home Depot Inc.", exchange: "NYSE", sector: "Consumer Cyclical" },
      { symbol: "MA", name: "Mastercard Inc.", exchange: "NYSE", sector: "Financial Services" },
      { symbol: "DIS", name: "Walt Disney Co.", exchange: "NYSE", sector: "Communication Services" },
      { symbol: "BAC", name: "Bank of America Corp.", exchange: "NYSE", sector: "Financial Services" },
      { symbol: "XOM", name: "Exxon Mobil Corp.", exchange: "NYSE", sector: "Energy" },
      { symbol: "PFE", name: "Pfizer Inc.", exchange: "NYSE", sector: "Healthcare" },
      { symbol: "CSCO", name: "Cisco Systems Inc.", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "NFLX", name: "Netflix Inc.", exchange: "NASDAQ", sector: "Communication Services" },
      { symbol: "ADBE", name: "Adobe Inc.", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "CMCSA", name: "Comcast Corp.", exchange: "NASDAQ", sector: "Communication Services" },
      { symbol: "PEP", name: "PepsiCo Inc.", exchange: "NASDAQ", sector: "Consumer Defensive" },
      { symbol: "KO", name: "Coca-Cola Co.", exchange: "NYSE", sector: "Consumer Defensive" },
      { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE", sector: "Consumer Defensive" }
    ];
    
    // Filter by exchange
    return baseMockStocks
      .filter(stock => stock.exchange === exchange)
      .map(stock => ({
        ...stock,
        price: this.getRandomPrice(stock.symbol),
        change: this.getRandomChange(),
        changePercent: this.getRandomChangePercent()
      }));
  }
  
  /**
   * Helper to generate random stock price based on symbol
   */
  private getRandomPrice(symbol: string) {
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Math.floor(50 + (hash % 950));
  }
  
  /**
   * Helper to generate random price change
   */
  private getRandomChange() {
    return Math.round((Math.random() * 10 - 5) * 100) / 100;
  }
  
  /**
   * Helper to generate random price change percent
   */
  private getRandomChangePercent() {
    return Math.round((Math.random() * 6 - 3) * 100) / 100;
  }
  
  /**
   * Helper to get a random sector
   */
  private getRandomSector() {
    const sectors = [
      "Technology", "Healthcare", "Financial Services", "Consumer Cyclical", 
      "Communication Services", "Industrials", "Consumer Defensive", "Energy", 
      "Basic Materials", "Real Estate", "Utilities"
    ];
    return sectors[Math.floor(Math.random() * sectors.length)];
  }
  
  /**
   * Helper to get company name from symbol
   * @param symbol Stock symbol
   */
  private getCompanyName(symbol: string) {
    const companyNames: {[key: string]: string} = {
      "AAPL": "Apple Inc.",
      "MSFT": "Microsoft Corporation",
      "AMZN": "Amazon.com Inc.",
      "GOOGL": "Alphabet Inc.",
      "META": "Meta Platforms Inc.",
      "TSLA": "Tesla Inc.",
      "NVDA": "NVIDIA Corporation",
      "JPM": "JPMorgan Chase & Co.",
      "JNJ": "Johnson & Johnson",
      "V": "Visa Inc.",
      "PG": "Procter & Gamble Co.",
      "UNH": "UnitedHealth Group Inc.",
      "HD": "Home Depot Inc.",
      "MA": "Mastercard Inc.",
      "DIS": "Walt Disney Co.",
      "BAC": "Bank of America Corp.",
      "XOM": "Exxon Mobil Corp.",
      "PFE": "Pfizer Inc.",
      "CSCO": "Cisco Systems Inc.",
      "NFLX": "Netflix Inc.",
      "ADBE": "Adobe Inc.",
      "CMCSA": "Comcast Corp.",
      "PEP": "PepsiCo Inc.",
      "KO": "Coca-Cola Co.",
      "WMT": "Walmart Inc."
    };
    
    return companyNames[symbol] || `${symbol} Corporation`;
  }
  
  /**
   * Helper to get a random exchange
   */
  private getRandomExchange() {
    const exchanges = ["NASDAQ", "NYSE"];
    return exchanges[Math.floor(Math.random() * exchanges.length)];
  }

  /**
   * Get stock quote for a symbol
   * @param symbol Stock symbol (e.g., AAPL for Apple)
   */
  async getStockQuote(symbol: string) {
    try {
      // If no API key, use a mock response with current timestamp
      if (!FINNHUB_API_KEY) {
        console.log('No Finnhub API key found, using mock data');
        // Generate mock price data based on symbol hash
        const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const basePrice = (hash % 1000) + 50; // Price between 50-1050
        const change = (Math.random() * 10) - 5; // Change between -5 and 5
        const percentChange = (change / basePrice) * 100;
        
        return {
          c: basePrice, // Current price
          d: change.toFixed(2), // Change
          dp: percentChange.toFixed(2), // Percent change
          h: basePrice + (Math.random() * 10), // High
          l: basePrice - (Math.random() * 10), // Low
          o: basePrice - change, // Open
          pc: basePrice - change, // Previous close
          t: Date.now(), // Timestamp
          v: Math.floor(Math.random() * 10000000) // Volume
        };
      }
      
      const response = await this.axiosInstance.get(`/quote`, {
        params: { symbol }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock quote from Finnhub:', error);
      throw error;
    }
  }

  /**
   * Get company profile
   * @param symbol Stock symbol
   */
  async getCompanyProfile(symbol: string) {
    try {
      const response = await this.axiosInstance.get(`/stock/profile2`, {
        params: { symbol }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching company profile from Finnhub:', error);
      throw error;
    }
  }

  /**
   * Get stock details for a symbol
   * @param symbol Stock symbol (e.g., AAPL)
   */
  async getStockDetails(symbol: string) {
    try {
      // If using mock data or no API key, return mock stock details
      if (USE_MOCK_DATA || !FINNHUB_API_KEY) {
        console.log(`Using mock stock details for ${symbol}`);
        return {
          symbol,
          name: this.getCompanyName(symbol),
          exchange: this.getRandomExchange(),
          currency: 'USD',
          country: 'United States'
        };
      }
      
      // Try to get company profile from the API
      const profile = await this.getCompanyProfile(symbol)
        .catch(() => null);
      
      if (profile) {
        return {
          symbol: profile.ticker || symbol,
          name: profile.name || this.getCompanyName(symbol),
          exchange: profile.exchange || this.getRandomExchange(),
          currency: profile.currency || 'USD',
          country: profile.country || 'United States'
        };
      } else {
        // Fallback to mock data if profile not found
        return {
          symbol,
          name: this.getCompanyName(symbol),
          exchange: this.getRandomExchange(),
          currency: 'USD',
          country: 'United States'
        };
      }
    } catch (error) {
      console.error('Error fetching stock details from Finnhub:', error);
      // Return mock data as fallback
      return {
        symbol,
        name: this.getCompanyName(symbol),
        exchange: this.getRandomExchange(),
        currency: 'USD',
        country: 'United States'
      };
    }
  }

  /**
   * Search for companies by name or symbol
   * @param query Search query string
   */
  async searchSymbols(query: string) {
    try {
      const response = await this.axiosInstance.get('/search', {
        params: { q: query }
      });
      // Response: { count: number; result: Array<{ symbol: string; description: string; exchange: string }> }
      return response.data.result.map((item: any) => ({
        symbol: item.symbol,
        name: item.description,
        exchange: item.exchange
      }));
    } catch (error) {
      console.error('Error searching symbols on Finnhub:', error);
      throw error;
    }
  }

  /**
   * Get latest company news
   * @param symbol Stock symbol
   */
  async getCompanyNews(symbol: string) {
    try {
      // Calculate dates for last month
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - 1);
      
      // Format dates as YYYY-MM-DD
      const to = toDate.toISOString().split('T')[0];
      const from = fromDate.toISOString().split('T')[0];
      
      // If no API key, return mock news
      if (!FINNHUB_API_KEY) {
        return this.getMockNews(symbol, 5);
      }
      
      const response = await this.axiosInstance.get(`/company-news`, {
        params: { symbol, from, to }
      });
      
      // Sort by date descending and limit to 10 items
      return response.data
        .sort((a: any, b: any) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
        .slice(0, 10)
        .map((item: any) => ({
          id: item.id || String(item.datetime),
          title: item.headline,
          summary: item.summary,
          url: item.url,
          source: item.source,
          date: new Date(item.datetime * 1000).toISOString(),
          sentiment: this.calculateSentiment(item.summary || '')
        }));
    } catch (error) {
      console.error('Error fetching company news from Finnhub:', error);
      // Return mock news on error
      return this.getMockNews(symbol, 5);
    }
  }
  
  /**
   * Create mock news for testing
   */
  private getMockNews(symbol: string, count: number) {
    const news = [];
    const sources = ['Market Watch', 'Bloomberg', 'CNBC', 'Financial Times', 'Wall Street Journal'];
    const topics = [
      'quarterly results', 'new product announcement', 'management changes', 
      'market expansion', 'strategic partnership', 'industry trends'
    ];
    
    const sourceUrls = {
      'Market Watch': 'https://www.marketwatch.com/search?q=',
      'Bloomberg': 'https://www.bloomberg.com/search?query=',
      'CNBC': 'https://www.cnbc.com/search/?query=',
      'Financial Times': 'https://www.ft.com/search?q=',
      'Wall Street Journal': 'https://www.wsj.com/search?query='
    };
    
    for (let i = 0; i < count; i++) {
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const daysAgo = i * 2; // Space out the news
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      news.push({
        id: `mock-${symbol}-${i}`,
        title: `${symbol} announces ${topic}`,
        summary: `${symbol} has recently published information regarding ${topic}. This could potentially impact the company's performance in the coming quarters.`,
        url: sourceUrls[source] + encodeURIComponent(symbol),
        source,
        date: date.toISOString(),
        sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)]
      });
    }
    
    return news;
  }
  
  /**
   * Simple sentiment analysis (mock)
   */
  private calculateSentiment(text: string) {
    const positiveWords = ['growth', 'profit', 'increase', 'success', 'positive', 'gain', 'higher'];
    const negativeWords = ['loss', 'decline', 'decrease', 'negative', 'fall', 'lower', 'risk'];
    
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      positiveCount += (lowerText.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    });
    
    negativeWords.forEach(word => {
      negativeCount += (lowerText.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Get historical candle data for a stock
   * @param symbol Stock symbol
   * @param resolution Candle resolution (1, 5, 15, 30, 60, D, W, M)
   * @param from UNIX timestamp for start date
   * @param to UNIX timestamp for end date
   */
  async getHistoricalCandles(symbol: string, resolution: string = 'D', from?: number, to?: number) {
    try {
      // Default to last year if not specified
      if (!from || !to) {
        const now = Math.floor(Date.now() / 1000);
        // Default periods based on resolution
        if (resolution === '1' || resolution === '5' || resolution === '15' || resolution === '30' || resolution === '60') {
          // For intraday, get last 24 hours
          from = now - (24 * 60 * 60);
        } else if (resolution === 'D') {
          // For daily, get last year
          from = now - (365 * 24 * 60 * 60);
        } else if (resolution === 'W') {
          // For weekly, get last 2 years
          from = now - (2 * 365 * 24 * 60 * 60);
        } else {
          // For monthly, get last 5 years
          from = now - (5 * 365 * 24 * 60 * 60);
        }
        to = now;
      }
      
      // If no API key, return mock candle data
      if (!FINNHUB_API_KEY) {
        console.log('No Finnhub API key found, using mock candle data');
        return this.generateMockCandleData(symbol, resolution, from, to);
      }
      
      const response = await this.axiosInstance.get('/stock/candle', {
        params: {
          symbol,
          resolution,
          from,
          to
        }
      });
      
      // If we got valid data
      if (response.data && response.data.s === 'ok' && Array.isArray(response.data.t)) {
        console.log(`Received ${response.data.t.length} candles from Finnhub for ${symbol}`);
        
        // Process the data for easier consumption
        const candles = response.data.t.map((timestamp: number, index: number) => ({
          date: new Date(timestamp * 1000).toISOString(),
          timestamp: timestamp,
          open: response.data.o[index],
          high: response.data.h[index],
          low: response.data.l[index],
          close: response.data.c[index],
          price: response.data.c[index], // Adding price alias for compatibility
          volume: response.data.v[index]
        }));
        
        return {
          candles,
          status: 'ok'
        };
      } else {
        console.warn(`Finnhub returned invalid candle data for ${symbol}: ${response.data?.s}`);
        return this.generateMockCandleData(symbol, resolution, from, to);
      }
    } catch (error) {
      console.error('Error fetching historical candles from Finnhub:', error);
      return this.generateMockCandleData(symbol, resolution, from, to);
    }
  }

  /**
   * Generate mock candle data for testing
   */
  private generateMockCandleData(symbol: string, resolution: string, from: number, to: number) {
    console.log(`Generating mock candle data for ${symbol} with resolution ${resolution}`);
    
    // Calculate how many candles to generate based on resolution
    let interval: number;
    let format: string;
    
    switch (resolution) {
      case '1': interval = 60; format = 'minute'; break;        // 1 minute
      case '5': interval = 5 * 60; format = 'minute'; break;    // 5 minutes
      case '15': interval = 15 * 60; format = 'minute'; break;  // 15 minutes
      case '30': interval = 30 * 60; format = 'minute'; break;  // 30 minutes
      case '60': interval = 60 * 60; format = 'hour'; break;    // 1 hour
      case 'D': interval = 24 * 60 * 60; format = 'day'; break; // 1 day
      case 'W': interval = 7 * 24 * 60 * 60; format = 'week'; break; // 1 week
      case 'M': interval = 30 * 24 * 60 * 60; format = 'month'; break; // 1 month (approx)
      default: interval = 24 * 60 * 60; format = 'day'; // Default to daily
    }
    
    // Calculate number of candles to generate (max 1000 to avoid performance issues)
    const timeRange = to - from;
    let numCandles = Math.min(Math.floor(timeRange / interval), 1000);
    
    // Ensure we have at least 10 candles for visualization
    numCandles = Math.max(numCandles, 10);
    
    // Create deterministic but random-looking price based on symbol
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const basePrice = 50 + (hash % 450); // Price between 50 and 500
    
    // Create a trend pattern (upward, downward, or volatile)
    const trend = hash % 3; // 0 = upward, 1 = downward, 2 = volatile
    const volatility = 0.01 + (hash % 10) / 200; // Between 0.01 and 0.06
    
    const candles = [];
    
    for (let i = 0; i < numCandles; i++) {
      const timestamp = from + (i * interval);
      
      // Calculate trend factor
      let trendFactor;
      if (trend === 0) {
        // Upward trend
        trendFactor = 0.95 + (i / numCandles) * 0.10;
      } else if (trend === 1) {
        // Downward trend
        trendFactor = 1.05 - (i / numCandles) * 0.10;
      } else {
        // Volatile trend with some cycles
        trendFactor = 1.0 + Math.sin(i / 20) * 0.05;
      }
      
      // Add random variation
      const randomFactor = 1.0 + (Math.random() * 2 - 1) * volatility;
      
      // Calculate base price with trend and randomness
      const price = basePrice * trendFactor * randomFactor;
      
      // Calculate OHLC data with some intrabar movement
      const open = price * (1 - volatility * 0.5 + Math.random() * volatility);
      const close = price;
      const high = Math.max(open, close) * (1 + Math.random() * volatility);
      const low = Math.min(open, close) * (1 - Math.random() * volatility);
      
      // Add volume that correlates somewhat with price movement
      const volume = Math.floor(1000000 + Math.random() * 9000000 * (1 + Math.abs(open - close) / open));
      
      candles.push({
        date: new Date(timestamp * 1000).toISOString(),
        timestamp: timestamp,
        open: open,
        high: high,
        low: low,
        close: close,
        price: close, // Adding price alias for compatibility
        volume: volume
      });
    }
    
    return {
      candles,
      status: 'ok'
    };
  }
}

export const finnhubService = new FinnhubService();
export default finnhubService; 