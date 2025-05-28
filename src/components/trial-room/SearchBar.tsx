import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, X, TrendingUp, Clock, Star, ExternalLink } from "lucide-react";
import { Stock } from "@/hooks/useTrialRoomTrade";
import { twelveDataService } from "@/services/twelveDataService";
import { finnhubService } from "@/services/finnhubService";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading?: boolean;
  onSelectStock?: (stock: Stock) => void;
  currencySymbol?: string;
}

const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  isLoading = false, 
  onSelectStock,
  currencySymbol = "$"
}: SearchBarProps) => {
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<Stock[]>([]);
  const [trendingStocks, setTrendingStocks] = useState<Stock[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Load trending stocks and recent searches on component mount
  useEffect(() => {
    loadTrendingStocks();
    loadRecentSearches();
  }, []);
  
  // Handle search query changes with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      if (searchQuery.length === 0) {
        setShowResults(true); // Show trending and recent when empty
      }
      return;
    }
    
    const timer = setTimeout(() => {
      searchStocks(searchQuery);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Handle clicks outside of search results to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Load trending stocks
  const loadTrendingStocks = async () => {
    try {
      // Use a predefined list of popular stocks for demo purposes
      const trendingSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
      const stocks = await Promise.all(trendingSymbols.map(async (symbol) => {
        try {
          // Try to get stock details
          const stockInfo = await twelveDataService.getStockDetails(symbol)
            .catch(() => finnhubService.getStockDetails(symbol))
            .catch(() => ({ symbol, name: symbol, exchange: 'NASDAQ' })); // Add default exchange for fallback
          
          // Try to get real price data
          const priceData = await twelveDataService.getPrice(symbol)
            .catch(() => ({ price: null }));
          
          // Get random change data for demo purposes
          const change = Math.round((Math.random() * 10 - 5) * 100) / 100;
          const changePercent = Math.round((Math.random() * 6 - 3) * 100) / 100;
          
          return {
            ...stockInfo,
            price: priceData.price || Math.floor(50 + Math.random() * 950),
            change,
            changePercent
          };
        } catch (error) {
          // Fallback to basic info with random price
          return {
            symbol,
            name: symbol,
            exchange: 'NASDAQ', // Ensure exchange is always provided as it's required by Stock type
            price: Math.floor(50 + Math.random() * 950),
            change: Math.round((Math.random() * 10 - 5) * 100) / 100,
            changePercent: Math.round((Math.random() * 6 - 3) * 100) / 100
          };
        }
      }));
      
      setTrendingStocks(stocks);
    } catch (error) {
      console.error('Error loading trending stocks:', error);
    }
  };
  
  // Load recent searches from localStorage
  const loadRecentSearches = () => {
    try {
      const recentSearchesJson = localStorage.getItem('recentStockSearches');
      if (recentSearchesJson) {
        const parsed = JSON.parse(recentSearchesJson);
        setRecentSearches(parsed);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };
  
  // Save a stock to recent searches
  const saveToRecentSearches = (stock: Stock) => {
    try {
      // Get existing searches or initialize empty array
      const existingSearchesJson = localStorage.getItem('recentStockSearches');
      let existingSearches: Stock[] = [];
      
      if (existingSearchesJson) {
        existingSearches = JSON.parse(existingSearchesJson);
      }
      
      // Remove if already exists (to avoid duplicates)
      const filteredSearches = existingSearches.filter(s => s.symbol !== stock.symbol);
      
      // Add to beginning of array and limit to 5 items
      const updatedSearches = [stock, ...filteredSearches].slice(0, 5);
      
      // Save to localStorage
      localStorage.setItem('recentStockSearches', JSON.stringify(updatedSearches));
      
      // Update state
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };
  
  // Search for stocks using the API
  const searchStocks = async (query: string) => {
    setIsSearching(true);
    try {
      // Try Twelve Data first (for global stocks)
      const results = await twelveDataService.searchSymbols(query)
        .catch(() => finnhubService.searchSymbols(query))
        .catch(() => []);
      
      // Get price data for top results (limit to 5 for performance)
      const topResults = results.slice(0, 5);
      const stocksWithPrice = await Promise.all(topResults.map(async (stock) => {
        try {
          // Try to get real price data
          const priceData = await twelveDataService.getPrice(stock.symbol)
            .catch(() => ({ price: null }));
          
          // Get random change data for demo purposes
          const change = Math.round((Math.random() * 10 - 5) * 100) / 100;
          const changePercent = Math.round((Math.random() * 6 - 3) * 100) / 100;
          
          return {
            ...stock,
            price: priceData.price || Math.floor(50 + Math.random() * 950),
            change,
            changePercent
          };
        } catch (error) {
          // Fallback to random price
          return {
            ...stock,
            price: Math.floor(50 + Math.random() * 950),
            change: Math.round((Math.random() * 10 - 5) * 100) / 100,
            changePercent: Math.round((Math.random() * 6 - 3) * 100) / 100
          };
        }
      }));
      
      setSearchResults(stocksWithPrice);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle stock selection
  const handleSelectStock = (stock: Stock) => {
    if (onSelectStock) {
      onSelectStock(stock);
    }
    setSearchQuery(stock.symbol);
    setShowResults(false);
    saveToRecentSearches(stock);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        {isLoading || isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <Input
        placeholder="Search for any publicly traded stock..."
        className="pl-10 pr-10"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        onFocus={() => setShowResults(true)}
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute inset-y-0 right-0 h-full px-3"
          onClick={clearSearch}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg max-h-[400px] overflow-auto">
          {/* Show tabs only when search is empty */}
          {(!searchQuery || searchQuery.length < 2) && (recentSearches.length > 0 || trendingStocks.length > 0) && (
            <Tabs defaultValue="trending" className="w-full">
              <div className="px-2 pt-2">
                <TabsList className="w-full">
                  <TabsTrigger value="trending" className="flex-1">
                    <TrendingUp className="h-3 w-3 mr-2" /> Trending
                  </TabsTrigger>
                  {recentSearches.length > 0 && (
                    <TabsTrigger value="recent" className="flex-1">
                      <Clock className="h-3 w-3 mr-2" /> Recent
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
              
              <TabsContent value="trending" className="mt-0">
                <ul className="py-1">
                  {trendingStocks.map((stock) => (
                    <li 
                      key={stock.symbol} 
                      className="px-4 py-2 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleSelectStock(stock)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium flex items-center">
                            {stock.symbol}
                            <Badge variant="outline" className="ml-2 text-xs py-0 h-5">
                              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                              Trending
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">{stock.name}</div>
                        </div>
                        <div className="text-right">
                          <div>{currencySymbol}{stock.price.toFixed(2)}</div>
                          {stock.changePercent !== undefined && (
                            <div className={stock.changePercent >= 0 ? "text-finance-profit flex items-center text-xs" : "text-finance-loss flex items-center text-xs"}>
                              {stock.changePercent >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                              )}
                              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="recent" className="mt-0">
                <ul className="py-1">
                  {recentSearches.map((stock) => (
                    <li 
                      key={stock.symbol} 
                      className="px-4 py-2 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleSelectStock(stock)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium flex items-center">
                            {stock.symbol}
                            <Badge variant="outline" className="ml-2 text-xs py-0 h-5">
                              <Clock className="h-3 w-3 mr-1 text-blue-500" />
                              Recent
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">{stock.name}</div>
                        </div>
                        <div className="text-right">
                          <div>{currencySymbol}{stock.price.toFixed(2)}</div>
                          {stock.changePercent !== undefined && (
                            <div className={stock.changePercent >= 0 ? "text-finance-profit flex items-center text-xs" : "text-finance-loss flex items-center text-xs"}>
                              {stock.changePercent >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                              )}
                              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          )}
          
          {/* Search results */}
          {searchQuery.trim().length >= 2 && (
            <>
              {searchResults.length > 0 ? (
                <ul className="py-1">
                  {searchResults.map((stock) => (
                    <li 
                      key={stock.symbol} 
                      className="px-4 py-2 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleSelectStock(stock)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">{stock.name}</div>
                        </div>
                        <div className="text-right">
                          <div>{currencySymbol}{stock.price.toFixed(2)}</div>
                          {stock.changePercent !== undefined && (
                            <div className={stock.changePercent >= 0 ? "text-finance-profit flex items-center text-xs" : "text-finance-loss flex items-center text-xs"}>
                              {stock.changePercent >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                              )}
                              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                !isSearching && (
                  <div className="p-4 text-center text-muted-foreground">
                    No stocks found matching '{searchQuery}'
                  </div>
                )
              )}
            </>
          )}
          
          {/* External search links */}
          {searchQuery.trim().length >= 2 && (
            <div className="border-t px-4 py-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Can't find what you're looking for?</span>
                <a 
                  href={`https://finance.yahoo.com/lookup?s=${searchQuery}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  Search on Yahoo Finance <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
