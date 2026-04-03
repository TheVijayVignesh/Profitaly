import { finnhubService } from './finnhubService';
import { twelveDataService } from './twelveDataService';
import { perplexityService } from './perplexityService';
import { trendlyneService } from './trendlyneService';
import type { CompanySymbol } from './searchService';
import { popularStocks, getStockDetails } from './mockData';

export interface InstitutionalInvestor {
  name: string;
  shares: number;
  percentage: number;
  type: string;
}

export interface InsiderTransaction {
  name: string;
  position: string;
  shares: number;
  type: 'Buy' | 'Sell';
  date: string;
}

export interface StockDetailData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  sector?: string;
  exchange: string;
  description?: string;
  
  // Historical data
  yearlyPrices: any[];
  recentPrices: any[];
  
  // Analysis
  aiAnalysis?: {
    overview?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendation?: 'Buy' | 'Sell' | 'Hold';
    recommendationConfidence?: number;
    fullAnalysis?: string;
    recentPerformance?: string;
    rationale?: string;
    sector?: string;
    keyMetrics?: {
      revenue?: string;
      eps?: string;
      pe?: string;
      dividend?: string;
      [key: string]: string | undefined;
    };
  };
  
  // News and sentiment
  news: any[];
  sentiment?: {
    score: number;
    bullishPercent: number;
    bearishPercent: number;
  };
  
  // Investor data
  institutionalInvestors?: InstitutionalInvestor[];
  insiderTransactions?: InsiderTransaction[];
}

/**
 * Service to consolidate stock details from multiple data sources
 */
class StockDetailService {
  /**
   * Get comprehensive stock details
   * @param company Company symbol data
   */
  async getStockDetails(company: CompanySymbol): Promise<StockDetailData> {
    try {
      // Check if we have this stock in our mock data first for quick fallback
      const mockStock = popularStocks.find(s => s.symbol === company.symbol);
      const mockDetails = mockStock ? getStockDetails(company.symbol) : null;
      
      // Log to indicate we're fetching data for this company
      console.log(`Fetching stock details for ${company.symbol} from APIs...`);
      
      // Create parallel requests for better performance
      const [quote, profile, historicalData, finnhubCandles, companyNews, sentimentData, aiAnalysis, newsSentiment, investorData] = await Promise.all([
        finnhubService.getStockQuote(company.symbol).catch(err => {
          console.error(`Error fetching quote for ${company.symbol}:`, err);
          return mockStock ? 
            { c: mockStock.price, d: mockStock.change, dp: mockStock.changePercent, v: mockStock.volume } : 
            {};
        }),
        finnhubService.getCompanyProfile(company.symbol).catch(err => {
          console.error(`Error fetching profile for ${company.symbol}:`, err);
          return mockStock ? 
            { name: mockStock.name, marketCapitalization: mockStock.marketCap, finnhubIndustry: mockStock.sector, exchange: mockStock.exchange } : 
            {};
        }),
        twelveDataService.getHistoricalData(company.symbol).catch(err => {
          console.error(`Error fetching historical data from TwelveData for ${company.symbol}:`, err);
          return { yearly: [], recent: [] };
        }),
        finnhubService.getHistoricalCandles(company.symbol).catch(err => {
          console.error(`Error fetching candle data from Finnhub for ${company.symbol}:`, err);
          return { candles: [], status: 'error' };
        }),
        finnhubService.getCompanyNews(company.symbol).catch(err => {
          console.error(`Error fetching news for ${company.symbol}:`, err);
          return [];
        }),
        twelveDataService.getCompanySentiment(company.symbol).catch(err => {
          console.error(`Error fetching sentiment for ${company.symbol}:`, err);
          return { sentimentScore: 0, bullishPercent: 50, bearishPercent: 50, news: [] };
        }),
        perplexityService.getStockAnalysis(company.symbol, company.name).catch(err => {
          console.error(`Error fetching AI analysis for ${company.symbol}:`, err);
          return { text: '' };
        }),
        perplexityService.getNewsSentiment(company.symbol, company.name).catch(err => {
          console.error(`Error fetching news sentiment from Perplexity for ${company.symbol}:`, err);
          return { text: '' };
        }),
        trendlyneService.getInvestorData(company.symbol).catch(err => {
          console.error(`Error fetching investor data for ${company.symbol}:`, err);
          return { 
            institutionalInvestors: [], 
            insiderTransactions: [] 
          };
        })
      ]);
      
      // Log the data we received to help with debugging
      console.log(`Data received for ${company.symbol}:`, { 
        hasQuote: !!quote.c, 
        hasProfile: !!profile.name,
        hasYearlyPrices: historicalData.yearly?.length || 0,
        hasRecentPrices: historicalData.recent?.length || 0,
        hasFinnhubCandles: finnhubCandles?.candles?.length || 0,
        hasStructuredAnalysis: !!aiAnalysis?.structured,
        hasNewsSentiment: !!newsSentiment?.structured,
        newsCount: companyNews?.length || 0
      });
      
      // Initialize sentiment with data from TwelveData
      let sentiment = sentimentData;
      
      // Extract perplexity structured data if available
      const structuredAnalysis = aiAnalysis?.structured || null;
      const structuredNews = newsSentiment?.structured || null;
      
      // Parse the AI analysis, using structured data if available
      let analysisResult;
      if (structuredAnalysis) {
        console.log("Using structured analysis data from Perplexity");
        analysisResult = {
          recommendation: structuredAnalysis.recommendation || 'Hold',
          confidence: parseFloat(structuredAnalysis.confidenceLevel) || 0.5,
          strengths: structuredAnalysis.strengths || [],
          weaknesses: structuredAnalysis.weaknesses || [],
          overview: structuredAnalysis.overview || '',
          recentPerformance: structuredAnalysis.recentPerformance || '',
          sector: structuredAnalysis.sector || '',
          rationale: structuredAnalysis.rationale || '',
          keyMetrics: structuredAnalysis.keyMetrics || {},
          analysis: aiAnalysis.text || ''
        };
      } else {
        console.log("Using text parsing for analysis data");
        analysisResult = this.parseAIAnalysis(aiAnalysis.text || '');
      }
      
      // Combine news from Perplexity and Finnhub, prioritizing Perplexity's structured news
      let newsItems = [];
      if (structuredNews && structuredNews.newsItems && structuredNews.newsItems.length > 0) {
        console.log(`Using ${structuredNews.newsItems.length} structured news items from Perplexity`);
        
        // Convert Perplexity newsItems to our format
        newsItems = structuredNews.newsItems.map((item, index) => ({
          id: `perplexity-${index}`,
          title: item.title,
          summary: item.summary,
          source: item.source,
          date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
          sentiment: item.sentiment || 'neutral',
          url: item.url || `https://www.google.com/search?q=${encodeURIComponent(`${company.symbol} ${item.title} ${item.source || ''}`)}`
        }));
        
        // Add overall sentiment data
        const overallSentiment = {
          score: structuredNews.sentiment === 'bullish' ? 0.7 : 
                 structuredNews.sentiment === 'bearish' ? -0.7 : 0,
          bullishPercent: structuredNews.sentiment === 'bullish' ? 70 : 
                          structuredNews.sentiment === 'bearish' ? 30 : 50,
          bearishPercent: structuredNews.sentiment === 'bullish' ? 30 : 
                         structuredNews.sentiment === 'bearish' ? 70 : 50,
          reason: structuredNews.sentimentReason || '',
          impact: structuredNews.marketImpact || 'Medium'
        };
        
        sentiment = overallSentiment;
      } 
      
      // If not enough structured news, add Finnhub news with filtering
      if (newsItems.length < 3 && companyNews && companyNews.length > 0) {
        const filteredFinnhubNews = this.filterCompanySpecificNews(companyNews, company.symbol, company.name);
        
        // Combine news, prioritizing Perplexity items
        newsItems = [
          ...newsItems,
          ...filteredFinnhubNews.map(item => ({
            ...item,
            // Ensure all news items have a valid URL
            url: item.url || `https://www.google.com/search?q=${encodeURIComponent(`${company.symbol} ${item.title} ${item.source || ''}`)}`
          }))
        ].slice(0, 10); // Limit to 10 items
      }
      
      // Ensure we have at least some news
      if (newsItems.length === 0) {
        newsItems = [{
          id: '1', 
          title: `${company.name} Recent Market Performance`, 
          date: new Date().toISOString(), 
          source: 'Market News',
          summary: `Investors are watching ${company.symbol} closely as market conditions evolve.`,
          sentiment: 'neutral',
          url: `https://www.google.com/search?q=${encodeURIComponent(company.symbol)}+stock+news`
        }];
      }
      
      // Base price on quote or fallback to mock
      const price = parseFloat(quote.c) || (mockStock?.price || 100);
      
      // Prepare chart data, prioritizing Finnhub candles over TwelveData
      const yearlyPrices = finnhubCandles?.candles?.length > 0
        ? finnhubCandles.candles
        : historicalData.yearly || [];
      
      // Log whether we're using real candle data
      console.log(`Using ${finnhubCandles?.candles?.length > 0 ? 'real' : 'mock/fallback'} candle data for chart`);
      
      // Generate recent data from Finnhub candles if it exists and resolution is daily
      const recentPrices = [];
      if (finnhubCandles?.candles?.length > 0) {
        // Get most recent day's data for hourly view
        const now = Math.floor(Date.now() / 1000);
        const oneDayAgo = now - (24 * 60 * 60);
        
        // Get hourly data for the most recent day
        const hourlyCandles = await finnhubService.getHistoricalCandles(
          company.symbol, 
          '60', // 60-minute resolution
          oneDayAgo,
          now
        ).catch(err => {
          console.error(`Error fetching hourly candle data for ${company.symbol}:`, err);
          return { candles: [], status: 'error' };
        });
        
        if (hourlyCandles?.candles?.length > 0) {
          recentPrices.push(...hourlyCandles.candles);
        }
      } else {
        // Fallback to TwelveData recent prices if available
        if (historicalData.recent && historicalData.recent.length > 0) {
          recentPrices.push(...historicalData.recent);
        }
      }
      
      console.log(`Chart data prepared for ${company.symbol}: ${yearlyPrices.length} yearly points, ${recentPrices.length} recent points`);
      
      // Construct the detailed stock data
      return {
        symbol: company.symbol,
        name: company.name || profile.name || '',
        price: price,
        change: parseFloat(quote.d) || 0,
        changePercent: parseFloat(quote.dp) || 0,
        open: parseFloat(quote.o) || price * 0.99,
        high: parseFloat(quote.h) || price * 1.01,
        low: parseFloat(quote.l) || price * 0.98,
        volume: parseInt(quote.v) || (mockStock?.volume || 1000000),
        marketCap: profile.marketCapitalization || (mockStock?.marketCap || price * 1000000),
        pe: profile.pe || mockStock?.pe || Math.floor(15 + Math.random() * 10),
        sector: profile.finnhubIndustry || mockStock?.sector || '',
        exchange: company.exchange || profile.exchange || mockStock?.exchange || '',
        description: profile.description || (mockStock ? 
          `${company.name} is a leading company in the ${mockStock.sector} sector.` : 
          `${company.name} (${company.symbol}) is traded on ${company.exchange}.`),
        
        // Historical data
        yearlyPrices: yearlyPrices,
        recentPrices: recentPrices,
        
        // Analysis
        aiAnalysis: {
          overview: analysisResult.overview || `Information about ${company.name} (${company.symbol})`,
          strengths: analysisResult.strengths || [],
          weaknesses: analysisResult.weaknesses || [],
          recentPerformance: analysisResult.recentPerformance || '',
          sector: analysisResult.sector || profile.finnhubIndustry || 'N/A',
          recommendation: analysisResult.recommendation || 'Hold',
          recommendationConfidence: analysisResult.confidence || 0.5,
          rationale: analysisResult.rationale || '',
          keyMetrics: analysisResult.keyMetrics || {},
          fullAnalysis: analysisResult.analysis || ''
        },
        
        // News and sentiment
        news: newsItems,
        sentiment,
        
        // Investor data
        institutionalInvestors: investorData.institutionalInvestors,
        insiderTransactions: investorData.insiderTransactions
      };
    } catch (error) {
      console.error(`Error getting stock details for ${company.symbol}:`, error);
      
      // Try to use mock data if available
      const mockStock = popularStocks.find(s => s.symbol === company.symbol);
      const mockDetails = mockStock ? getStockDetails(company.symbol) : null;
      
      if (mockDetails) {
        const mockInvestorData = await trendlyneService.getInvestorData(company.symbol).catch(() => ({
          institutionalInvestors: [],
          insiderTransactions: []
        }));
        
        return {
          symbol: company.symbol,
          name: company.name,
          price: mockDetails.price,
          change: mockDetails.change,
          changePercent: mockDetails.changePercent,
          open: mockDetails.open,
          high: mockDetails.high,
          low: mockDetails.low,
          volume: mockDetails.volume,
          marketCap: mockDetails.marketCap,
          pe: mockDetails.pe,
          sector: mockDetails.sector,
          exchange: mockDetails.exchange,
          description: mockDetails.description,
          yearlyPrices: mockDetails.historicalPrices.map(p => ({
            date: p.date,
            price: p.price
          })),
          recentPrices: [],
          news: mockDetails.news,
          aiAnalysis: {
            overview: `${company.name} (${company.symbol}) is a company in the ${mockDetails.sector} sector.`,
            strengths: ['Market position', 'Brand recognition', 'Financial stability', 'Competitive advantage', 'Strong cash flow'],
            weaknesses: ['Competition', 'Market volatility', 'Regulatory risks', 'Cost pressures', 'Technology disruption'],
            recommendation: Math.random() > 0.5 ? "Buy" : "Hold",
            recommendationConfidence: 0.6,
            fullAnalysis: `Analysis for ${company.name} is based on historical data.`
          },
          institutionalInvestors: mockInvestorData.institutionalInvestors,
          insiderTransactions: mockInvestorData.insiderTransactions
        };
      }
      
      // Create synthetic data if mock data is not available
      const basePrice = 100 + (company.symbol.charCodeAt(0) % 5) * 20; // Generate consistent price based on ticker
      const change = (Math.random() * 6) - 3;
      const changePercent = (change / basePrice) * 100;
      
      // Create synthetic historical data
      const today = new Date();
      const yearlyPrices = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - 30 + i);
        return {
          date: date.toISOString().split('T')[0],
          price: basePrice * (0.9 + Math.random() * 0.2)
        };
      });
      
      const mockInvestorData = await trendlyneService.getInvestorData(company.symbol).catch(() => ({
        institutionalInvestors: [],
        insiderTransactions: []
      }));
      
      // Return minimal data with company info and synthetic data
      return {
        symbol: company.symbol,
        name: company.name,
        price: basePrice,
        change: change,
        changePercent: changePercent,
        open: basePrice * 0.99,
        high: basePrice * 1.01,
        low: basePrice * 0.98,
        volume: Math.floor(Math.random() * 10000000),
        exchange: company.exchange,
        sector: 'Unknown',
        yearlyPrices: yearlyPrices,
        recentPrices: [],
        news: [
          { 
            id: '1', 
            title: `${company.name} Market Update`, 
            date: new Date().toISOString(), 
            source: 'Market News',
            summary: `Latest information about ${company.symbol} stock performance and outlook.`
          }
        ],
        aiAnalysis: {
          overview: `${company.name} (${company.symbol}) is traded on ${company.exchange}.`,
          strengths: ['Market position', 'Brand recognition', 'Financial stability', 'Competitive advantage', 'Strong cash flow'],
          weaknesses: ['Competition', 'Market volatility', 'Regulatory risks', 'Cost pressures', 'Technology disruption'],
          recommendation: "Hold",
          recommendationConfidence: 0.5,
          fullAnalysis: "Analysis data currently unavailable. Please check back later for updates."
        },
        institutionalInvestors: mockInvestorData.institutionalInvestors,
        insiderTransactions: mockInvestorData.insiderTransactions
      };
    }
  }
  
  /**
   * Extract company overview from AI analysis
   */
  private extractOverview(text: string): string {
    // Extract the first paragraph or section that likely contains the overview
    const paragraphs = text.split('\n\n');
    if (paragraphs.length > 0) {
      return paragraphs[0];
    }
    return text.substring(0, 300) + '...'; // Fallback to first 300 chars
  }
  
  /**
   * Parse AI analysis text to extract structured data
   */
  private parseAIAnalysis(text: string) {
    // Default values
    let recommendation: 'Buy' | 'Sell' | 'Hold' = 'Hold';
    let confidence = 0.5;
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let overview = '';
    let recentPerformance = '';
    let sector = '';
    let rationale = '';
    const keyMetrics: Record<string, string> = {};
    const analysis = text;
    
    // Try to extract overview - first paragraph
    const paragraphs = text.split(/\n\n+/);
    if (paragraphs.length > 0) {
      overview = paragraphs[0].trim();
    }
    
    // Try to extract sector
    const sectorMatch = text.match(/\b(sector|industry)\b[:\s]+([^\n.]+)/i);
    if (sectorMatch && sectorMatch[2]) {
      sector = sectorMatch[2].trim();
    }
    
    // Try to extract recommendation
    const buyMatch = text.match(/\b(strong buy|buy|accumulate|outperform)\b/i);
    const sellMatch = text.match(/\b(strong sell|sell|reduce|underperform)\b/i);
    const holdMatch = text.match(/\b(hold|neutral|market perform)\b/i);
    
    if (buyMatch) {
      recommendation = 'Buy';
      confidence = buyMatch[0].toLowerCase().includes('strong') ? 0.9 : 0.7;
    } else if (sellMatch) {
      recommendation = 'Sell';
      confidence = sellMatch[0].toLowerCase().includes('strong') ? 0.9 : 0.7;
    } else if (holdMatch) {
      recommendation = 'Hold';
      confidence = 0.6;
    }
    
    // Try to extract recent performance
    const performanceSection = text.match(/\b(recent performance|performance|quarterly results)\b[:\s]+([\s\S]*?)(?=\b(strengths|positives|advantages|pros|weaknesses|negatives|recommendation)\b|$)/i);
    if (performanceSection && performanceSection[2]) {
      recentPerformance = performanceSection[2].trim().split('\n\n')[0];
    }
    
    // Try to extract strengths
    const strengthsSection = text.match(/\b(strengths|positives|advantages|pros)\b[:\s]+([\s\S]*?)(?=\b(weaknesses|negatives|disadvantages|cons|risks)\b|$)/i);
    if (strengthsSection && strengthsSection[2]) {
      strengths = strengthsSection[2]
        .split(/\n+/)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 5);
    }
    
    // Try to extract weaknesses
    const weaknessesSection = text.match(/\b(weaknesses|negatives|disadvantages|cons|risks)\b[:\s]+([\s\S]*?)(?=\b(recommendation|conclusion|summary|outlook)\b|$)/i);
    if (weaknessesSection && weaknessesSection[2]) {
      weaknesses = weaknessesSection[2]
        .split(/\n+/)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 5);
    }
    
    // Try to extract rationale
    const rationaleSection = text.match(/\b(rationale|reasoning|justification)\b[:\s]+([\s\S]*?)(?=\b(key metrics|financial metrics|conclusion)\b|$)/i);
    if (rationaleSection && rationaleSection[2]) {
      rationale = rationaleSection[2].trim().split('\n\n')[0];
    } else if (recommendation !== 'Hold') {
      // If we have a buy/sell recommendation but no explicit rationale, try to find a sentence with the recommendation
      const recSentenceMatch = text.match(new RegExp(`[^.!?]*\\b${recommendation.toLowerCase()}\\b[^.!?]*[.!?]`, 'i'));
      if (recSentenceMatch) {
        rationale = recSentenceMatch[0].trim();
      }
    }
    
    // Try to extract key metrics
    const metricsSection = text.match(/\b(key metrics|financial metrics|key financials)\b[:\s]+([\s\S]*?)(?=\b(conclusion|summary|outlook)\b|$)/i);
    if (metricsSection && metricsSection[2]) {
      // Look for metrics in the format "Metric: Value" or "Metric - Value"
      const metricMatches = metricsSection[2].match(/([A-Za-z\s/]+)[:-]\s*([^,\n]+)/g);
      if (metricMatches) {
        metricMatches.forEach(match => {
          const [metric, value] = match.split(/[:-]\s*/);
          if (metric && value) {
            const key = metric.trim().toLowerCase();
            
            if (key.includes('revenue')) keyMetrics.revenue = value.trim();
            else if (key.includes('eps')) keyMetrics.eps = value.trim();
            else if (key.includes('p/e') || key.includes('pe ratio')) keyMetrics.pe = value.trim();
            else if (key.includes('dividend')) keyMetrics.dividend = value.trim();
            else keyMetrics[key] = value.trim();
          }
        });
      }
    }
    
    // If we couldn't find strengths/weaknesses, create some basic ones
    if (strengths.length === 0) {
      strengths = [
        'Market position',
        'Brand recognition',
        'Financial stability',
        'Innovation capabilities',
        'Strong management team'
      ];
    }
    
    if (weaknesses.length === 0) {
      weaknesses = [
        'Competition',
        'Market volatility',
        'Regulatory risks',
        'Economic sensitivity',
        'Operational challenges'
      ];
    }
    
    return { 
      recommendation, 
      confidence, 
      strengths, 
      weaknesses, 
      overview,
      recentPerformance,
      sector,
      rationale,
      keyMetrics,
      analysis 
    };
  }
  
  /**
   * Filter news items to ensure they're specific to the company
   * @param news The news items from the API
   * @param symbol Company symbol
   * @param name Company name
   */
  private filterCompanySpecificNews(news: any[], symbol: string, name: string): any[] {
    if (!news || news.length === 0) return [];
    
    // Extract keywords from company name for better filtering
    const nameParts = name.toLowerCase().split(' ');
    const nameKeywords = nameParts.filter(part => part.length > 2); // Filter out short words
    
    // Add the symbol as a keyword
    const keywords = [symbol.toLowerCase(), ...nameKeywords];
    
    // Filter news items
    const filteredNews = news.filter(item => {
      if (!item.title && !item.summary) return false;
      
      const titleLower = (item.title || '').toLowerCase();
      const summaryLower = (item.summary || '').toLowerCase();
      
      // Check if any keyword is present in title or summary
      return keywords.some(keyword => 
        titleLower.includes(keyword) || summaryLower.includes(keyword)
      );
    });
    
    // If we filtered out all news, return a subset of the original news
    // as they may still be relevant but just don't explicitly mention the company
    if (filteredNews.length === 0 && news.length > 0) {
      return news.slice(0, Math.min(5, news.length));
    }
    
    return filteredNews;
  }
}

export const stockDetailService = new StockDetailService();
export default stockDetailService; 