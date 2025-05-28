import axios from 'axios';

// Base URL for TwelveData API
const TWELVEDATA_API_URL = 'https://api.twelvedata.com';

// API key from environment variable - using Vite's import.meta.env format
const TWELVEDATA_API_KEY = import.meta.env.VITE_TWELVEDATA_API_KEY || '';

// Always use mock data in development
const USE_MOCK_DATA = true;

// Log to help debug
console.log(`TwelveData API: ${USE_MOCK_DATA ? 'Using mock data' : (TWELVEDATA_API_KEY ? 'API key is set' : 'API key is NOT set')}`);

/**
 * TwelveData API Service
 */
class TwelveDataService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: TWELVEDATA_API_URL,
      params: {
        apikey: TWELVEDATA_API_KEY
      }
    });
  }
  
  /**
   * Get random price for mock data
   */
  private getRandomPrice(symbol: string) {
    // Create deterministic but random-looking price based on symbol
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Math.round((50 + (hash % 450) + Math.random() * 10) * 100) / 100; // Price between 50 and 500
  }

  /**
   * Get random change amount for mock data
   */
  private getRandomChange() {
    return Math.round((Math.random() * 10 - 5) * 100) / 100; // Change between -5 and +5
  }

  /**
   * Get random change percent for mock data
   */
  private getRandomChangePercent() {
    return Math.round((Math.random() * 6 - 3) * 100) / 100; // Change between -3% and +3%
  }
  
  /**
   * Get company name for a symbol (for mock data)
   */
  private getCompanyName(symbol: string): string {
    // Map of common stock symbols to company names
    const companyNames: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'META': 'Meta Platforms Inc.',
      'TSLA': 'Tesla Inc.',
      'NVDA': 'NVIDIA Corporation',
      'JPM': 'JPMorgan Chase & Co.',
      'JNJ': 'Johnson & Johnson',
      'V': 'Visa Inc.',
      'PG': 'Procter & Gamble Co.',
      'DIS': 'The Walt Disney Company',
      'NFLX': 'Netflix Inc.',
      'ADBE': 'Adobe Inc.',
      'PYPL': 'PayPal Holdings Inc.'
    };
    
    // Return known company name or generate a generic one
    if (companyNames[symbol]) {
      return companyNames[symbol];
    }
    
    // Generate a generic company name based on the symbol
    const words = symbol.match(/[A-Z][a-z]*/g) || [symbol];
    const companyName = words.join(' ') + (words.length === 1 ? ' Corporation' : '');
    return companyName;
  }
  
  /**
   * Get random exchange for mock data
   */
  private getRandomExchange(): string {
    const exchanges = ['NASDAQ', 'NYSE', 'AMEX', 'LSE', 'TSX'];
    return exchanges[Math.floor(Math.random() * exchanges.length)];
  }

  /**
   * Get stock price for a symbol
   * @param symbol Stock symbol (e.g., AAPL)
   */
  async getPrice(symbol: string) {
    try {
      // Always use mock data in development
      if (USE_MOCK_DATA) {
        console.log(`Using mock price data for ${symbol}`);
        return {
          price: this.getRandomPrice(symbol)
        };
      }
      
      const response = await this.axiosInstance.get(`/price`, {
        params: { symbol }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching price from TwelveData:', error);
      return {
        price: this.getRandomPrice(symbol)
      };
    }
  }

  /**
   * Get historical data for a stock
   * @param symbol Stock symbol
   * @param interval Time interval (e.g., 1day, 1week)
   * @param outputsize Number of data points to retrieve
   */
  async getTimeSeries(symbol: string, interval: string = '1day', outputsize: number = 30) {
    try {
      const response = await this.axiosInstance.get(`/time_series`, {
        params: { symbol, interval, outputsize }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching time series from TwelveData:', error);
      throw error;
    }
  }

  /**
   * Search for companies by name or symbol
   * @param query Search query string
   */
  async searchSymbols(query: string) {
    try {
      const response = await this.axiosInstance.get('/symbol_search', {
        params: { symbol: query }
      });
      // Response: { data: Array<{ symbol: string; instrument_name: string; exchange: string }> }
      return response.data.data.map((item: any) => ({
        symbol: item.symbol,
        name: item.instrument_name,
        exchange: item.exchange
      }));
    } catch (error) {
      console.error('Error searching symbols on TwelveData:', error);
      throw error;
    }
  }
  
  /**
   * Get stock details for a symbol
   * @param symbol Stock symbol (e.g., AAPL)
   */
  async getStockDetails(symbol: string) {
    try {
      // In a real implementation, we would call the TwelveData API
      // For now, we'll use a mock implementation
      if (USE_MOCK_DATA || !TWELVEDATA_API_KEY) {
        console.log(`Using mock stock details for ${symbol}`);
        return {
          symbol,
          name: this.getCompanyName(symbol),
          exchange: this.getRandomExchange(),
          currency: 'USD',
          country: 'United States'
        };
      }
      
      // Get the stock details from the API
      const response = await this.axiosInstance.get(`/quote`, {
        params: { symbol }
      });
      
      return {
        symbol: response.data.symbol,
        name: response.data.name || this.getCompanyName(symbol),
        exchange: response.data.exchange || this.getRandomExchange(),
        currency: response.data.currency || 'USD',
        country: response.data.country || 'United States'
      };
    } catch (error) {
      console.error('Error fetching stock details from TwelveData:', error);
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
   * Get historical price data for a stock with multiple time periods
   * @param symbol Stock symbol
   */
  async getHistoricalData(symbol: string) {
    try {
      // Check if API key is available
      if (!TWELVEDATA_API_KEY) {
        console.log('TwelveData API key not found, generating mock chart data');
        return this.generateMockHistoricalData(symbol);
      }

      // Get daily data for the year
      const yearlyData = await this.axiosInstance.get('/time_series', {
        params: { 
          symbol, 
          interval: '1day', 
          outputsize: 365
        }
      }).catch(err => {
        console.warn(`Error fetching yearly data for ${symbol}:`, err.message);
        return { data: null };
      });

      // Get hourly data for recent activity
      const hourlyData = await this.axiosInstance.get('/time_series', {
        params: { 
          symbol, 
          interval: '1hour',
          outputsize: 24
        }
      }).catch(err => {
        console.warn(`Error fetching hourly data for ${symbol}:`, err.message);
        return { data: null };
      });

      // Check if we got valid data
      const hasYearlyData = yearlyData.data && yearlyData.data.values && yearlyData.data.values.length > 0;
      const hasHourlyData = hourlyData.data && hourlyData.data.values && hourlyData.data.values.length > 0;

      if (!hasYearlyData && !hasHourlyData) {
        console.log('No valid data received from TwelveData API, using mock data');
        return this.generateMockHistoricalData(symbol);
      }

      // Process data for charting
      const result = {
        yearly: hasYearlyData ? this.processTimeSeriesData(yearlyData.data) : [],
        recent: hasHourlyData ? this.processTimeSeriesData(hourlyData.data) : []
      };

      // Log the data for debugging
      console.log(`TwelveData chart data: ${result.yearly.length} yearly points, ${result.recent.length} recent points`);
      
      return result;
    } catch (error) {
      console.error('Error fetching historical data from TwelveData:', error);
      return this.generateMockHistoricalData(symbol);
    }
  }

  /**
   * Generate mock historical data for a symbol
   */
  private generateMockHistoricalData(symbol: string) {
    console.log(`Generating mock historical data for ${symbol}`);
    
    // Create deterministic but random-looking price based on symbol
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const basePrice = 50 + (hash % 450); // Price between 50 and 500
    
    // Generate yearly data - 365 days
    const today = new Date();
    const yearly = [];
    
    // Create a trend pattern (upward, downward, or volatile)
    const trend = hash % 3; // 0 = upward, 1 = downward, 2 = volatile
    const volatility = 0.01 + (hash % 10) / 200; // Between 0.01 and 0.06
    
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(today.getDate() - 365 + i);
      
      // Calculate trend factor
      let trendFactor;
      if (trend === 0) {
        // Upward trend
        trendFactor = 0.90 + (i / 365) * 0.20;
      } else if (trend === 1) {
        // Downward trend
        trendFactor = 1.10 - (i / 365) * 0.20;
      } else {
        // Volatile trend with some cycles
        trendFactor = 1.0 + Math.sin(i / 30) * 0.05;
      }
      
      // Add daily random variation
      const randomFactor = 1.0 + (Math.random() * 2 - 1) * volatility;
      
      // Calculate price with trend and randomness
      const price = basePrice * trendFactor * randomFactor;
      
      yearly.push({
        date: date.toISOString().split('T')[0],
        price: price,
        open: price * (1 - volatility * 0.5),
        high: price * (1 + volatility),
        low: price * (1 - volatility),
        volume: Math.floor(1000000 + Math.random() * 9000000)
      });
    }
    
    // Generate hourly data - 24 hours
    const recent = [];
    const latestPrice = yearly[yearly.length - 1].price;
    const hourlyVolatility = volatility * 0.5;
    
    for (let i = 0; i < 24; i++) {
      const date = new Date();
      date.setHours(today.getHours() - 24 + i);
      
      // Smaller variations for hourly data
      const randomFactor = 1.0 + (Math.random() * 2 - 1) * hourlyVolatility;
      const price = latestPrice * randomFactor;
      
      recent.push({
        date: date.toISOString(),
        price: price,
        open: price * (1 - hourlyVolatility * 0.3),
        high: price * (1 + hourlyVolatility * 0.5),
        low: price * (1 - hourlyVolatility * 0.5),
        volume: Math.floor(50000 + Math.random() * 200000)
      });
    }
    
    console.log(`Generated mock data: ${yearly.length} yearly points, ${recent.length} recent points`);
    
    return {
      yearly: yearly,
      recent: recent
    };
  }

  /**
   * Helper to process time series data
   */
  private processTimeSeriesData(data: any) {
    if (!data?.values) return [];
    
    return data.values.map((item: any) => ({
      date: item.datetime,
      price: parseFloat(item.close),
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      volume: parseInt(item.volume || 0)
    })).reverse();
  }

  /**
   * Get stocks listed on a specific exchange
   * @param exchange Exchange code ("NSE" for National Stock Exchange of India, "BSE" for Bombay Stock Exchange)
   */
  async getStocksByExchange(exchange: string) {
    try {
      // Check if API key is available or if we're using mock data
      if (USE_MOCK_DATA || !TWELVEDATA_API_KEY) {
        console.log(`Using mock stock data for ${exchange}`);
        return this.getMockStocksByExchange(exchange);
      }

      const response = await this.axiosInstance.get('/stocks', {
        params: {
          exchange: exchange,
          format: 'json'
        }
      });

      // Check if we got valid data
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log(`Received ${response.data.data.length} stocks from TwelveData for ${exchange}`);
        
        // Limit to 100 stocks to avoid performance issues
        return response.data.data.slice(0, 100).map((stock: any) => ({
          symbol: stock.symbol,
          name: stock.name,
          exchange: exchange,
          currency: stock.currency,
          sector: stock.type || 'Unknown',
          price: this.getRandomPrice(stock.symbol),
          change: this.getRandomChange(),
          changePercent: this.getRandomChangePercent()
        }));
      } else {
        console.warn(`TwelveData returned invalid stock data for ${exchange}`);
        return this.getMockStocksByExchange(exchange);
      }
    } catch (error) {
      console.error(`Error fetching stocks for ${exchange} from TwelveData:`, error);
      return this.getMockStocksByExchange(exchange);
    }
  }
  
  /**
   * Get mock stocks for Indian exchanges
   * @param exchange Exchange code
   */
  private getMockStocksByExchange(exchange: string) {
    let stocks = [];
    
    if (exchange === "NSE") {
      stocks = [
        { symbol: "RELIANCE.NSE", name: "Reliance Industries Ltd", exchange: "NSE", sector: "Oil & Gas" },
        { symbol: "TCS.NSE", name: "Tata Consultancy Services Ltd", exchange: "NSE", sector: "Technology" },
        { symbol: "HDFCBANK.NSE", name: "HDFC Bank Ltd", exchange: "NSE", sector: "Banking" },
        { symbol: "INFY.NSE", name: "Infosys Ltd", exchange: "NSE", sector: "Technology" },
        { symbol: "HINDUNILVR.NSE", name: "Hindustan Unilever Ltd", exchange: "NSE", sector: "Consumer Goods" },
        { symbol: "ICICIBANK.NSE", name: "ICICI Bank Ltd", exchange: "NSE", sector: "Banking" },
        { symbol: "SBIN.NSE", name: "State Bank of India", exchange: "NSE", sector: "Banking" },
        { symbol: "BAJFINANCE.NSE", name: "Bajaj Finance Ltd", exchange: "NSE", sector: "Financial Services" },
        { symbol: "BHARTIARTL.NSE", name: "Bharti Airtel Ltd", exchange: "NSE", sector: "Telecommunications" },
        { symbol: "KOTAKBANK.NSE", name: "Kotak Mahindra Bank Ltd", exchange: "NSE", sector: "Banking" },
        { symbol: "ITC.NSE", name: "ITC Ltd", exchange: "NSE", sector: "Consumer Goods" },
        { symbol: "ASIANPAINT.NSE", name: "Asian Paints Ltd", exchange: "NSE", sector: "Consumer Goods" },
        { symbol: "MARUTI.NSE", name: "Maruti Suzuki India Ltd", exchange: "NSE", sector: "Automotive" },
        { symbol: "TATAMOTORS.NSE", name: "Tata Motors Ltd", exchange: "NSE", sector: "Automotive" },
        { symbol: "AXISBANK.NSE", name: "Axis Bank Ltd", exchange: "NSE", sector: "Banking" },
        { symbol: "WIPRO.NSE", name: "Wipro Ltd", exchange: "NSE", sector: "Technology" },
        { symbol: "TATASTEEL.NSE", name: "Tata Steel Ltd", exchange: "NSE", sector: "Metals" },
        { symbol: "HCLTECH.NSE", name: "HCL Technologies Ltd", exchange: "NSE", sector: "Technology" },
        { symbol: "ADANIPORTS.NSE", name: "Adani Ports and Special Economic Zone Ltd", exchange: "NSE", sector: "Infrastructure" },
        { symbol: "ULTRACEMCO.NSE", name: "UltraTech Cement Ltd", exchange: "NSE", sector: "Construction" }
      ];
    } else if (exchange === "BSE") {
      stocks = [
        { symbol: "RELIANCE.BSE", name: "Reliance Industries Ltd", exchange: "BSE", sector: "Oil & Gas" },
        { symbol: "TCS.BSE", name: "Tata Consultancy Services Ltd", exchange: "BSE", sector: "Technology" },
        { symbol: "HDFCBANK.BSE", name: "HDFC Bank Ltd", exchange: "BSE", sector: "Banking" },
        { symbol: "INFY.BSE", name: "Infosys Ltd", exchange: "BSE", sector: "Technology" },
        { symbol: "HINDUNILVR.BSE", name: "Hindustan Unilever Ltd", exchange: "BSE", sector: "Consumer Goods" },
        { symbol: "ICICIBANK.BSE", name: "ICICI Bank Ltd", exchange: "BSE", sector: "Banking" },
        { symbol: "SBIN.BSE", name: "State Bank of India", exchange: "BSE", sector: "Banking" },
        { symbol: "BAJFINANCE.BSE", name: "Bajaj Finance Ltd", exchange: "BSE", sector: "Financial Services" },
        { symbol: "BHARTIARTL.BSE", name: "Bharti Airtel Ltd", exchange: "BSE", sector: "Telecommunications" },
        { symbol: "KOTAKBANK.BSE", name: "Kotak Mahindra Bank Ltd", exchange: "BSE", sector: "Banking" },
        { symbol: "ITC.BSE", name: "ITC Ltd", exchange: "BSE", sector: "Consumer Goods" },
        { symbol: "ASIANPAINT.BSE", name: "Asian Paints Ltd", exchange: "BSE", sector: "Consumer Goods" },
        { symbol: "MARUTI.BSE", name: "Maruti Suzuki India Ltd", exchange: "BSE", sector: "Automotive" },
        { symbol: "TATAMOTORS.BSE", name: "Tata Motors Ltd", exchange: "BSE", sector: "Automotive" },
        { symbol: "AXISBANK.BSE", name: "Axis Bank Ltd", exchange: "BSE", sector: "Banking" },
        { symbol: "WIPRO.BSE", name: "Wipro Ltd", exchange: "BSE", sector: "Technology" },
        { symbol: "TATASTEEL.BSE", name: "Tata Steel Ltd", exchange: "BSE", sector: "Metals" },
        { symbol: "HCLTECH.BSE", name: "HCL Technologies Ltd", exchange: "BSE", sector: "Technology" },
        { symbol: "ADANIPORTS.BSE", name: "Adani Ports and Special Economic Zone Ltd", exchange: "BSE", sector: "Infrastructure" },
        { symbol: "ULTRACEMCO.BSE", name: "UltraTech Cement Ltd", exchange: "BSE", sector: "Construction" }
      ];
    }
    
    // Add price and change data
    return stocks.map(stock => ({
      ...stock,
      price: this.getRandomPrice(stock.symbol),
      change: this.getRandomChange(),
      changePercent: this.getRandomChangePercent()
    }));
  }
  
  /**
   * Get company sentiment and news
   * @param symbol Stock symbol
   */
  async getCompanySentiment(symbol: string) {
    try {
      // This is a placeholder - TwelveData doesn't have a direct sentiment API
      // In a real implementation, you might use a different endpoint or combine data
      
      // Return a mock sentiment for now
      return {
        sentimentScore: Math.random() * 2 - 1, // Between -1 and 1
        bullishPercent: 50 + Math.floor(Math.random() * 50), // Between 50-100
        bearishPercent: Math.floor(Math.random() * 50), // Between 0-50
        news: [
          {
            id: '1',
            title: `Recent Developments for ${symbol}`,
            date: new Date().toISOString(),
            source: 'Market News',
            sentiment: 'positive'
          },
          {
            id: '2',
            title: `${symbol} Financial Results`,
            date: new Date(Date.now() - 86400000).toISOString(),
            source: 'Financial Times',
            sentiment: 'neutral'
          },
          {
            id: '3',
            title: `Industry Trends Affecting ${symbol}`,
            date: new Date(Date.now() - 172800000).toISOString(),
            source: 'Investment Journal',
            sentiment: 'mixed'
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching company sentiment from TwelveData:', error);
      throw error;
    }
  }
}

export const twelveDataService = new TwelveDataService();
export default twelveDataService; 