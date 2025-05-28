import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { smartAdvisorService, AdvisorRequest, UserInvestmentProfile, MarketType } from "./smartAdvisorService";
import { perplexityService } from "./perplexityService";

// Interface for user investment preferences
export interface InvestmentPreferences {
  riskTolerance: string;
  investmentGoals: string[];
  investmentHorizon: string;
  preferredSectors: string[];
  preferredMarkets: string[];
  monthlyInvestment: string;
  preferredDividendYield: string;
  excludedIndustries: string[];
  esgFocus: boolean;
}

// Map user preferences to smart advisor request
const mapPreferencesToAdvisorRequest = (preferences: InvestmentPreferences): AdvisorRequest => {
  // Map risk tolerance to RiskProfile
  const riskProfile = preferences.riskTolerance as "Conservative" | "Balanced" | "Aggressive";
  
  // Map investment horizon to InvestmentGoal
  let investmentGoal: "Long-term" | "Swing" | "Intraday";
  if (preferences.investmentHorizon === "Long-term (5+ years)") {
    investmentGoal = "Long-term";
  } else if (preferences.investmentHorizon === "Medium-term (1-5 years)") {
    investmentGoal = "Swing";
  } else {
    investmentGoal = "Intraday";
  }
  
  // Map monthly investment to capital range
  let capital: "$500" | "$5,000" | "$50,000+";
  if (preferences.monthlyInvestment === "$0-$100") {
    capital = "$500";
  } else if (preferences.monthlyInvestment === "$100-$500" || preferences.monthlyInvestment === "$500-$1000") {
    capital = "$5,000";
  } else {
    capital = "$50,000+";
  }
  
  // Map preferred markets to country/region
  let countryRegion: "India" | "USA" | "Japan" | "Europe" | "Global" = "Global";
  if (preferences.preferredMarkets.includes("US Stocks")) {
    countryRegion = "USA";
  } else if (preferences.preferredMarkets.includes("European Markets")) {
    countryRegion = "Europe";
  } else if (preferences.preferredMarkets.includes("Asian Markets")) {
    countryRegion = "Japan"; // Using Japan as a proxy for Asian markets
  }
  
  // Map preferred sectors to sector preferences
  const sectorPreferences = preferences.preferredSectors.length > 0 
    ? preferences.preferredSectors.map(sector => {
        if (sector === "Technology") return "Tech";
        if (sector === "Healthcare") return "Pharma";
        if (sector === "Financial Services") return "Banking";
        if (sector === "Energy" && preferences.esgFocus) return "Green";
        if (sector === "Energy") return "Energy";
        if (sector === "Real Estate") return "Real Estate";
        if (sector === "Consumer Goods") return "Consumer";
        return sector as any;
      })
    : ["All"];
  
  // Map to market types
  const marketTypes: MarketType[] = ["Large Cap" as MarketType, "Mid Cap" as MarketType];
  if (riskProfile === "Aggressive") {
    marketTypes.push("Small Cap" as MarketType);
  }
  if (preferences.esgFocus) {
    marketTypes.push("Green" as MarketType);
  }
  
  // Create user investment profile
  const userProfile: UserInvestmentProfile = {
    countryRegion,
    marketTypes,
    capital,
    riskProfile,
    investmentGoal,
    sectorPreferences: sectorPreferences as any,
    lastUpdated: Date.now()
  };
  
  // Create advisor request
  return {
    userProfile,
    excludeStocks: preferences.excludedIndustries.length > 0 
      ? preferences.excludedIndustries.map(industry => industry.toUpperCase())
      : undefined
  };
};

// Generate a Perplexity API prompt based on user preferences
const generatePerplexityPrompt = (preferences: InvestmentPreferences): string => {
  const riskLevel = preferences.riskTolerance.toLowerCase();
  const sectors = preferences.preferredSectors.length > 0 
    ? preferences.preferredSectors.join(", ") 
    : "any sector";
  const markets = preferences.preferredMarkets.length > 0 
    ? preferences.preferredMarkets.join(", ") 
    : "global markets";
  const timeframe = preferences.investmentHorizon.toLowerCase();
  const excludedIndustries = preferences.excludedIndustries.length > 0 
    ? `excluding ${preferences.excludedIndustries.join(", ")}` 
    : "";
  const esgFocus = preferences.esgFocus 
    ? "with a focus on environmental, social, and governance (ESG) factors" 
    : "";
  const dividendYield = preferences.preferredDividendYield !== "No preference" 
    ? `with a dividend yield of ${preferences.preferredDividendYield}` 
    : "";
  
  const goals = preferences.investmentGoals.length > 0 
    ? `for ${preferences.investmentGoals.join(", ")}` 
    : "for general investment purposes";

  return `
Recommend 5 stocks for a ${riskLevel} investor with a ${timeframe} investment horizon ${goals}. 
Focus on ${sectors} in ${markets} ${excludedIndustries} ${esgFocus} ${dividendYield}.

For each stock recommendation, provide:
1. Symbol and company name
2. Current price and recent performance
3. Why it fits the investor's profile
4. Expected return over the relevant timeframe
5. Key risks to be aware of

Also provide a brief overall market outlook relevant to these recommendations.

Format the response as JSON with the following structure:
{
  "recommendations": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "sector": "Technology",
      "currentPrice": "$150",
      "rationale": "Explanation of why this fits the investor profile",
      "expectedReturn": "10-15% annually",
      "keyRisks": ["Risk 1", "Risk 2"]
    }
  ],
  "marketOutlook": "Brief market outlook relevant to these recommendations"
}
`;
};

// Get user preferences from Firestore
export const getUserPreferences = async (): Promise<InvestmentPreferences | null> => {
  try {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      console.error("No user is logged in");
      return null;
    }
    
    const db = getFirestore();
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().preferences) {
      return userDoc.data().preferences as InvestmentPreferences;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return null;
  }
};

// Get stock recommendations based on user preferences
export const getStockRecommendationsFromPreferences = async () => {
  try {
    // Get user preferences
    const preferences = await getUserPreferences();
    
    if (!preferences) {
      console.error("No user preferences found");
      return null;
    }
    
    // Use SmartAdvisorService
    const advisorRequest = mapPreferencesToAdvisorRequest(preferences);
    const advisorResponse = await smartAdvisorService.getRecommendations(advisorRequest);
    
    return advisorResponse;
  } catch (error) {
    console.error("Error getting stock recommendations from preferences:", error);
    return null;
  }
};

// Get personalized stock recommendations using Perplexity API
export const getPerplexityRecommendations = async () => {
  try {
    // Get user preferences
    const preferences = await getUserPreferences();
    
    if (!preferences) {
      console.error("No user preferences found");
      return null;
    }
    
    // Generate prompt for Perplexity API
    const prompt = generatePerplexityPrompt(preferences);
    
    // Call Perplexity API
    const response = await perplexityService.queryAI(prompt);
    
    // Try to parse the response as JSON
    try {
      // Extract JSON content if needed (removing possible markdown code blocks)
      const textContent = response.text;
      const jsonContent = textContent.replace(/```json\n|\n```|```\n/g, '').trim();
      
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
    console.error("Error getting Perplexity recommendations:", error);
    return null;
  }
};

const userPreferencesService = {
  getUserPreferences,
  getStockRecommendationsFromPreferences,
  getPerplexityRecommendations
};

export default userPreferencesService;
