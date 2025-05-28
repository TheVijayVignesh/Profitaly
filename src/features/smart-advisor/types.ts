// Investment Profile Types
export type RiskTolerance = 'Low' | 'Moderate' | 'High';
export type PrimaryGoal = 'Capital Preservation' | 'Income' | 'Growth' | 'Speculation';
export type InvestmentHorizon = '<1 year' | '1–3 years' | '3–7 years' | '7+ years';
export type SectorPreference = 
  | 'Technology' 
  | 'Healthcare' 
  | 'Energy' 
  | 'Financials' 
  | 'Consumer' 
  | 'Industrials' 
  | 'ESG/Impact';
export type GeographicFocus = 
  | 'North America' 
  | 'Europe' 
  | 'Asia-Pacific' 
  | 'Emerging Markets' 
  | 'Global Diversification';

// Investment Profile Interface
export interface InvestmentProfile {
  riskTolerance: RiskTolerance;
  primaryGoal: PrimaryGoal;
  investmentHorizon: InvestmentHorizon;
  sectorPreferences: SectorPreference[];
  geographicFocus: GeographicFocus[];
}

// Stock Recommendation Interface
export interface StockRecommendation {
  ticker: string;
  companyName: string;
  currentPrice?: number;
  changePercent?: number;
  pe?: number;
  dividendYield?: number;
  marketCap?: number;
  explanation?: string;
  chartData?: {
    date: string;
    value: number;
  }[];
}

// AI Recommendation Response Interface
export interface AIRecommendationResponse {
  recommendations: StockRecommendation[];
  analysisText?: string;
}
