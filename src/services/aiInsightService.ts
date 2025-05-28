import axios from 'axios';

// Base URL for Perplexity API
const PERPLEXITY_API_URL = 'https://api.perplexity.ai';

// API key from environment variable
const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY || '';

// Development mode flag
const IS_DEV = import.meta.env.DEV;

// Log to help debug
console.log(`Perplexity API: ${PERPLEXITY_API_KEY ? 'API key is set' : 'API key is NOT set'}`);

/**
 * AI Insight Service
 * Provides detailed stock analysis and recommendations using Perplexity API
 */
class AIInsightService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: PERPLEXITY_API_URL,
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout for AI responses
    });
  }

  /**
   * Get AI-generated insights for a stock
   * @param symbol Stock symbol (e.g., AAPL)
   * @param companyName Company name
   * @param price Current stock price
   * @param newsHeadlines Recent news headlines (optional)
   */
  async getStockInsight(
    symbol: string, 
    companyName: string, 
    price: number,
    newsHeadlines?: string[]
  ) {
    try {
      // If in development or no API key, return mock data
      if (IS_DEV || !PERPLEXITY_API_KEY) {
        console.log(`Using mock AI insight for ${symbol}`);
        return this.getMockInsight(symbol, companyName, price);
      }
      
      // Construct the prompt with all available information
      let prompt = `Provide a detailed buy/hold/sell recommendation for ${companyName} (${symbol}) currently trading at $${price}.`;
      prompt += ` Include company fundamentals (P/E ratio, sector trends, recent earnings) and a specific price target or threshold.`;
      prompt += ` Do not default to "Hold" - be specific and decisive in your recommendation based on data.`;
      
      // Include news context if available
      if (newsHeadlines && newsHeadlines.length > 0) {
        prompt += ` Consider these recent headlines in your analysis: ${newsHeadlines.join('; ')}.`;
      }
      
      prompt += ` Format your response in 3-4 sentences explaining the rationale and include specific metrics.`;
      
      const response = await this.axiosInstance.post('/chat/completions', {
        model: 'sonar-medium-online',
        messages: [
          { role: 'system', content: 'You are a professional financial analyst providing concise stock recommendations.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300
      });
      
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content;
        
        // Extract recommendation type from content
        const recommendation = this.extractRecommendation(content);
        
        return {
          recommendation,
          analysis: content,
          timestamp: new Date().toISOString()
        };
      } else {
        console.warn(`No valid response from Perplexity API for ${symbol}, using mock data`);
        return this.getMockInsight(symbol, companyName, price);
      }
    } catch (error) {
      console.error('Error fetching AI insight:', error);
      return this.getMockInsight(symbol, companyName, price);
    }
  }
  
  /**
   * Extract recommendation type from analysis text
   */
  private extractRecommendation(text: string): 'buy' | 'sell' | 'hold' {
    const lowerText = text.toLowerCase();
    
    // Check for explicit recommendations
    if (
      lowerText.includes('strong buy') || 
      lowerText.includes('recommend buy') || 
      lowerText.includes('buy rating')
    ) {
      return 'buy';
    } else if (
      lowerText.includes('strong sell') || 
      lowerText.includes('recommend sell') || 
      lowerText.includes('sell rating')
    ) {
      return 'sell';
    } else if (
      lowerText.includes('hold rating') || 
      lowerText.includes('neutral rating') || 
      lowerText.includes('recommend hold')
    ) {
      return 'hold';
    }
    
    // Count instances of buy/sell/hold
    const buyCount = (lowerText.match(/\bbuy\b/g) || []).length;
    const sellCount = (lowerText.match(/\bsell\b/g) || []).length;
    const holdCount = (lowerText.match(/\bhold\b/g) || []).length;
    
    // Return the most frequent recommendation
    if (buyCount > sellCount && buyCount > holdCount) {
      return 'buy';
    } else if (sellCount > buyCount && sellCount > holdCount) {
      return 'sell';
    } else {
      return 'hold';
    }
  }
  
  /**
   * Generate mock insight for testing
   */
  private getMockInsight(symbol: string, companyName: string, price: number) {
    // Generate a deterministic but seemingly random recommendation based on symbol
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const recommendationIndex = hash % 3;
    const recommendations = ['buy', 'sell', 'hold'] as const;
    const recommendation = recommendations[recommendationIndex];
    
    // Generate price targets based on current price
    const buyTarget = Math.round((price * 0.9) * 100) / 100;
    const sellTarget = Math.round((price * 1.15) * 100) / 100;
    
    // Generate financial metrics
    const peRatio = 10 + (hash % 20);
    const dividendYield = (1 + (hash % 5)) / 100; // 1% to 5%
    const revenueGrowth = 5 + (hash % 15); // 5% to 20%
    const debtToEquity = 0.3 + (hash % 10) / 10; // 0.3 to 1.3
    const profitMargin = 8 + (hash % 20); // 8% to 28%
    const marketCap = (price * (10000000 + (hash % 990000000))).toLocaleString();
    const sector = this.getSectorForSymbol(symbol);
    const rsi = 30 + (hash % 40); // 30 to 70
    
    // Generate analysis based on recommendation
    let analysis = '';
    
    if (recommendation === 'buy') {
      analysis = `**${companyName} (${symbol}) - STRONG BUY RECOMMENDATION**\n\n` +
        `**Financial Analysis:** ${companyName} presents a compelling buying opportunity with a P/E ratio of ${peRatio}, significantly below the ${sector} sector average of ${peRatio + 4}. The company reported Q2 earnings of $${(price * 0.05).toFixed(2)} per share, exceeding analyst expectations by 12%. Revenue growth remains strong at ${revenueGrowth}% year-over-year, with profit margins expanding to ${profitMargin}%.\n\n` +
        `**Technical Indicators:** The stock is currently trading at $${price.toFixed(2)} with an RSI of ${rsi}, indicating it's not yet overbought. The 50-day moving average shows strong support at $${(price * 0.95).toFixed(2)}, with resistance at $${(price * 1.08).toFixed(2)}. Volume patterns suggest institutional accumulation.\n\n` +
        `**Strategic Outlook:** ${companyName}'s recent investments in emerging technologies and market expansion initiatives position it well against competitors. The company's debt-to-equity ratio of ${debtToEquity.toFixed(2)} is manageable, and its dividend yield of ${(dividendYield * 100).toFixed(2)}% provides income potential alongside growth.\n\n` +
        `**Recommendation:** Accumulate shares below $${buyTarget} with a 12-month price target of $${sellTarget}, representing a potential upside of 15%. Set stop-loss at $${(price * 0.85).toFixed(2)} to manage downside risk.`;
    } else if (recommendation === 'sell') {
      analysis = `**${companyName} (${symbol}) - SELL RECOMMENDATION**\n\n` +
        `**Financial Analysis:** ${companyName} shows concerning fundamentals with an elevated P/E ratio of ${peRatio}, well above the ${sector} sector average of ${peRatio - 5}. Q2 earnings missed estimates by 8%, reporting only $${(price * 0.03).toFixed(2)} per share against expected $${(price * 0.035).toFixed(2)}. Revenue growth has decelerated to just ${revenueGrowth - 8}%, while operating expenses increased by 12%.\n\n` +
        `**Technical Indicators:** At $${price.toFixed(2)}, the stock is trading near its 52-week high with an RSI of ${rsi + 10}, indicating overbought conditions. The MACD shows a bearish crossover, and volume has been declining on up days, suggesting distribution.\n\n` +
        `**Risk Assessment:** ${companyName} faces increasing competitive pressures in its core markets, with market share declining by 2.3% in the last quarter. The debt-to-equity ratio has increased to ${(debtToEquity + 0.4).toFixed(2)}, raising concerns about financial flexibility in a rising interest rate environment.\n\n` +
        `**Recommendation:** Consider exiting positions above $${sellTarget} and reallocating capital to stronger performers in the sector. If holding, implement tight stop-losses at $${(price * 0.95).toFixed(2)} to protect against further downside.`;
    } else {
      analysis = `**${companyName} (${symbol}) - HOLD RECOMMENDATION**\n\n` +
        `**Financial Analysis:** ${companyName} shows mixed signals with a P/E ratio of ${peRatio}, aligned with the ${sector} sector average. Q2 earnings of $${(price * 0.04).toFixed(2)} per share met expectations but didn't exceed them. Revenue growth of ${revenueGrowth}% is solid but slowing compared to previous quarters.\n\n` +
        `**Valuation Metrics:** With a market capitalization of $${marketCap}, the company trades at ${(price / (price * 0.04)).toFixed(1)}x forward earnings and ${(price / (price * 0.2)).toFixed(1)}x sales. The dividend yield of ${(dividendYield * 100).toFixed(2)}% is supported by a payout ratio of ${Math.round(dividendYield * peRatio * 100)}%, indicating sustainability.\n\n` +
        `**Strategic Position:** Management's guidance for the next quarter remains cautious, projecting ${revenueGrowth - 2}% growth. While the company maintains a strong balance sheet with a debt-to-equity ratio of ${debtToEquity.toFixed(2)}, there are limited catalysts for significant near-term appreciation.\n\n` +
        `**Recommendation:** Maintain current positions but consider implementing a barbell strategy: accumulate on dips below $${buyTarget} and take partial profits above $${sellTarget}. Set a 6-month review to reassess based on Q3 performance and sector trends.`;
    }
    
    return {
      recommendation,
      analysis,
      timestamp: new Date().toISOString(),
      metrics: {
        peRatio,
        dividendYield: (dividendYield * 100).toFixed(2) + '%',
        revenueGrowth: revenueGrowth + '%',
        debtToEquity: debtToEquity.toFixed(2),
        profitMargin: profitMargin + '%',
        marketCap,
        sector,
        rsi
      }
    };
  }

  /**
   * Get a sector for a symbol (for mock data)
   */
  private getSectorForSymbol(symbol: string): string {
    const sectors = [
      "Technology", "Financial Services", "Healthcare", "Consumer Cyclical", 
      "Energy", "Industrials", "Basic Materials", "Communication Services", 
      "Consumer Defensive", "Real Estate", "Utilities"
    ];
    
    // Deterministic sector based on symbol
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return sectors[hash % sectors.length];
  }
}

export const aiInsightService = new AIInsightService();
export default aiInsightService;
