import axios from 'axios';
import { InstitutionalInvestor, InsiderTransaction } from './stockDetailService';

// Base URL for Trendlyne API
const TRENDLYNE_API_URL = 'https://api.trendlyne.com/v1';

// API key from environment variable
const TRENDLYNE_API_KEY = import.meta.env.VITE_TRENDLYNE_API_KEY || '';

// Log to help debug
console.log(`Trendlyne API Key ${TRENDLYNE_API_KEY ? 'is set' : 'is NOT set'}`);

/**
 * Trendlyne API Service for investor data
 */
class TrendlyneService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: TRENDLYNE_API_URL,
      headers: {
        'Authorization': `Bearer ${TRENDLYNE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get major institutional investors for a stock
   * @param symbol Stock symbol
   */
  async getInstitutionalInvestors(symbol: string): Promise<InstitutionalInvestor[]> {
    try {
      if (!TRENDLYNE_API_KEY) {
        console.warn('No Trendlyne API key found, using mock data');
        return this.generateMockInstitutionalInvestors(symbol);
      }
      
      // Real API call would be implemented here
      const response = await this.axiosInstance.get(`/stocks/${symbol}/institutional-investors`);
      return response.data.data.map((item: any) => ({
        name: item.name,
        shares: item.shares,
        percentage: item.percentage,
        type: item.type
      }));
    } catch (error) {
      console.error('Error fetching institutional investors from Trendlyne:', error);
      return this.generateMockInstitutionalInvestors(symbol);
    }
  }

  /**
   * Get insider transactions for a stock
   * @param symbol Stock symbol
   */
  async getInsiderTransactions(symbol: string): Promise<InsiderTransaction[]> {
    try {
      if (!TRENDLYNE_API_KEY) {
        console.warn('No Trendlyne API key found, using mock data');
        return this.generateMockInsiderTransactions(symbol);
      }
      
      // Real API call would be implemented here
      const response = await this.axiosInstance.get(`/stocks/${symbol}/insider-transactions`);
      return response.data.data.map((item: any) => ({
        name: item.name,
        position: item.position,
        shares: item.shares,
        type: item.type,
        date: item.date
      }));
    } catch (error) {
      console.error('Error fetching insider transactions from Trendlyne:', error);
      return this.generateMockInsiderTransactions(symbol);
    }
  }
  
  /**
   * Get all investor data for a stock
   * @param symbol Stock symbol
   */
  async getInvestorData(symbol: string) {
    try {
      const [institutionalInvestors, insiderTransactions] = await Promise.all([
        this.getInstitutionalInvestors(symbol),
        this.getInsiderTransactions(symbol)
      ]);
      
      return {
        institutionalInvestors,
        insiderTransactions
      };
    } catch (error) {
      console.error('Error fetching investor data from Trendlyne:', error);
      return {
        institutionalInvestors: this.generateMockInstitutionalInvestors(symbol),
        insiderTransactions: this.generateMockInsiderTransactions(symbol)
      };
    }
  }

  /**
   * Generate mock institutional investors
   */
  private generateMockInstitutionalInvestors(symbol: string): InstitutionalInvestor[] {
    const institutionalTypes = [
      'Mutual Fund', 'Pension Fund', 'Hedge Fund', 'Asset Management', 
      'Investment Bank', 'Insurance Company', 'Sovereign Fund'
    ];
    
    const institutionalNames = [
      'BlackRock', 'Vanguard Group', 'State Street', 'Fidelity', 
      'Capital Group', 'Wellington Management', 'JP Morgan Asset Management',
      'Goldman Sachs', 'BNY Mellon', 'UBS Asset Management', 'Morgan Stanley',
      'HDFC Asset Management', 'Axis Mutual Fund', 'SBI Funds', 'ICICI Prudential'
    ];
    
    // Generate a deterministic but varied set of investors based on symbol
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = 4 + (hash % 4); // 4-7 investors
    
    let totalPercentage = 0;
    const investors: InstitutionalInvestor[] = [];
    
    for (let i = 0; i < count; i++) {
      // Use hash to pick consistent investors for the same symbol
      const nameIndex = (hash + i * 13) % institutionalNames.length;
      const typeIndex = (hash + i * 7) % institutionalTypes.length;
      
      // Calculate a percentage that will sum to around 30-45%
      const maxRemaining = 45 - totalPercentage;
      const percentage = Math.min(maxRemaining, 2 + ((hash + i) % 10));
      totalPercentage += percentage;
      
      // Calculate shares based on percentage
      const price = 100 + (hash % 200); // Mock price between 100-300
      const marketCap = price * 100000000; // Mock market cap
      const shares = Math.floor((percentage / 100) * marketCap / price);
      
      investors.push({
        name: institutionalNames[nameIndex],
        type: institutionalTypes[typeIndex],
        percentage: percentage,
        shares: shares
      });
    }
    
    return investors;
  }
  
  /**
   * Generate mock insider transactions
   */
  private generateMockInsiderTransactions(symbol: string): InsiderTransaction[] {
    const positions = [
      'CEO', 'CFO', 'CTO', 'COO', 'Director', 'Vice President', 
      'Chairman', 'Board Member', 'Executive Officer'
    ];
    
    const firstNames = [
      'John', 'Maria', 'Robert', 'Sarah', 'Michael', 'Lisa', 
      'David', 'Jennifer', 'James', 'Emily', 'Raj', 'Sundar', 'Satya'
    ];
    
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 
      'Miller', 'Davis', 'Martinez', 'Wilson', 'Patel', 'Gupta', 'Sharma'
    ];
    
    // Generate a deterministic but varied set of transactions based on symbol
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = 3 + (hash % 4); // 3-6 transactions
    
    const transactions: InsiderTransaction[] = [];
    const today = new Date();
    
    for (let i = 0; i < count; i++) {
      // Use hash to generate consistent values for the same symbol
      const firstNameIndex = (hash + i * 17) % firstNames.length;
      const lastNameIndex = (hash + i * 23) % lastNames.length;
      const positionIndex = (hash + i * 11) % positions.length;
      
      // Calculate transaction date within last 3 months
      const daysAgo = 7 + ((hash + i * 3) % 90);
      const date = new Date();
      date.setDate(today.getDate() - daysAgo);
      
      // Determine if Buy or Sell (slightly more buys than sells for optimism)
      const isBuy = ((hash + i) % 5) < 3;
      
      // Calculate shares - larger for earlier transactions
      const baseShares = 1000 + ((hash + i * 19) % 9000);
      const shares = Math.floor(baseShares * (1 + (i / count)));
      
      transactions.push({
        name: `${firstNames[firstNameIndex]} ${lastNames[lastNameIndex]}`,
        position: positions[positionIndex],
        shares: shares,
        type: isBuy ? 'Buy' : 'Sell',
        date: date.toISOString()
      });
    }
    
    // Sort by date, newest first
    return transactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
}

export const trendlyneService = new TrendlyneService();
export default trendlyneService; 