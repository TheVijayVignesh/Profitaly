import { finnhubService } from './finnhubService';
import { twelveDataService } from './twelveDataService';

export interface CompanySymbol {
  symbol: string;
  name: string;
  exchange: string;
}

/**
 * Search service to combine symbol search across multiple APIs
 */
class SearchService {
  /**
   * Search for companies by name or symbol across Finnhub and TwelveData
   */
  async searchCompanies(query: string): Promise<CompanySymbol[]> {
    // Perform parallel searches, handling failures gracefully
    const finnhubPromise = finnhubService.searchSymbols(query).catch(error => {
      console.error('Finnhub searchSymbols error:', error);
      return [];
    });
    const twelvePromise = twelveDataService.searchSymbols(query).catch(error => {
      console.error('TwelveData searchSymbols error:', error);
      return [];
    });
    const [finnhubResults, twelveResults] = await Promise.all([finnhubPromise, twelvePromise]);
    
    // Merge and deduplicate by symbol
    const map = new Map<string, CompanySymbol>();
    [...finnhubResults, ...twelveResults].forEach(item => {
      if (!map.has(item.symbol)) {
        map.set(item.symbol, item);
      }
    });
    return Array.from(map.values());
  }
}

export const searchService = new SearchService();
export default searchService; 