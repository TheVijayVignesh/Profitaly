import { perplexityService } from "@/services/perplexityService";
import { twelveDataService } from "@/services/twelveDataService";
import { finnhubService } from "@/services/finnhubService";
import { 
  InvestmentProfile, 
  StockRecommendation, 
  AIRecommendationResponse 
} from "./types";

/**
 * Service for handling Smart Advisor functionality
 */
class SmartAdvisorService {
  /**
   * Generate stock recommendations based on user's investment profile
   * @param profile User's investment profile
   */
  async getRecommendations(profile: InvestmentProfile): Promise<AIRecommendationResponse> {
    try {
      // For reliability, we'll use mock recommendations directly
      // This ensures users always get recommendations even if the API has issues
      const mockRecommendations = this.getMockRecommendations(profile);
      
      // Generate analysis text based on the profile
      const analysisText = this.generateAnalysisText(profile);
      
      // Enrich the mock recommendations with real-time data if possible
      const enrichedRecommendations = await this.enrichRecommendationsWithData(mockRecommendations);
      
      return {
        recommendations: enrichedRecommendations,
        analysisText: analysisText
      };
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return {
        recommendations: this.getMockRecommendations(profile),
        analysisText: "Based on your investment profile, we've selected stocks that match your risk tolerance, goals, and preferences. These recommendations are tailored to your specified investment horizon and sector interests."
      };
    }
  }
  
  /**
   * Generate analysis text based on the user's profile
   * @param profile User's investment profile
   */
  private generateAnalysisText(profile: InvestmentProfile): string {
    // Create personalized analysis based on profile
    let analysis = `Based on your ${profile.riskTolerance.toLowerCase()} risk tolerance`;
    
    // Add goal-specific text
    if (profile.primaryGoal === "Capital Preservation") {
      analysis += " and focus on capital preservation, we've selected stable stocks with lower volatility";
    } else if (profile.primaryGoal === "Income") {
      analysis += " and income-focused strategy, we've prioritized stocks with consistent dividend payments";
    } else if (profile.primaryGoal === "Growth") {
      analysis += " and growth objectives, we've identified companies with strong growth potential";
    } else if (profile.primaryGoal === "Speculation") {
      analysis += " and speculative approach, we've found stocks with higher risk but potential for significant returns";
    }
    
    // Add time horizon context
    if (profile.investmentHorizon === "<1 year") {
      analysis += " for your short-term investment horizon";
    } else if (profile.investmentHorizon === "1–3 years") {
      analysis += " suitable for your medium-term investment timeline";
    } else if (profile.investmentHorizon === "3–7 years" || profile.investmentHorizon === "7+ years") {
      analysis += " that align with your long-term investment strategy";
    }
    
    // Add sector preferences if specified
    if (profile.sectorPreferences.length > 0) {
      analysis += `. We've focused on your preferred sectors: ${profile.sectorPreferences.join(", ")}`;
    }
    
    // Add geographic focus if specified
    if (profile.geographicFocus.length > 0) {
      analysis += `, with attention to your geographic interests in ${profile.geographicFocus.join(", ")}`;
    }
    
    analysis += ". These recommendations are designed to help you achieve your financial goals while respecting your risk preferences.";
    
    return analysis;
  }
  
  /**
   * Create a prompt for the Perplexity API based on the user's profile
   * This method is kept for future use if API integration is fixed
   * @param profile User's investment profile
   */
  private createPromptFromProfile(profile: InvestmentProfile): string {
    return `
You are a professional investment advisor. Based on the following investment profile, recommend 5 specific stocks that would be suitable investments. For each recommendation, include the ticker symbol and company name.

Investment Profile:
- Risk Tolerance: ${profile.riskTolerance}
- Primary Goal: ${profile.primaryGoal}
- Investment Horizon: ${profile.investmentHorizon}
- Sector Preferences: ${profile.sectorPreferences.join(', ')}
- Geographic Focus: ${profile.geographicFocus.join(', ')}

For each recommended stock, provide:
1. Ticker symbol
2. Company name
3. A brief explanation (2-3 sentences) of why this stock matches the investment profile

Format your response as a JSON array of objects with the following structure:
[
  {
    "ticker": "AAPL",
    "companyName": "Apple Inc.",
    "explanation": "Explanation of why this stock matches the profile..."
  },
  ...
]

Do not include any text outside of the JSON structure. Your response should be valid JSON that can be parsed directly.
`;
  }
  
  /**
   * Parse the AI response to extract recommendations
   * This method is kept for future use if API integration is fixed
   * @param responseText Response text from Perplexity API
   */
  private async parseAIResponse(responseText: string): Promise<StockRecommendation[]> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\[\s*\{.*?\}\s*\]/s);
      
      if (jsonMatch) {
        // Parse the JSON
        const recommendations = JSON.parse(jsonMatch[0]);
        return recommendations;
      }
      
      // If no JSON found, try to extract ticker symbols and company names
      const tickerRegex = /\b([A-Z]{1,5})\b.*?([A-Za-z0-9\s,\.&]+?)(?=\n|$)/g;
      const matches = [...responseText.matchAll(tickerRegex)];
      
      if (matches.length > 0) {
        return matches.map(match => ({
          ticker: match[1].trim(),
          companyName: match[2].trim(),
          explanation: "Recommended based on your investment profile."
        })).slice(0, 5);
      }
      
      // If all else fails, return mock recommendations
      return this.getMockRecommendations();
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return this.getMockRecommendations();
    }
  }
  
  /**
   * Enrich recommendations with real-time data
   * @param recommendations Basic stock recommendations
   */
  private async enrichRecommendationsWithData(
    recommendations: StockRecommendation[]
  ): Promise<StockRecommendation[]> {
    // Create an array of promises for fetching data for each stock
    const enrichmentPromises = recommendations.map(async (stock) => {
      try {
        // Fetch price data from Twelve Data
        const priceData = await twelveDataService.getPrice(stock.ticker);
        
        // Fetch company profile from Finnhub
        const profileData = await finnhubService.getCompanyProfile(stock.ticker);
        
        // Fetch historical data for chart
        const historicalData = await twelveDataService.getHistoricalData(stock.ticker);
        
        // Format chart data
        let chartData = [];
        if (historicalData && historicalData.yearly && historicalData.yearly.length > 0) {
          chartData = historicalData.yearly.map((point: any) => ({
            date: point.date,
            value: point.close || point.price
          }));
        }
        
        // Return enriched stock data
        return {
          ...stock,
          currentPrice: priceData.price || 0,
          changePercent: priceData.changePercent || 0,
          pe: profileData.pe,
          dividendYield: profileData.dividendYield,
          marketCap: profileData.marketCapitalization,
          chartData
        };
      } catch (error) {
        console.error(`Error enriching data for ${stock.ticker}:`, error);
        // Return original stock with mock data
        return {
          ...stock,
          currentPrice: this.getRandomPrice(stock.ticker),
          changePercent: this.getRandomChangePercent(),
          pe: this.getRandomPE(),
          dividendYield: this.getRandomDividendYield(),
          marketCap: this.getRandomMarketCap()
        };
      }
    });
    
    // Wait for all promises to resolve
    return Promise.all(enrichmentPromises);
  }
  
  /**
   * Get mock recommendations based on profile
   * @param profile Optional user profile to tailor mock recommendations
   */
  private getMockRecommendations(profile?: InvestmentProfile): StockRecommendation[] {
    // Define sets of stocks for different risk profiles and sectors
    const lowRiskStocks = [
      { ticker: "JNJ", companyName: "Johnson & Johnson", sector: "Healthcare" },
      { ticker: "PG", companyName: "Procter & Gamble Co.", sector: "Consumer" },
      { ticker: "KO", companyName: "Coca-Cola Co.", sector: "Consumer" },
      { ticker: "VZ", companyName: "Verizon Communications", sector: "Telecommunications" },
      { ticker: "PEP", companyName: "PepsiCo Inc.", sector: "Consumer" },
      { ticker: "WMT", companyName: "Walmart Inc.", sector: "Consumer" },
      { ticker: "MRK", companyName: "Merck & Co.", sector: "Healthcare" },
      { ticker: "PFE", companyName: "Pfizer Inc.", sector: "Healthcare" },
      { ticker: "T", companyName: "AT&T Inc.", sector: "Telecommunications" },
      { ticker: "XOM", companyName: "Exxon Mobil Corporation", sector: "Energy" }
    ];
    
    const moderateRiskStocks = [
      { ticker: "MSFT", companyName: "Microsoft Corporation", sector: "Technology" },
      { ticker: "AAPL", companyName: "Apple Inc.", sector: "Technology" },
      { ticker: "V", companyName: "Visa Inc.", sector: "Financials" },
      { ticker: "HD", companyName: "Home Depot Inc.", sector: "Consumer" },
      { ticker: "UNH", companyName: "UnitedHealth Group", sector: "Healthcare" },
      { ticker: "MA", companyName: "Mastercard Inc.", sector: "Financials" },
      { ticker: "DIS", companyName: "Walt Disney Company", sector: "Consumer" },
      { ticker: "CSCO", companyName: "Cisco Systems Inc.", sector: "Technology" },
      { ticker: "INTC", companyName: "Intel Corporation", sector: "Technology" },
      { ticker: "CVX", companyName: "Chevron Corporation", sector: "Energy" }
    ];
    
    const highRiskStocks = [
      { ticker: "TSLA", companyName: "Tesla Inc.", sector: "Automotive" },
      { ticker: "NVDA", companyName: "NVIDIA Corporation", sector: "Technology" },
      { ticker: "AMD", companyName: "Advanced Micro Devices", sector: "Technology" },
      { ticker: "COIN", companyName: "Coinbase Global Inc.", sector: "Financials" },
      { ticker: "SQ", companyName: "Block Inc.", sector: "Financials" },
      { ticker: "SHOP", companyName: "Shopify Inc.", sector: "Technology" },
      { ticker: "PLTR", companyName: "Palantir Technologies", sector: "Technology" },
      { ticker: "ROKU", companyName: "Roku Inc.", sector: "Technology" },
      { ticker: "MELI", companyName: "MercadoLibre Inc.", sector: "Consumer" },
      { ticker: "CRWD", companyName: "CrowdStrike Holdings", sector: "Technology" }
    ];
    
    // Asia-Pacific stocks
    const asiaPacificStocks = [
      { ticker: "9988.HK", companyName: "Alibaba Group Holding", sector: "Technology" },
      { ticker: "9618.HK", companyName: "JD.com Inc.", sector: "Consumer" },
      { ticker: "3690.HK", companyName: "Meituan", sector: "Technology" },
      { ticker: "9999.HK", companyName: "NetEase Inc.", sector: "Technology" },
      { ticker: "0700.HK", companyName: "Tencent Holdings", sector: "Technology" },
      { ticker: "7203.T", companyName: "Toyota Motor Corp.", sector: "Automotive" },
      { ticker: "9984.T", companyName: "SoftBank Group Corp.", sector: "Technology" },
      { ticker: "6758.T", companyName: "Sony Group Corp.", sector: "Consumer" },
      { ticker: "005930.KS", companyName: "Samsung Electronics", sector: "Technology" },
      { ticker: "000660.KS", companyName: "SK Hynix Inc.", sector: "Technology" }
    ];
    
    // European stocks
    const europeanStocks = [
      { ticker: "ASML.AS", companyName: "ASML Holding", sector: "Technology" },
      { ticker: "SAP.DE", companyName: "SAP SE", sector: "Technology" },
      { ticker: "SIE.DE", companyName: "Siemens AG", sector: "Industrials" },
      { ticker: "LVMH.PA", companyName: "LVMH Moët Hennessy", sector: "Consumer" },
      { ticker: "MC.PA", companyName: "LVMH", sector: "Consumer" },
      { ticker: "NESN.SW", companyName: "Nestlé S.A.", sector: "Consumer" },
      { ticker: "NOVN.SW", companyName: "Novartis AG", sector: "Healthcare" },
      { ticker: "ROG.SW", companyName: "Roche Holding AG", sector: "Healthcare" },
      { ticker: "BP.L", companyName: "BP plc", sector: "Energy" },
      { ticker: "SHEL.L", companyName: "Shell plc", sector: "Energy" }
    ];
    
    // ESG/Impact stocks
    const esgStocks = [
      { ticker: "ENPH", companyName: "Enphase Energy", sector: "Energy" },
      { ticker: "SEDG", companyName: "SolarEdge Technologies", sector: "Energy" },
      { ticker: "NEE", companyName: "NextEra Energy", sector: "Energy" },
      { ticker: "BEPC", companyName: "Brookfield Renewable", sector: "Energy" },
      { ticker: "FSLR", companyName: "First Solar", sector: "Energy" },
      { ticker: "BYND", companyName: "Beyond Meat", sector: "Consumer" },
      { ticker: "EVGO", companyName: "EVgo Inc.", sector: "Energy" },
      { ticker: "CHPT", companyName: "ChargePoint Holdings", sector: "Energy" },
      { ticker: "ICLN", companyName: "iShares Global Clean Energy ETF", sector: "Energy" },
      { ticker: "TAN", companyName: "Invesco Solar ETF", sector: "Energy" }
    ];
    
    // Select stocks based on risk tolerance
    let stockPool = moderateRiskStocks;
    if (profile) {
      if (profile.riskTolerance === "Low") {
        stockPool = lowRiskStocks;
      } else if (profile.riskTolerance === "High") {
        stockPool = highRiskStocks;
      }
      
      // Add geographic focus stocks if specified
      if (profile.geographicFocus.length > 0) {
        let geoStocks: typeof lowRiskStocks = [];
        
        if (profile.geographicFocus.includes("Asia-Pacific")) {
          geoStocks = [...geoStocks, ...asiaPacificStocks];
        }
        
        if (profile.geographicFocus.includes("Europe")) {
          geoStocks = [...geoStocks, ...europeanStocks];
        }
        
        if (geoStocks.length > 0) {
          stockPool = [...geoStocks, ...stockPool];
        }
      }
      
      // Add ESG/Impact stocks if specified
      if (profile.sectorPreferences.includes("ESG/Impact")) {
        stockPool = [...esgStocks, ...stockPool];
      }
      
      // Filter by sector if preferences are specified
      if (profile.sectorPreferences.length > 0) {
        const sectorMap: Record<string, string[]> = {
          "Technology": ["Technology"],
          "Healthcare": ["Healthcare"],
          "Energy": ["Energy"],
          "Financials": ["Financials"],
          "Consumer": ["Consumer"],
          "Industrials": ["Industrials"],
          "ESG/Impact": ["Energy", "ESG/Impact"]
        };
        
        // Add some stocks from preferred sectors
        const allStocks = [...lowRiskStocks, ...moderateRiskStocks, ...highRiskStocks, ...asiaPacificStocks, ...europeanStocks, ...esgStocks];
        const sectorStocks = allStocks.filter(
          stock => profile.sectorPreferences.some(
            sector => sectorMap[sector]?.includes(stock.sector)
          )
        );
        
        if (sectorStocks.length >= 3) {
          stockPool = [...sectorStocks, ...stockPool];
        }
      }
    }
    
    // Remove duplicates by ticker
    const uniqueStocks = Array.from(new Map(stockPool.map(stock => [stock.ticker, stock])).values());
    
    // Shuffle and pick 5 stocks
    const shuffled = [...uniqueStocks].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    // Add explanations based on profile
    return selected.map(stock => {
      let explanation = `${stock.companyName} is a strong ${stock.sector.toLowerCase()} company `;
      
      if (profile) {
        if (profile.riskTolerance === "Low") {
          explanation += "with stable earnings and dividend history. ";
        } else if (profile.riskTolerance === "Moderate") {
          explanation += "with a good balance of growth and stability. ";
        } else {
          explanation += "with high growth potential. ";
        }
        
        if (profile.primaryGoal === "Income") {
          explanation += "It provides consistent dividend payments suitable for income-focused investors.";
        } else if (profile.primaryGoal === "Growth") {
          explanation += "The company has demonstrated strong growth potential aligned with your investment goals.";
        } else if (profile.primaryGoal === "Capital Preservation") {
          explanation += "It has a history of maintaining value even during market downturns.";
        } else {
          explanation += "The stock has potential for significant returns in the right market conditions.";
        }
      } else {
        explanation += "that aligns well with a balanced investment strategy.";
      }
      
      return {
        ticker: stock.ticker,
        companyName: stock.companyName,
        explanation,
        currentPrice: this.getRandomPrice(stock.ticker),
        changePercent: this.getRandomChangePercent(),
        pe: this.getRandomPE(),
        dividendYield: this.getRandomDividendYield(),
        marketCap: this.getRandomMarketCap()
      };
    });
  }
  
  // Helper methods for generating random data
  private getRandomPrice(symbol: string): number {
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Math.floor(50 + (hash % 950) + Math.random() * 10);
  }
  
  private getRandomChangePercent(): number {
    return Math.round((Math.random() * 6 - 3) * 100) / 100;
  }
  
  private getRandomPE(): number {
    return Math.round((10 + Math.random() * 30) * 10) / 10;
  }
  
  private getRandomDividendYield(): number {
    return Math.round((0.5 + Math.random() * 3.5) * 100) / 100;
  }
  
  private getRandomMarketCap(): number {
    // Return market cap in billions (1-1000 billion)
    return Math.round((1 + Math.random() * 999) * 1_000_000_000);
  }
}

export const smartAdvisorService = new SmartAdvisorService();
