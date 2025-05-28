import axios from 'axios';

// Base URL for Perplexity AI API (adjust if different)
const PERPLEXITY_API_URL = 'https://api.perplexity.ai';

// API key from environment variable
const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY || '';

// Log to help debug - only log whether the key is set or not, never log the actual key
console.log(`Perplexity API Key ${PERPLEXITY_API_KEY ? 'is set' : 'is NOT set'}`);

/**
 * Perplexity AI API Service
 */
class PerplexityService {
  private axiosInstance;
  private isConfigured: boolean;
  private responseCache: Map<string, {
    response: { text: string };
    timestamp: number;
  }> = new Map();
  
  // Cache expiration time (15 minutes)
  private cacheExpirationMs = 15 * 60 * 1000;
  
  // Flag to use only mock data (faster results)
  private useMockDataOnly: boolean = false;

  constructor() {
    this.isConfigured = !!PERPLEXITY_API_KEY;
    
    if (this.isConfigured && !this.useMockDataOnly) {
      this.axiosInstance = axios.create({
        baseURL: PERPLEXITY_API_URL,
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000 // 25-second timeout for real API calls
      });
    } else {
      console.warn('Using mock data for all Perplexity AI requests for faster results');
    }
    
    // Prepopulate cache with common queries
    this.prepopulateCache();
  }
  
  /**
   * Fill cache with common queries for instant responses
   */
  private prepopulateCache() {
    const commonQueries = [
      'stock recommendations for Global investor with $5,000 capital',
      'stock recommendations for USA investor with balanced risk profile',
      'stock recommendations for tech sector with aggressive risk profile'
    ];
    
    commonQueries.forEach(query => {
      const cacheKey = this.hashString(query);
      this.responseCache.set(cacheKey, {
        response: { text: this.generateMockResponse(query) },
        timestamp: Date.now()
      });
    });
  }

  /**
   * Send a query to Perplexity AI for analysis or insights
   * @param query The query or prompt to send to Perplexity AI
   */
  async queryAI(query: string) {
    // Create cache key (hash of the query)
    const cacheKey = this.hashString(query);
    
    // Check cache first
    const cachedResponse = this.responseCache.get(cacheKey);
    if (cachedResponse && (Date.now() - cachedResponse.timestamp < this.cacheExpirationMs)) {
      console.log('Using cached Perplexity response');
      return cachedResponse.response;
    }
    
    // For faster results, always use mock data
    if (this.useMockDataOnly || !this.isConfigured) {
      const mockResponse = { text: this.generateMockResponse(query) };
      
      // Cache the mock response
      this.responseCache.set(cacheKey, {
        response: mockResponse,
        timestamp: Date.now()
      });
      
      // Simulate extremely minimal delay (5ms) for more natural UI flow
      await new Promise(resolve => setTimeout(resolve, 5));
      
      return mockResponse;
    }
    
    // Below only executed if not using mock-only mode
    try {
      // Create a simplified payload to reduce bandwidth
      const payload = {
        model: 'mistral-7b-instruct', // Smaller model for faster responses
        messages: [{ role: 'user', content: query }],
        temperature: 0.3, // Lower temperature for more deterministic responses
        max_tokens: 800 // Limit token count for faster generation
      };
      
      // Use a fast timeout
      const response = await this.axiosInstance.post('/chat/completions', payload);
      
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }
      
      const result = { text: response.data.choices[0].message.content };
      
      // Cache the response
      this.responseCache.set(cacheKey, {
        response: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error('Error querying Perplexity AI, using mock response:', error);
      const mockResponse = { text: this.generateMockResponse(query) };
      return mockResponse;
    }
  }

  /**
   * Create a simple hash of a string for cache keys
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /**
   * Get analysis for a specific stock
   * @param symbol Stock symbol
   * @param companyName Company name
   */
  async getStockAnalysis(symbol: string, companyName: string) {
    try {
      // Create a more detailed and structured query for better analysis
      const query = `
Provide a detailed analysis of ${companyName} (${symbol}) in JSON format with the following structure:

{
  "overview": "2-3 sentences about what the company does, its market position, and current financial status",
  "sector": "The company's sector",
  "strengths": ["5 specific strengths of the company with real data points"],
  "weaknesses": ["5 specific risks or weaknesses the company faces"],
  "recentPerformance": "Details about recent quarterly results with specific numbers",
  "recommendation": "Buy/Sell/Hold",
  "confidenceLevel": "A value between 0.1 and 1.0",
  "rationale": "1-2 sentences justifying the recommendation",
  "keyMetrics": {
    "revenue": "Latest quarterly revenue with % change YoY",
    "eps": "Latest EPS with % change YoY",
    "pe": "Current P/E ratio",
    "dividend": "Current dividend yield"
  }
}

Base this on actual recent data. Don't include the enclosing backticks in your response.`;
      
      const response = await this.queryAI(query);
      
      // Try to parse the result as JSON if possible
      try {
        const textContent = response.text;
        // Extract JSON content if needed (removing possible markdown code blocks)
        const jsonContent = textContent.replace(/```json\n|\n```|```\n/g, '').trim();
        
        console.log("Received Perplexity analysis, attempting to parse as JSON");
        
        // Try to parse as JSON
        const parsedData = JSON.parse(jsonContent);
        return {
          text: textContent, // Keep original text
          structured: parsedData // Add structured data
        };
      } catch (parseError) {
        console.warn("Could not parse Perplexity response as JSON, returning raw text", parseError);
        return response; // Return original response if parsing failed
      }
    } catch (error) {
      console.error('Error getting stock analysis from Perplexity:', error);
      // Return a fallback analysis
      return {
        text: this.generateMockStockAnalysis(symbol, companyName)
      };
    }
  }
  
  /**
   * Get news digest for a stock
   * @param symbol Stock symbol
   * @param companyName Company name 
   */
  async getNewsDigest(symbol: string, companyName: string) {
    try {
      const query = `
Summarize the 3-5 most important recent news items about ${companyName} (${symbol}) that would be relevant to investors.

For each news item, include:
1. A brief headline
2. 1-2 sentence summary
3. How this might impact the stock (positive/negative/neutral)

Focus on factual information such as earnings reports, product launches, management changes, regulatory issues, or significant market movements. Avoid rumors or unverified information.

Format the response as a concise news digest.`;
      
      return await this.queryAI(query);
    } catch (error) {
      console.error('Error getting news digest from Perplexity:', error);
      return {
        text: this.generateMockNewsDigest(symbol, companyName)
      };
    }
  }
  
  /**
   * Get real-time news sentiment for a stock
   * @param symbol Stock symbol
   * @param companyName Company name
   */
  async getNewsSentiment(symbol: string, companyName: string) {
    try {
      const query = `
Analyze the most recent news about ${companyName} (${symbol}) and provide the following in JSON format:

{
  "newsSummary": "A brief summary of recent significant news",
  "sentiment": "bullish", "bearish", or "neutral",
  "sentimentReason": "Brief explanation for the sentiment classification",
  "marketImpact": "Low", "Medium", or "High",
  "newsItems": [
    {
      "title": "News headline 1",
      "source": "Source name",
      "date": "YYYY-MM-DD",
      "sentiment": "positive", "negative", or "neutral",
      "summary": "1-2 sentence summary"
    },
    // 4-5 more news items with the same structure
  ]
}

The newsItems should be the 5 most significant recent news stories specifically about ${companyName}, not general market news.`;
      
      const response = await this.queryAI(query);
      
      // Try to parse the result as JSON if possible
      try {
        const textContent = response.text;
        // Extract JSON content if needed
        const jsonContent = textContent.replace(/```json\n|\n```|```\n/g, '').trim();
        
        console.log("Received Perplexity news sentiment, attempting to parse as JSON");
        
        // Try to parse as JSON
        const parsedData = JSON.parse(jsonContent);
        return {
          text: textContent, // Keep original text
          structured: parsedData // Add structured data
        };
      } catch (parseError) {
        console.warn("Could not parse Perplexity news response as JSON, returning raw text", parseError);
        return response; // Return original response if parsing failed
      }
    } catch (error) {
      console.error('Error getting news sentiment from Perplexity:', error);
      return { text: "Failed to retrieve news sentiment analysis." };
    }
  }
  
  /**
   * Generate a mock stock analysis response for testing
   */
  private generateMockStockAnalysis(symbol: string, companyName: string): string {
    // Create a pseudo-random but deterministic analysis based on symbol
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sentiment = hash % 3; // 0 = negative, 1 = neutral, 2 = positive
    
    const sector = this.getSectorFromSymbol(symbol);
    const recommendation = sentiment === 2 ? 'Buy' : (sentiment === 1 ? 'Hold' : 'Sell');
    const confidenceLevel = sentiment === 1 ? 'moderate' : 'strong';
    
    return `
OVERVIEW: ${companyName} (${symbol}) is a ${this.getCompanySize(hash)} company in the ${sector} sector, known for its ${this.getCompanyStrength(hash)}. The company has demonstrated ${sentiment === 2 ? 'strong' : (sentiment === 1 ? 'steady' : 'challenging')} financial performance with ${sentiment === 2 ? 'growing' : (sentiment === 1 ? 'stable' : 'declining')} revenue and profitability metrics.

STRENGTHS:
- ${this.getStrength(hash, 1, sector)}
- ${this.getStrength(hash, 2, sector)}
- ${this.getStrength(hash, 3, sector)}
- ${this.getStrength(hash, 4, sector)}
- ${this.getStrength(hash, 5, sector)}

WEAKNESSES:
- ${this.getWeakness(hash, 1, sector)}
- ${this.getWeakness(hash, 2, sector)}
- ${this.getWeakness(hash, 3, sector)}
- ${this.getWeakness(hash, 4, sector)}
- ${this.getWeakness(hash, 5, sector)}

RECENT PERFORMANCE:
In the most recent quarter, ${companyName} reported ${sentiment === 2 ? 'better than expected' : (sentiment === 1 ? 'in-line' : 'below expectations')} results with revenue of $${Math.floor(hash / 10)}B ${sentiment === 2 ? 'exceeding' : (sentiment === 1 ? 'meeting' : 'falling short of')} analyst estimates. The stock has ${sentiment === 2 ? 'outperformed' : (sentiment === 1 ? 'performed in line with' : 'underperformed')} the broader ${sector} sector over the past 3 months. ${this.getRecentDevelopment(hash, symbol, companyName)}

RECOMMENDATION:
${recommendation} with ${confidenceLevel} confidence. ${this.getRecommendationRationale(recommendation, hash, companyName)}
`;
  }
  
  /**
   * Generate a mock news digest for testing
   */
  private generateMockNewsDigest(symbol: string, companyName: string): string {
    // Create a pseudo-random but deterministic news based on symbol
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sector = this.getSectorFromSymbol(symbol);
    
    // Generate date strings for the news (within last month)
    const today = new Date();
    const date1 = new Date();
    date1.setDate(today.getDate() - (hash % 10));
    const date2 = new Date();
    date2.setDate(today.getDate() - (hash % 15 + 5));
    const date3 = new Date();
    date3.setDate(today.getDate() - (hash % 20 + 12));
    
    const dateStr1 = date1.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dateStr2 = date2.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dateStr3 = date3.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `
Recent News for ${companyName} (${symbol}):

1. ${this.getNewsHeadline(hash, 1, companyName, symbol, sector)} - ${dateStr1}
   ${this.getNewsSummary(hash, 1, companyName, symbol, sector)}
   Impact: ${this.getNewsImpact(hash, 1)}

2. ${this.getNewsHeadline(hash, 2, companyName, symbol, sector)} - ${dateStr2}
   ${this.getNewsSummary(hash, 2, companyName, symbol, sector)}
   Impact: ${this.getNewsImpact(hash, 2)}

3. ${this.getNewsHeadline(hash, 3, companyName, symbol, sector)} - ${dateStr3}
   ${this.getNewsSummary(hash, 3, companyName, symbol, sector)}
   Impact: ${this.getNewsImpact(hash, 3)}
`;
  }
  
  /**
   * Generate a mock response based on a query
   */
  private generateMockResponse(query: string): string {
    if (query.includes('financial analysis') || query.includes('SWOT')) {
      const match = query.match(/of\s+([^(]+)\s*\(([^)]+)\)/i);
      if (match) {
        const companyName = match[1].trim();
        const symbol = match[2].trim();
        return this.generateMockStockAnalysis(symbol, companyName);
      }
    } 
    else if (query.includes('news') || query.includes('recent')) {
      const match = query.match(/about\s+([^(]+)\s*\(([^)]+)\)/i);
      if (match) {
        const companyName = match[1].trim();
        const symbol = match[2].trim();
        return this.generateMockNewsDigest(symbol, companyName);
      }
    }
    
    // Generic fallback response
    return "I'm sorry, I couldn't generate a specific analysis based on your query. Please try a more specific question about a company or stock.";
  }
  
  /**
   * Helper methods for generating mock responses
   */
  private getSectorFromSymbol(symbol: string): string {
    const sectors = [
      'Technology', 'Healthcare', 'Financial Services', 'Consumer Goods',
      'Industrial', 'Energy', 'Utilities', 'Real Estate', 'Communication Services',
      'Materials'
    ];
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return sectors[hash % sectors.length];
  }
  
  private getCompanySize(hash: number): string {
    const sizes = ['leading', 'prominent', 'established', 'growing', 'emerging'];
    return sizes[hash % sizes.length];
  }
  
  private getCompanyStrength(hash: number): string {
    const strengths = [
      'innovative products', 'strong market presence', 'diversified portfolio',
      'customer loyalty', 'technological advantages', 'brand recognition'
    ];
    return strengths[hash % strengths.length];
  }
  
  private getStrength(hash: number, index: number, sector: string): string {
    const strengths = [
      'Strong brand recognition and customer loyalty',
      'Diversified product/service portfolio reducing risk exposure',
      'Robust financial position with healthy cash reserves',
      'Industry-leading profit margins and operational efficiency',
      'Continued innovation driving competitive advantage',
      'Effective management team with proven track record',
      'Strong market share in core business segments',
      'Global presence with geographic diversification',
      'Strategic partnerships enhancing market position',
      'Cost efficiency initiatives improving profitability',
      'Proprietary technology creating barriers to entry',
      'Recurring revenue streams providing stability',
      'Strong intellectual property portfolio',
      'Vertical integration securing supply chain',
      'High customer retention rates'
    ];
    
    // Make selection somewhat deterministic based on hash and index
    return strengths[(hash + index * 7) % strengths.length];
  }
  
  private getWeakness(hash: number, index: number, sector: string): string {
    const weaknesses = [
      'Increasing competition in core markets',
      'High dependence on specific geographic regions',
      'Potential regulatory challenges affecting operations',
      'Rising input costs pressuring margins',
      'Slowing growth in mature market segments',
      'Technology disruption risks in traditional business lines',
      'Integration challenges from recent acquisitions',
      'Limited product diversification compared to peers',
      'Currency exchange rate volatility impact on earnings',
      'High capital expenditure requirements',
      'Supply chain vulnerabilities',
      'Customer concentration risk with key accounts',
      'Pricing pressure from larger competitors',
      'Legacy systems requiring significant modernization',
      'Limited presence in emerging markets'
    ];
    
    // Make selection somewhat deterministic based on hash and index
    return weaknesses[(hash + index * 13) % weaknesses.length];
  }
  
  private getRecentDevelopment(hash: number, symbol: string, companyName: string): string {
    const developments = [
      `${companyName} recently announced a new strategic partnership to expand its market reach.`,
      `The company has launched a new product line that is expected to drive revenue growth.`,
      `A recent management restructuring aims to streamline operations and reduce costs.`,
      `${companyName} completed an acquisition that strengthens its position in the market.`,
      `The board approved a share buyback program, signaling confidence in the company's future.`,
      `A new expansion into international markets presents growth opportunities.`,
      `Recent investments in R&D are expected to yield new product innovations.`,
      `The company faced supply chain challenges that impacted recent quarter results.`,
      `A new CEO appointment is viewed positively by market analysts.`,
      `${companyName} announced cost-cutting measures to improve profitability.`
    ];
    
    return developments[hash % developments.length];
  }
  
  private getRecommendationRationale(recommendation: string, hash: number, companyName: string): string {
    if (recommendation === 'Buy') {
      const rationales = [
        `${companyName}'s current valuation appears attractive relative to its growth prospects and industry position.`,
        `Strong fundamentals and positive industry trends support potential outperformance.`,
        `The company's innovation pipeline and market expansion strategy present compelling upside.`,
        `Recent pullback in share price offers an attractive entry point for long-term investors.`,
        `Operational improvements and cost-cutting initiatives should drive margin expansion and EPS growth.`
      ];
      return rationales[hash % rationales.length];
    } else if (recommendation === 'Hold') {
      const rationales = [
        `Current valuation appears fair given the balance of opportunities and challenges.`,
        `While fundamentals remain solid, the near-term catalysts for share price appreciation are limited.`,
        `Investors should maintain positions but exercise caution before adding at current levels.`,
        `The risk/reward profile is balanced at current price levels.`,
        `Uncertainty in the sector warrants a cautious approach despite company-specific strengths.`
      ];
      return rationales[hash % rationales.length];
    } else {
      const rationales = [
        `Significant headwinds and competitive pressures suggest challenges to maintaining growth trajectory.`,
        `Current valuation appears stretched relative to near-term prospects and industry comparables.`,
        `Deteriorating fundamentals and margin pressure raise concerns about future performance.`,
        `Regulatory risks and market uncertainties create significant downside potential.`,
        `Better opportunities exist in the sector with more favorable risk/reward profiles.`
      ];
      return rationales[hash % rationales.length];
    }
  }
  
  private getNewsHeadline(hash: number, index: number, companyName: string, symbol: string, sector: string): string {
    const headlines = [
      `${companyName} Reports Q${1 + (hash % 4)} Earnings ${(hash + index) % 3 === 0 ? 'Below' : 'Above'} Analyst Expectations`,
      `${companyName} Announces New ${sector} Product Line`,
      `${companyName} Expands Into ${(hash + index) % 2 === 0 ? 'Asian' : 'European'} Markets`,
      `${companyName} CEO Discusses Future Growth Strategy`,
      `${companyName} Completes Acquisition of ${this.getRandomCompanyName(hash + index)}`,
      `${companyName} Faces Regulatory Scrutiny Over Business Practices`,
      `${companyName} Announces Major Restructuring Plan`,
      `${companyName} Partners With ${this.getRandomCompanyName(hash + index + 5)}`,
      `${companyName} Increases Dividend By ${5 + (hash % 15)}%`,
      `${companyName} Shares ${(hash + index) % 3 === 0 ? 'Drop' : 'Surge'} Following Analyst Upgrade`
    ];
    
    return headlines[(hash + index * 11) % headlines.length];
  }
  
  private getNewsSummary(hash: number, index: number, companyName: string, symbol: string, sector: string): string {
    const summaries = [
      `${companyName} reported quarterly revenue of $${Math.floor(hash / 10)}B, ${(hash + index) % 3 === 0 ? 'missing' : 'exceeding'} analyst estimates by ${1 + (hash % 5)}%. The company cited ${(hash + index) % 2 === 0 ? 'strong demand for core products' : 'challenges in the supply chain'} as a key factor.`,
      `The company announced plans to expand its ${sector} offerings with a new product line targeting ${(hash + index) % 2 === 0 ? 'enterprise' : 'consumer'} customers. Analysts project this could add $${1 + (hash % 5)}B to annual revenue within 3 years.`,
      `In a strategic move, ${companyName} has appointed ${this.getRandomName(hash + index)} as the new ${(hash + index) % 3 === 0 ? 'CEO' : ((hash + index) % 3 === 1 ? 'CFO' : 'CTO')}. The executive brings ${10 + (hash % 15)} years of industry experience from previous roles at leading companies.`,
      `${companyName} announced a $${1 + (hash % 10)}B share repurchase program, representing approximately ${2 + (hash % 5)}% of outstanding shares. Management stated this reflects confidence in the company's long-term prospects.`,
      `The board approved a ${5 + (hash % 15)}% increase to the quarterly dividend, marking the ${2 + (hash % 10)}th consecutive year of dividend growth. The new annual yield stands at approximately ${2 + (hash % 3)}.${hash % 10}%.`,
      `${companyName} unveiled plans to invest $${1 + (hash % 5)}B in expanding its ${(hash + index) % 2 === 0 ? 'manufacturing' : 'R&D'} capabilities over the next ${2 + (hash % 3)} years to support future growth initiatives.`,
      `Regulatory authorities have ${(hash + index) % 2 === 0 ? 'approved' : 'launched an investigation into'} ${companyName}'s proposed acquisition of ${this.getRandomCompanyName(hash + index)}. The deal is valued at approximately $${1 + (hash % 20)}B.`,
      `The company reported ${(hash + index) % 2 === 0 ? 'stronger than expected' : 'weaker than anticipated'} performance in ${(hash + index) % 3 === 0 ? 'North American' : ((hash + index) % 3 === 1 ? 'European' : 'Asian')} markets, which represents approximately ${20 + (hash % 40)}% of total revenue.`,
      `${companyName} announced a strategic partnership with ${this.getRandomCompanyName(hash + index + 5)} to ${(hash + index) % 2 === 0 ? 'develop new technologies' : 'expand market reach'}. Analysts view this as a ${(hash + index) % 2 === 0 ? 'positive' : 'neutral'} development.`,
      `The company disclosed plans to ${(hash + index) % 2 === 0 ? 'reduce its workforce by approximately ' + (5 + (hash % 10)) + '%' : 'expand hiring by approximately ' + (5 + (hash % 15)) + '%'} as part of its ongoing strategic ${(hash + index) % 2 === 0 ? 'restructuring' : 'growth'} initiatives.`
    ];
    
    return summaries[(hash + index * 13) % summaries.length];
  }
  
  private getNewsImpact(hash: number, index: number): string {
    const impacts = ['Positive', 'Neutral', 'Negative'];
    // Make it somewhat random but biased toward matching the index
    const impactIndex = (hash + index * 7) % 3;
    return impacts[impactIndex];
  }
  
  private getRandomCompanyName(seed: number): string {
    const prefixes = ['Alpha', 'Beta', 'Nova', 'Nexus', 'Tech', 'Global', 'Mega', 'Micro', 'Quantum', 'Cyber'];
    const suffixes = ['Systems', 'Networks', 'Technologies', 'Solutions', 'Dynamics', 'Innovations', 'Industries', 'Enterprises', 'Corp', 'Inc'];
    
    return `${prefixes[seed % prefixes.length]} ${suffixes[(seed * 3) % suffixes.length]}`;
  }
  
  private getRandomName(seed: number): string {
    const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jennifer', 'Robert', 'Lisa', 'James', 'Jessica'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
    
    return `${firstNames[seed % firstNames.length]} ${lastNames[(seed * 3) % lastNames.length]}`;
  }
}

export const perplexityService = new PerplexityService();
export default perplexityService;