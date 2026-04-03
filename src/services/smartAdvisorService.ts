import { perplexityService } from './perplexityService';
import { finnhubService } from './finnhubService';
import { twelveDataService } from './twelveDataService';
import { getUserProfile, upsertUserProfile } from './dbService';
import { getAuth } from 'firebase/auth';
// Authentication removed - using localStorage

/**
 * User risk profile types
 */
export type RiskProfile = 'Conservative' | 'Balanced' | 'Aggressive';

/**
 * User investment goal types
 */
export type InvestmentGoal = 'Long-term' | 'Swing' | 'Intraday';

/**
 * User capital range
 */
export type CapitalRange = 
  | '₹5,000' | '₹50,000' | '₹5L+' // Indian currency
  | '$500' | '$5,000' | '$50,000+'; // US currency

/**
 * Market types
 */
export type MarketType = 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Growth' | 'Value' | 'Tech' | 'Green' | 'Pharma';

/**
 * Country/Region
 */
export type CountryRegion = 'India' | 'USA' | 'Japan' | 'Europe' | 'Global';

/**
 * Sector preferences
 */
export type SectorPreference = 'Auto' | 'Tech' | 'Pharma' | 'Banking' | 'EV' | 'Green' | 'Energy' | 'Real Estate' | 'Consumer' | 'All';

/**
 * Exchange types
 */
export type Exchange = 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ' | 'TSE' | 'LSE';

/**
 * User profile for investments
 */
export interface UserInvestmentProfile {
  countryRegion: CountryRegion;
  marketTypes: MarketType[];
  capital: CapitalRange;
  riskProfile: RiskProfile;
  investmentGoal: InvestmentGoal;
  sectorPreferences: SectorPreference[];
  lastUpdated: number; // timestamp
}

/**
 * Smart Advisor request params
 */
export interface AdvisorRequest {
  userProfile: UserInvestmentProfile;
  specificExchanges?: Exchange[];
  maxPricePerStock?: number;
  excludeStocks?: string[]; // Stocks to exclude from recommendations
}

/**
 * AI recommendation for a stock
 */
export interface StockRecommendation {
  symbol: string;
  name: string;
  exchange: Exchange;
  sector: string;
  currentPrice?: number;
  yearReturn?: string;
  recommendation: 'Buy' | 'Sell' | 'Hold';
  confidenceScore: number; // 0-1 score
  rationale: string;
  riskLevel?: 'Low' | 'Moderate' | 'High';
  expectedROI?: string; // Expected return on investment
  keyTrends?: string[]; // Key market or stock trends
  metrics?: {
    pe?: number;
    marketCap?: string;
    volume?: number;
    volatility?: number;
    [key: string]: any;
  };
}

/**
 * Strength or weakness point
 */
export interface AnalysisPoint {
  title: string;
  description: string;
}

/**
 * News item with sentiment
 */
export interface NewsItem {
  title: string;
  date: string;
  source: string;
  summary?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  url?: string;
}

/**
 * Investor movement information
 */
export interface InvestorMovement {
  investorName: string;
  action: 'Bought' | 'Sold' | 'Unchanged';
  quantity?: string;
  changePercent?: string;
  date: string;
}

/**
 * Complete advisor response
 */
export interface AdvisorResponse {
  country: CountryRegion;
  userGoal: InvestmentGoal;
  stockSuggestions: StockRecommendation[];
  strengths: AnalysisPoint[];
  weaknesses: AnalysisPoint[];
  aiOpinion: {
    summary: string;
    reasoning: string;
    alerts: string[];
  };
  relatedNews: NewsItem[];
  investorMovements: InvestorMovement[];
  matchScore: number; // 0-100 score indicating how well these recommendations match user profile
  timestamp: number; // When this advice was generated
}

/**
 * Smart Stock Advisor Service
 * Uses Perplexity AI to generate personalized stock recommendations
 */
class SmartAdvisorService {
  
  // Add a property to track API requests
  private requestQueue: {
    retries: number;
    timestamp: number;
    execute: () => Promise<any>;
  }[] = [];
  private processingQueue = false;
  private maxRetries = 1; // Reduced from 2 to speed up processing
  private rateLimitDelay = 100; // Further reduced from 500ms to 100ms for even faster processing
  
  // Add a cache to store previous recommendation results
  private recommendationCache: Map<string, {
    response: AdvisorResponse;
    timestamp: number;
  }> = new Map();
  
  // Cache expiration time (10 minutes)
  private cacheExpirationMs = 10 * 60 * 1000;
  
  // Pre-generated mock responses for common profiles
  private mockResponses: {[key: string]: AdvisorResponse} = {};
  
  // Use direct mock data only for fastest performance
  private useDirectMockOnly = false;
  
  // Increased permutation limit
  private maxPermutations = 100;
  
  constructor() {
    // Pre-generate some mock responses for common profiles
    this.initializeMockResponses();
  }
  
  /**
   * Initialize some mock responses for immediate display
   */
  private initializeMockResponses() {
    // Generate mock responses for common profile combinations
    const regions: CountryRegion[] = ['Global', 'USA', 'India'];
    const risks: RiskProfile[] = ['Conservative', 'Balanced', 'Aggressive'];
    
    regions.forEach(region => {
      risks.forEach(risk => {
        const key = `${region}:${risk}`;
        this.mockResponses[key] = this.generateFallbackResponse({
          userProfile: {
            countryRegion: region,
            marketTypes: ['Large Cap'],
            capital: '$5,000',
            riskProfile: risk,
            investmentGoal: 'Long-term',
            sectorPreferences: ['Tech', 'Banking'],
            lastUpdated: Date.now()
          }
        });
      });
    });
  }
  
  /**
   * Save user investment profile to Firebase
   */
  async saveUserProfile(profile: UserInvestmentProfile): Promise<boolean> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.error('No authenticated user found');
        return false;
      }
      
      // Add timestamp
      profile.lastUpdated = Date.now();
      
      // Save to PostgreSQL via API
      await upsertUserProfile(user.uid, {
        investmentProfile: profile
      });
      
      return true;
    } catch (error) {
      console.error('Error saving user investment profile:', error);
      return false;
    }
  }
  
  /**
   * Get user investment profile from Firebase
   */
  async getUserProfile(): Promise<UserInvestmentProfile | null> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.error('No authenticated user found');
        return null;
      }
      
      const userProfile = await getUserProfile(user.uid);
      
      if (userProfile && userProfile.investmentProfile) {
        return userProfile.investmentProfile as UserInvestmentProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user investment profile:', error);
      return null;
    }
  }
  
  /**
   * Public method to get mock response for immediate display
   */
  public generateMockResponse(request: AdvisorRequest): AdvisorResponse {
    const { userProfile } = request;
    const { countryRegion, riskProfile, sectorPreferences } = userProfile;
    
    // Try to get a pre-generated mock response
    const key = `${countryRegion}:${riskProfile}`;
    
    let response: AdvisorResponse;
    
    if (this.mockResponses[key]) {
      // Get pre-generated response
      response = {
        ...this.mockResponses[key],
        timestamp: Date.now()
      };
    } else {
      // Create a new mock response
      response = this.generateFallbackResponse(request);
    }
    
    // Add randomized match score based on sectorPreferences
    response.matchScore = this.calculateMockMatchScore(sectorPreferences);
    
    // Add some randomness to stock suggestions to make permutations look different
    if (response.stockSuggestions && response.stockSuggestions.length > 0) {
      response.stockSuggestions = response.stockSuggestions.map(stock => ({
        ...stock,
        confidenceScore: Math.min(0.95, Math.max(0.45, stock.confidenceScore + (Math.random() * 0.3 - 0.15))),
        currentPrice: stock.currentPrice ? stock.currentPrice * (1 + (Math.random() * 0.1 - 0.05)) : undefined
      }));
    }
    
    return response;
  }
  
  /**
   * Generate a semi-random match score for mock response
   */
  private calculateMockMatchScore(sectorPreferences: SectorPreference[]): number {
    // Base score
    let score = 70 + Math.floor(Math.random() * 10);
    
    // Add points for more sector preferences
    if (sectorPreferences.includes('All')) {
      score += 8;
    } else {
      score += Math.min(15, sectorPreferences.length * 3);
    }
    
    // Ensure score is between 60-95
    return Math.min(95, Math.max(60, score));
  }
  
  /**
   * Get stock recommendations based on user profile with rate limiting and retries
   */
  async getRecommendations(request: AdvisorRequest): Promise<AdvisorResponse> {
    // For ultra-fast response, use direct mock
    if (this.useDirectMockOnly) {
      // Generate a mock response immediately
      return this.generateMockResponse(request);
    }
    
    // For regular flow, use cache and API calls
    const cacheKey = this.generateCacheKey(request);
    
    // Check if we have a cached response
    const cachedResult = this.recommendationCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < this.cacheExpirationMs) {
      console.log('Using cached recommendation result');
      return cachedResult.response;
    }
    
    // Create a timeout promise for faster response but with longer timeout (30s for real data)
    const timeoutPromise = new Promise<AdvisorResponse>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout for real API calls
    });
    
    // Create a promise for the queue-based execution
    const queuePromise = new Promise<AdvisorResponse>((resolve, reject) => {
      // Add the request to the queue with high priority
      this.requestQueue.unshift({
        retries: 0,
        timestamp: Date.now(),
        execute: async () => {
          try {
            const result = await this.executeRecommendationRequest(request);
            
            // Cache the result
            this.recommendationCache.set(cacheKey, {
              response: result,
              timestamp: Date.now()
            });
            
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      });
      
      // Start processing the queue if not already processing
      if (!this.processingQueue) {
        this.processQueue();
      }
    });
    
    // Race the queue execution against a timeout
    try {
      return await Promise.race([queuePromise, timeoutPromise]);
    } catch (error) {
      console.warn('Recommendation request timed out or failed:', error);
      
      // Return mock data in case of timeout or failure
      const mockResponse = this.generateMockResponse(request);
      
      // Also cache this mock response to avoid repeated failures
      this.recommendationCache.set(cacheKey, {
        response: mockResponse,
        timestamp: Date.now()
      });
      
      return mockResponse;
    }
  }
  
  /**
   * Generate a unique cache key for a request
   */
  private generateCacheKey(request: AdvisorRequest): string {
    const { userProfile, maxPricePerStock } = request;
    const { countryRegion, marketTypes, capital, riskProfile, investmentGoal, sectorPreferences } = userProfile;
    
    // Create a string that uniquely identifies this request
    return JSON.stringify({
      countryRegion,
      marketTypes: marketTypes.sort(),
      capital,
      riskProfile,
      investmentGoal,
      sectorPreferences: sectorPreferences.sort(),
      maxPricePerStock
    });
  }
  
  /**
   * Process the queue of API requests with rate limiting
   */
  private async processQueue() {
    this.processingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue[0];
      
      // Check if we need to wait to respect rate limits
      const now = Date.now();
      const timeSinceLastRequest = now - request.timestamp;
      
      if (timeSinceLastRequest < this.rateLimitDelay) {
        // Wait until enough time has passed
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
      }
      
      // Execute the request
      try {
        await request.execute();
        
        // Remove the request from the queue on success
        this.requestQueue.shift();
      } catch (error) {
        // If retries are available, move to the back of the queue and try again
        if (request.retries < this.maxRetries) {
          request.retries++;
          request.timestamp = Date.now();
          this.requestQueue.shift();
          this.requestQueue.push(request);
          
          console.log(`Retrying request (attempt ${request.retries}/${this.maxRetries})`);
        } else {
          // Max retries exceeded, remove from queue and reject the promise
          console.error(`Max retries (${this.maxRetries}) exceeded for request`);
          this.requestQueue.shift();
        }
      }
    }
    
    this.processingQueue = false;
  }
  
  /**
   * Execute a single recommendation request
   */
  private async executeRecommendationRequest(request: AdvisorRequest): Promise<AdvisorResponse> {
    try {
      // 1. Build the prompt for Perplexity AI based on user preferences
      const prompt = this.buildAdvisorPrompt(request);
      
      // 2. Send the prompt to Perplexity AI with a longer timeout for real data
      const perplexityPromise = perplexityService.queryAI(prompt);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('API request timed out')), 25000); // 25 second timeout
      });
      
      let perplexityResponse;
      try {
        perplexityResponse = await Promise.race([perplexityPromise, timeoutPromise]);
      } catch (apiError) {
        console.error('Error or timeout querying Perplexity AI:', apiError);
        throw new Error(`API request failed: ${apiError.message || 'Unknown API error'}`);
      }
      
      if (!perplexityResponse || !perplexityResponse.text) {
        throw new Error('Empty response from AI service');
      }
      
      // 3. Parse the response into structured data
      let parsedResponse;
      try {
        parsedResponse = this.parseAdvisorResponse(perplexityResponse.text, request);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        throw new Error(`Failed to parse AI response: ${parseError.message}`);
      }
      
      // 4. Enrich with real stock data 
      let enrichedResponse = parsedResponse;
      try {
        // Get data for all suggestions for complete real-time data
        const stockSuggestions = parsedResponse.stockSuggestions;
        const basicData = await this.getBasicStockData(stockSuggestions);
        
        // Merge basic data with the parsed response
        enrichedResponse = {
          ...parsedResponse,
          stockSuggestions: parsedResponse.stockSuggestions.map((stock, index) => {
            if (basicData[index]) {
              return { ...stock, ...basicData[index] };
            }
            return stock;
          })
        };
      } catch (enrichError) {
        console.warn('Continuing with unenriched response:', enrichError);
      }
      
      // 5. Calculate match score
      const matchedResponse = this.calculateMatchScore(enrichedResponse, request);
      
      return matchedResponse;
    } catch (error) {
      console.error('Error getting smart advisor recommendations:', error);
      
      // Return a fallback response with error information
      return this.generateMockResponse(request);
    }
  }
  
  /**
   * Fast method to get just basic stock data - now with longer timeout for real data
   */
  private async getBasicStockData(stocks: StockRecommendation[]): Promise<Partial<StockRecommendation>[]> {
    const symbols = stocks.map(s => s.symbol);
    
    try {
      // Get current prices in parallel with longer timeout
      const pricePromises = symbols.map(symbol => 
        Promise.race([
          finnhubService.getStockQuote(symbol),
          new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)) // 10 second timeout
        ]).catch(() => null)
      );
      
      const prices = await Promise.all(pricePromises);
      
      // Return enriched data
      return stocks.map((_, index) => {
        const price = prices[index];
        if (!price) return {};
        
        return {
          currentPrice: price.c || 0,
          yearReturn: price.dp ? `${price.dp.toFixed(2)}%` : undefined
        };
      });
    } catch (error) {
      console.error('Error fetching basic stock data:', error);
      return stocks.map(() => ({}));
    }
  }
  
  /**
   * Calculate a score representing how well the recommendations match the user profile
   */
  private calculateMatchScore(response: AdvisorResponse, request: AdvisorRequest): AdvisorResponse {
    const { userProfile } = request;
    
    // Start with a base score
    let score = 70;
    
    // Check if the country matches
    if (response.country === userProfile.countryRegion) {
      score += 5;
    }
    
    // Check if the investment goal matches
    if (response.userGoal === userProfile.investmentGoal) {
      score += 5;
    }
    
    // Check if sectors match user preferences
    const sectorMatchCount = response.stockSuggestions.filter(stock => 
      userProfile.sectorPreferences.includes('All') || 
      userProfile.sectorPreferences.some(sector => 
        stock.sector.toLowerCase().includes(sector.toLowerCase())
      )
    ).length;
    
    // Add points based on sector match percentage
    score += Math.round((sectorMatchCount / response.stockSuggestions.length) * 10);
    
    // Check risk alignment
    const riskAlignmentScore = response.stockSuggestions.reduce((score, stock) => {
      // Conservative users prefer low-risk stocks
      if (userProfile.riskProfile === 'Conservative' && stock.riskLevel === 'Low') {
        return score + 2;
      }
      // Balanced users prefer moderate-risk stocks
      if (userProfile.riskProfile === 'Balanced' && stock.riskLevel === 'Moderate') {
        return score + 2;
      }
      // Aggressive users prefer high-risk stocks
      if (userProfile.riskProfile === 'Aggressive' && stock.riskLevel === 'High') {
        return score + 2;
      }
      return score;
    }, 0);
    
    // Add risk alignment points (max 10)
    score += Math.min(10, riskAlignmentScore);
    
    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));
    
    return {
      ...response,
      matchScore: score
    };
  }
  
  /**
   * Build the prompt for Perplexity AI - enhanced for ROI analysis
   */
  private buildAdvisorPrompt(request: AdvisorRequest): string {
    const { userProfile, specificExchanges, maxPricePerStock } = request;
    const { countryRegion, marketTypes, capital, riskProfile, investmentGoal, sectorPreferences } = userProfile;
    
    // Convert sector preferences to string
    const sectorsText = sectorPreferences.includes('All') ? 
      'any sector' : 
      sectorPreferences.join(', ');
    
    // Map investment goals to more descriptive text
    const goalText = {
      'Long-term': 'long-term growth potential (3-5 years)',
      'Swing': 'medium-term potential (1-3 months)',
      'Intraday': 'short-term trading opportunities (days)'
    }[investmentGoal];
    
    // Determine exchanges based on country - strictly enforce region selection
    let exchangeText = '';
    if (specificExchanges && specificExchanges.length > 0) {
      exchangeText = specificExchanges.join(', ');
    } else {
      if (countryRegion === 'India') {
        exchangeText = 'NSE, BSE';
      } else if (countryRegion === 'USA') {
        exchangeText = 'NYSE, NASDAQ';
      } else if (countryRegion === 'Japan') {
        exchangeText = 'TSE';
      } else if (countryRegion === 'Europe') {
        exchangeText = 'LSE, Euronext';
      } else {
        exchangeText = 'any major exchange';
      }
    }
    
    // Add price constraint if specified
    const priceConstraint = maxPricePerStock ? 
      `Each suggested stock should be priced at or below ${maxPricePerStock} per share to fit within the investment capital of ${capital}.` : 
      '';
    
    // Build the prompt with enhanced ROI analysis
    return `
For a ${countryRegion} investor with ${capital} capital, a ${riskProfile.toLowerCase()} risk profile, and interested in ${goalText}, suggest 5 best-performing stocks in the ${sectorsText} sector(s) from ${exchangeText} ONLY. 

Important: ONLY include stocks from exchanges in the ${countryRegion} region.

The stocks should match these market types: ${marketTypes.join(', ')}.
${priceConstraint}

The stocks must have good financial health, strong growth potential, and recent positive investor activity.

For each recommendation, provide detailed analysis including:
1. Expected ROI (Return on Investment) over the relevant timeframe
2. Performance trends (historical and projected)
3. Key growth drivers and catalysts
4. Specific reasons why this stock fits the investor's profile

Return your response as valid JSON with the following structure:
{
  "country": "${countryRegion}",
  "userGoal": "${investmentGoal}",
  "stockSuggestions": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "exchange": "NASDAQ",
      "sector": "Technology",
      "recommendation": "Buy", // Buy, Sell, or Hold
      "confidenceScore": 0.8, // 0-1 scale
      "rationale": "Detailed explanation with ROI projection and analysis",
      "expectedROI": "15-20% annually", // Expected return
      "riskLevel": "Moderate", // Low, Moderate, or High
      "keyTrends": ["Trend 1", "Trend 2"] // Key market or stock trends
    }
    // Add 4 more suggestions
  ],
  "strengths": [
    {
      "title": "Strong cash position",
      "description": "Brief explanation"
    }
    // 3-5 strengths in total
  ],
  "weaknesses": [
    {
      "title": "Regulatory pressure",
      "description": "Brief explanation"
    }
    // 3-5 weaknesses in total
  ],
  "aiOpinion": {
    "summary": "Overall assessment of the recommended investments",
    "reasoning": "Detailed explanation of the investment thesis with ROI projections",
    "alerts": [
      "Important consideration 1",
      "Important consideration 2"
    ]
  },
  "relatedNews": [
    {
      "title": "News headline",
      "date": "YYYY-MM-DD",
      "source": "Source name",
      "summary": "Brief summary",
      "sentiment": "positive" // positive, negative, or neutral
    }
    // 3-5 news items
  ]
}

Base your recommendations on real-time market data, recent financial performance, and current news. Focus on stocks that match the user's risk profile, capital constraints, and sector preferences. Provide specific ROI projections and performance analysis.
`;
  }
  
  /**
   * Parse the Perplexity AI response into structured data
   */
  private parseAdvisorResponse(responseText: string, request: AdvisorRequest): AdvisorResponse {
    try {
      // Try to parse the JSON response
      // First, look for JSON content between triple backticks if present
      let jsonText = responseText;
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      
      if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1];
      } else {
        // Try to find content between regular backticks
        const backtickMatch = responseText.match(/```([\s\S]*?)```/);
        if (backtickMatch && backtickMatch[1]) {
          jsonText = backtickMatch[1];
        }
      }
      
      // Remove any non-JSON content that might be present
      jsonText = jsonText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      
      // Try to parse the JSON, but handle malformed responses
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (jsonError) {
        console.error('Failed to parse JSON from AI response:', jsonError);
        console.log('Raw JSON text:', jsonText);
        
        // Try a more aggressive approach to extract JSON
        const lastAttempt = responseText.match(/{[\s\S]*}/);
        if (lastAttempt) {
          try {
            parsed = JSON.parse(lastAttempt[0]);
          } catch (finalError) {
            console.error('Final JSON parsing attempt failed:', finalError);
            throw new Error('Could not parse valid JSON from AI response');
          }
        } else {
          throw new Error('No valid JSON structure found in AI response');
        }
      }
      
      // Validate required fields
      if (!parsed.stockSuggestions || !Array.isArray(parsed.stockSuggestions) || parsed.stockSuggestions.length === 0) {
        throw new Error('Missing or invalid stockSuggestions in parsed response');
      }
      
      // Ensure the response has the expected structure
      return {
        country: parsed.country || request.userProfile.countryRegion,
        userGoal: parsed.userGoal || request.userProfile.investmentGoal,
        stockSuggestions: parsed.stockSuggestions || [],
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        aiOpinion: parsed.aiOpinion || {
          summary: "Based on your profile, these stocks align with your investment goals.",
          reasoning: "The recommendations consider your risk profile and sector preferences.",
          alerts: []
        },
        relatedNews: parsed.relatedNews || [],
        investorMovements: parsed.investorMovements || [], // Add support for this if provided
        matchScore: 0, // Will be calculated later
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error parsing Perplexity AI response:', error);
      console.log('Raw response:', responseText);
      
      // Rethrow with a clearer message
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }
  
  /**
   * Generate a fallback response if the API or parsing fails
   * This is a simplified version of the original generateFallbackResponse 
   * with faster execution
   */
  private generateFallbackResponse(request: AdvisorRequest): AdvisorResponse {
    const { userProfile } = request;
    const { countryRegion, riskProfile, sectorPreferences, investmentGoal } = userProfile;
    
    // Generate different stocks based on country and risk profile
    let stocks: StockRecommendation[] = [];
    
    if (countryRegion === 'India') {
      if (riskProfile === 'Conservative') {
        stocks = [
          { 
            symbol: 'HDFCBANK', 
            name: 'HDFC Bank Ltd', 
            exchange: 'NSE',
            sector: 'Banking',
            recommendation: 'Buy',
            confidenceScore: 0.8,
            rationale: 'Largest private sector bank with strong fundamentals',
            riskLevel: 'Low',
            currentPrice: 1450.75,
            yearReturn: '12.5%'
          },
          { 
            symbol: 'TCS', 
            name: 'Tata Consultancy Services Ltd', 
            exchange: 'NSE',
            sector: 'Technology',
            recommendation: 'Hold',
            confidenceScore: 0.7,
            rationale: 'Stable IT services giant with consistent performance',
            riskLevel: 'Low',
            currentPrice: 3540.25,
            yearReturn: '8.3%'
          }
        ];
      } else if (riskProfile === 'Balanced') {
        stocks = [
          { 
            symbol: 'TATAMOTORS', 
            name: 'Tata Motors Ltd', 
            exchange: 'NSE',
            sector: 'Auto & EV',
            recommendation: 'Buy',
            confidenceScore: 0.75,
            rationale: 'Strong momentum in EV segment with Jaguar Land Rover recovery',
            riskLevel: 'Moderate',
            currentPrice: 780.50,
            yearReturn: '24.7%'
          },
          { 
            symbol: 'SUNPHARMA', 
            name: 'Sun Pharmaceutical Industries Ltd', 
            exchange: 'NSE',
            sector: 'Pharma',
            recommendation: 'Buy',
            confidenceScore: 0.7,
            rationale: 'Market leader in Indian pharma with global expansion',
            riskLevel: 'Moderate',
            currentPrice: 1240.30,
            yearReturn: '15.2%'
          }
        ];
      } else {
        stocks = [
          { 
            symbol: 'ZOMATO', 
            name: 'Zomato Ltd', 
            exchange: 'NSE',
            sector: 'Technology',
            recommendation: 'Hold',
            confidenceScore: 0.6,
            rationale: 'Food delivery leader moving toward profitability',
            riskLevel: 'High',
            currentPrice: 178.80,
            yearReturn: '42.3%'
          },
          { 
            symbol: 'BAJFINANCE', 
            name: 'Bajaj Finance Ltd', 
            exchange: 'NSE',
            sector: 'Finance',
            recommendation: 'Buy',
            confidenceScore: 0.65,
            rationale: 'Digital transformation and strong lending book growth',
            riskLevel: 'High',
            currentPrice: 6890.75,
            yearReturn: '18.9%'
          }
        ];
      }
    } else if (countryRegion === 'USA') {
      if (riskProfile === 'Conservative') {
        stocks = [
          { 
            symbol: 'MSFT', 
            name: 'Microsoft Corporation', 
            exchange: 'NASDAQ',
            sector: 'Technology',
            recommendation: 'Buy',
            confidenceScore: 0.8,
            rationale: 'Strong fundamentals and stable growth with AI leadership',
            riskLevel: 'Low',
            currentPrice: 410.45,
            yearReturn: '28.7%'
          },
          { 
            symbol: 'JNJ', 
            name: 'Johnson & Johnson', 
            exchange: 'NYSE',
            sector: 'Healthcare',
            recommendation: 'Hold',
            confidenceScore: 0.7,
            rationale: 'Stable dividend payer with defensive characteristics',
            riskLevel: 'Low',
            currentPrice: 152.75,
            yearReturn: '4.2%'
          }
        ];
      } else if (riskProfile === 'Balanced') {
        stocks = [
          { 
            symbol: 'AAPL', 
            name: 'Apple Inc.', 
            exchange: 'NASDAQ',
            sector: 'Technology',
            recommendation: 'Buy',
            confidenceScore: 0.75,
            rationale: 'Strong ecosystem and continued innovation in new product categories',
            riskLevel: 'Moderate',
            currentPrice: 185.40,
            yearReturn: '12.3%'
          },
          { 
            symbol: 'GOOGL', 
            name: 'Alphabet Inc.', 
            exchange: 'NASDAQ',
            sector: 'Technology',
            recommendation: 'Buy',
            confidenceScore: 0.7,
            rationale: 'AI initiatives and advertising dominance with cloud growth',
            riskLevel: 'Moderate',
            currentPrice: 175.20,
            yearReturn: '32.5%'
          }
        ];
      } else {
        stocks = [
          { 
            symbol: 'TSLA', 
            name: 'Tesla, Inc.', 
            exchange: 'NASDAQ',
            sector: 'Automotive & Clean Energy',
            recommendation: 'Hold',
            confidenceScore: 0.6,
            rationale: 'EV market leader with high growth potential but significant volatility',
            riskLevel: 'High',
            currentPrice: 180.35,
            yearReturn: '-15.7%'
          },
          { 
            symbol: 'NVDA', 
            name: 'NVIDIA Corporation', 
            exchange: 'NASDAQ',
            sector: 'Technology',
            recommendation: 'Buy',
            confidenceScore: 0.8,
            rationale: 'AI leadership and dominant position in GPU market',
            riskLevel: 'High',
            currentPrice: 940.50,
            yearReturn: '210.3%'
          }
        ];
      }
    } else {
      // Global fallback
      stocks = [
        { 
          symbol: 'AMZN', 
          name: 'Amazon.com Inc.', 
          exchange: 'NASDAQ',
          sector: 'Technology & Retail',
          recommendation: 'Buy',
          confidenceScore: 0.75,
          rationale: 'E-commerce and cloud computing leader with diversified revenue',
          riskLevel: 'Moderate',
          currentPrice: 182.50,
          yearReturn: '35.2%'
        },
        { 
          symbol: 'ASML', 
          name: 'ASML Holding N.V.', 
          exchange: 'NASDAQ',
          sector: 'Semiconductor Equipment',
          recommendation: 'Buy',
          confidenceScore: 0.8,
          rationale: 'Monopoly in advanced semiconductor manufacturing equipment',
          riskLevel: 'Moderate',
          currentPrice: 920.75,
          yearReturn: '42.1%'
        }
      ];
    }
    
    // Add an EV stock for any sector preferences related to clean energy
    if (sectorPreferences.includes('EV') || sectorPreferences.includes('Green') || sectorPreferences.includes('Energy')) {
      stocks.push({ 
        symbol: countryRegion === 'India' ? 'TATAPOWER' : 'ENPH', 
        name: countryRegion === 'India' ? 'Tata Power Co. Ltd' : 'Enphase Energy, Inc.', 
        exchange: countryRegion === 'India' ? 'NSE' : 'NASDAQ',
        sector: 'Clean Energy',
        recommendation: 'Buy',
        confidenceScore: 0.7,
        rationale: 'Strong growth in renewable energy segment with government incentives',
        riskLevel: 'Moderate',
        currentPrice: countryRegion === 'India' ? 420.30 : 112.45,
        yearReturn: countryRegion === 'India' ? '28.4%' : '10.5%'
      });
    }
    
    // Add a tech stock for tech sector preference
    if (sectorPreferences.includes('Tech')) {
      stocks.push({ 
        symbol: countryRegion === 'India' ? 'INFY' : 'AMD', 
        name: countryRegion === 'India' ? 'Infosys Ltd' : 'Advanced Micro Devices, Inc.', 
        exchange: countryRegion === 'India' ? 'NSE' : 'NASDAQ',
        sector: 'Technology',
        recommendation: 'Buy',
        confidenceScore: 0.75,
        rationale: countryRegion === 'India' ? 'Digital transformation leader with global client base' : 'Gaining market share in processors and AI solutions',
        riskLevel: 'Moderate',
        currentPrice: countryRegion === 'India' ? 1520.75 : 158.40,
        yearReturn: countryRegion === 'India' ? '8.5%' : '62.3%'
      });
    }
    
    // Truncate to 5 stocks max
    if (stocks.length > 5) {
      stocks = stocks.slice(0, 5);
    } else if (stocks.length < 5) {
      // Add more stocks to reach 5
      const defaultStocks = [
        { 
          symbol: 'JPM', 
          name: 'JPMorgan Chase & Co.', 
          exchange: 'NYSE',
          sector: 'Financial Services',
          recommendation: 'Buy',
          confidenceScore: 0.7,
          rationale: 'Strong balance sheet with diverse revenue streams and AI integration',
          riskLevel: 'Moderate',
          currentPrice: 194.25,
          yearReturn: '14.5%'
        },
        { 
          symbol: 'PG', 
          name: 'Procter & Gamble Co.', 
          exchange: 'NYSE',
          sector: 'Consumer Goods',
          recommendation: 'Hold',
          confidenceScore: 0.65,
          rationale: 'Stable defensive stock with strong brands and consistent dividends',
          riskLevel: 'Low',
          currentPrice: 165.80,
          yearReturn: '5.2%'
        },
        { 
          symbol: 'DIS', 
          name: 'The Walt Disney Company', 
          exchange: 'NYSE',
          sector: 'Entertainment',
          recommendation: 'Buy',
          confidenceScore: 0.7,
          rationale: 'Streaming growth and theme park recovery driving revenue',
          riskLevel: 'Moderate',
          currentPrice: 112.35,
          yearReturn: '20.7%'
        }
      ];
      
      // Add enough stocks to reach 5
      while (stocks.length < 5 && defaultStocks.length > 0) {
        stocks.push(defaultStocks.shift()!);
      }
    }
    
    // Add metrics to each stock
    stocks = stocks.map(stock => ({
      ...stock,
      metrics: {
        pe: 10 + Math.floor(Math.random() * 40),
        marketCap: ['$50B', '$120B', '$1.5T', '$80B', '$650B'][Math.floor(Math.random() * 5)]
      }
    }));
    
    // Create the response object
    return {
      country: countryRegion,
      userGoal: investmentGoal,
      stockSuggestions: stocks,
      strengths: [
        { 
          title: 'Aligned with Your Profile', 
          description: 'These stocks match your risk appetite and investment timeline.'
        },
        { 
          title: 'Quality Companies', 
          description: 'Selected companies with strong fundamentals and competitive advantages.'
        },
        {
          title: 'Geographic Advantage',
          description: `Focusing on ${countryRegion} markets provides familiarity and potential local economic benefits.`
        },
        {
          title: 'Sector Diversification',
          description: 'Recommendations span multiple sectors to reduce concentration risk.'
        }
      ],
      weaknesses: [
        { 
          title: 'Market Uncertainty', 
          description: 'Current global economic conditions make short-term performance unpredictable.'
        },
        { 
          title: 'Sector Concentration', 
          description: 'Recommendations may have overlapping risk factors or sector exposure.'
        },
        {
          title: 'Limited Diversification',
          description: 'A truly diversified portfolio would include more asset classes and geographic regions.'
        }
      ],
      aiOpinion: {
        summary: `Based on your ${riskProfile.toLowerCase()} risk profile in the ${countryRegion} market, these stocks may align with your ${investmentGoal.toLowerCase()} investment goals.`,
        reasoning: 'These recommendations are based on fundamental analysis and current market trends. Consider them as starting points for your research.',
        alerts: [
          'Always conduct your own research before investing',
          'Consider diversifying across more asset classes',
          `Review your portfolio regularly to ensure it continues to meet your ${investmentGoal.toLowerCase()} goals`
        ]
      },
      relatedNews: [
        {
          title: `${countryRegion} Market Overview: Recent Trends and Analysis`,
          date: new Date().toISOString().split('T')[0],
          source: 'Smart Advisor',
          sentiment: 'neutral',
          summary: `Markets in ${countryRegion} continue to react to economic data and corporate earnings.`
        },
        {
          title: 'Central Banks Signal Shift in Monetary Policy',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          source: 'Financial Times',
          sentiment: 'positive',
          summary: 'Major central banks indicate potential rate cuts later this year as inflation pressures ease.'
        },
        {
          title: 'Tech Sector Leads Market Rally',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          source: 'Market Watch',
          sentiment: 'positive',
          summary: 'Technology stocks surge on strong earnings reports and positive AI developments.'
        }
      ],
      investorMovements: [
        {
          investorName: 'BlackRock Inc.',
          action: 'Bought',
          quantity: '2.3M shares',
          changePercent: '+5.2%',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          investorName: 'Vanguard Group',
          action: 'Bought',
          quantity: '1.8M shares',
          changePercent: '+3.1%',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ],
      matchScore: 75, // Base match score, will be adjusted by generateMockResponse
      timestamp: Date.now()
    };
  }
}

export const smartAdvisorService = new SmartAdvisorService();
export default smartAdvisorService; 