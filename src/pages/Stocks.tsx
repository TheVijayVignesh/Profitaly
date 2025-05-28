import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Info, ChevronDown, ArrowUpRight, ArrowDownRight, Calendar, Clock, BarChart2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchService, CompanySymbol } from "@/services/searchService";
import { finnhubService } from "@/services/finnhubService";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { popularStocks, searchStocks } from "@/services/mockData";
import type { StockDetail } from "@/services/mockData";
import StockCard from "@/components/StockCard";
import { stockDetailService, StockDetailData } from "@/services/stockDetailService";

const StockSearch = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by company name or ticker symbol..."
          className="pl-8 w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
};

const TimeframeSelector = ({ activeTimeframe, onTimeframeChange }) => {
  const timeframes = [
    { label: "1D", value: "1day" },
    { label: "1W", value: "1week" },
    { label: "1M", value: "1month" },
    { label: "6M", value: "6month" },
    { label: "1Y", value: "1year" }
  ];

  return (
    <div className="flex space-x-2 mb-4">
      {timeframes.map(tf => (
        <Button
          key={tf.value}
          size="sm"
          variant={activeTimeframe === tf.value ? "default" : "outline"}
          onClick={() => onTimeframeChange(tf.value)}
        >
          {tf.label}
        </Button>
      ))}
    </div>
  );
};

const StockDetails = ({ stockData }: { stockData: StockDetailData }) => {
  const [activeTab, setActiveTab] = useState("chart");
  const [activeTimeframe, setActiveTimeframe] = useState("1month");
  const [livePrice, setLivePrice] = useState(stockData.price);
  const [priceChange, setPriceChange] = useState({
    absolute: stockData.change,
    percent: stockData.changePercent
  });

  // Real-time price updates (polling every 10 seconds)
  useEffect(() => {
    // Initialize with current price
    setLivePrice(stockData.price);
    setPriceChange({
      absolute: stockData.change,
      percent: stockData.changePercent
    });
    
    // Set up polling for live price updates
    const pollInterval = setInterval(async () => {
      try {
        const quoteData = await finnhubService.getStockQuote(stockData.symbol);
        if (quoteData && quoteData.c) {
          setLivePrice(parseFloat(quoteData.c));
          setPriceChange({
            absolute: parseFloat(quoteData.d) || 0,
            percent: parseFloat(quoteData.dp) || 0
          });
        }
      } catch (error) {
        console.error('Error polling stock price:', error);
      }
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(pollInterval);
  }, [stockData.symbol, stockData.price, stockData.change, stockData.changePercent]);

  // Filter chart data based on selected timeframe
  const chartData = useMemo(() => {
    if (!stockData.yearlyPrices || stockData.yearlyPrices.length === 0) {
      console.log('No chart data available');
      return [];
    }

    // Debug the chart data
    console.log('Chart data available:', stockData.yearlyPrices.length, 'points');
    console.log('Sample point:', stockData.yearlyPrices[0]);

    const now = new Date();
    let filteredData = [...stockData.yearlyPrices];
    
    switch (activeTimeframe) {
      case "1day":
        // Filter to last 24 hours (assuming we have hourly data)
        filteredData = stockData.recentPrices || [];
        break;
      case "1week":
        // Filter to last 7 days
        filteredData = stockData.yearlyPrices.filter(d => {
          const date = new Date(d.date);
          const daysDiff = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
          return daysDiff <= 7;
        });
        break;
      case "1month":
        // Filter to last 30 days
        filteredData = stockData.yearlyPrices.filter(d => {
          const date = new Date(d.date);
          const daysDiff = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
          return daysDiff <= 30;
        });
        break;
      case "6month":
        // Filter to last 180 days
        filteredData = stockData.yearlyPrices.filter(d => {
          const date = new Date(d.date);
          const daysDiff = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
          return daysDiff <= 180;
        });
        break;
      case "1year":
      default:
        // Use all data (up to 1 year)
        break;
    }
    
    // Log the filtered data
    console.log('Filtered data:', filteredData.length, 'points for timeframe', activeTimeframe);
    
    // Ensure the data is sorted chronologically
    return filteredData.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [stockData.yearlyPrices, stockData.recentPrices, activeTimeframe]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{stockData.name} ({stockData.symbol})</CardTitle>
            <CardDescription>
              {stockData.exchange} • {stockData.sector || 'Stock'}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold">${livePrice.toFixed(2)}</div>
            <div className={`flex items-center justify-end ${priceChange.absolute >= 0 ? 'text-finance-profit' : 'text-finance-loss'}`}>
              {priceChange.absolute >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {priceChange.absolute >= 0 ? '+' : ''}{priceChange.absolute.toFixed(2)} ({priceChange.percent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="chart" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" /> Chart
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Info className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> News
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-1">
              <Search className="h-4 w-4" /> AI Analysis
            </TabsTrigger>
            <TabsTrigger value="investors" className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Investors
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart">
            {activeTab === "chart" && (
              <>
                <TimeframeSelector 
                  activeTimeframe={activeTimeframe}
                  onTimeframeChange={setActiveTimeframe}
                />
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={priceChange.absolute >= 0 ? "#4CAF50" : "#F44336"}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={priceChange.absolute >= 0 ? "#4CAF50" : "#F44336"}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(date) => {
                          if (!date) return '';
                          if (activeTimeframe === "1day") {
                            return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                          } else if (activeTimeframe === "1week" || activeTimeframe === "1month") {
                            return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          } else {
                            return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                          }
                        }}
                      />
                      <YAxis
                        domain={chartData.length > 0 ? ['auto', 'auto'] : [0, 100]}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                      />
                      <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                        labelFormatter={(label) => {
                          if (!label) return '';
                          const date = new Date(label);
                          if (activeTimeframe === "1day") {
                            return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                          } else {
                            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                          }
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={priceChange.absolute >= 0 ? "#4CAF50" : "#F44336"}
                        fill="url(#colorPrice)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="data-card">
                <div className="text-sm text-muted-foreground">Open</div>
                <div className="text-lg font-medium">${stockData.open.toFixed(2)}</div>
              </div>
              <div className="data-card">
                <div className="text-sm text-muted-foreground">High</div>
                <div className="text-lg font-medium">${stockData.high.toFixed(2)}</div>
              </div>
              <div className="data-card">
                <div className="text-sm text-muted-foreground">Low</div>
                <div className="text-lg font-medium">${stockData.low.toFixed(2)}</div>
              </div>
              <div className="data-card">
                <div className="text-sm text-muted-foreground">Volume</div>
                <div className="text-lg font-medium">{(stockData.volume / 1000000).toFixed(1)}M</div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button className="flex-1">Buy</Button>
              <Button variant="outline" className="flex-1">Sell</Button>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="overview">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">About {stockData.name}</h3>
                <p className="text-muted-foreground">{stockData.description || stockData.aiAnalysis?.overview || 'No company description available.'}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="data-card">
                  <div className="text-sm text-muted-foreground">Market Cap</div>
                  <div className="text-lg font-medium">${stockData.marketCap ? (stockData.marketCap / 1000000000).toFixed(1) + 'B' : 'N/A'}</div>
                </div>
                <div className="data-card">
                  <div className="text-sm text-muted-foreground">P/E Ratio</div>
                  <div className="text-lg font-medium">{stockData.pe ? stockData.pe.toFixed(2) : 'N/A'}</div>
                </div>
                <div className="data-card">
                  <div className="text-sm text-muted-foreground">52W High</div>
                  <div className="text-lg font-medium">
                    {stockData.yearlyPrices && stockData.yearlyPrices.length > 0
                      ? '$' + Math.max(...stockData.yearlyPrices.map(d => d.price)).toFixed(2)
                      : 'N/A'
                    }
                  </div>
                </div>
                <div className="data-card">
                  <div className="text-sm text-muted-foreground">52W Low</div>
                  <div className="text-lg font-medium">
                    {stockData.yearlyPrices && stockData.yearlyPrices.length > 0
                      ? '$' + Math.min(...stockData.yearlyPrices.map(d => d.price)).toFixed(2)
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="news">
            <div className="space-y-5">
              {stockData.news && stockData.news.length > 0 ? (
                stockData.news.map((item) => (
                  <a 
                    key={item.id} 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block data-card border-l-3 border-finance-blue transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 p-4 rounded-md shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      {item.sentiment && (
                        <span className={`ml-2 text-xs font-semibold py-1 px-2 rounded-full whitespace-nowrap ${
                          item.sentiment === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          item.sentiment === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {item.sentiment === 'positive' ? 'Positive' :
                           item.sentiment === 'negative' ? 'Negative' : 'Neutral'}
                        </span>
                      )}
                    </div>
                    {item.summary && (
                      <p className="text-base text-muted-foreground mt-2 mb-3 leading-relaxed">{item.summary}</p>
                    )}
                    <div className="flex justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-sm font-medium text-finance-blue">{item.source}</span>
                      <span className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="mb-3 text-3xl">📰</div>
                  <p className="text-lg mb-2">No recent news available for {stockData.symbol}</p>
                  <p className="text-sm">Check back later for updates</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="analysis">
            <div className="space-y-6">
              <div className="data-card border-l-4 border-finance-blue p-5 rounded-md shadow-sm">
                <h3 className="font-semibold text-xl mb-3">AI Analysis Summary</h3>
                <p className="text-base leading-relaxed">
                  {stockData.aiAnalysis?.overview || `Based on our analysis, ${stockData.name} (${stockData.symbol}) shows ${priceChange.absolute >= 0 ? 'positive' : 'cautious'} momentum in the market.`}
                </p>
                
                {stockData.aiAnalysis?.recentPerformance && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="font-medium text-base mb-2">Recent Performance</h4>
                    <p className="text-sm text-muted-foreground">{stockData.aiAnalysis.recentPerformance}</p>
                  </div>
                )}
                
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-base">Recommendation</span>
                    <span className={`font-semibold text-xl ${
                      stockData.aiAnalysis?.recommendation === 'Buy' ? 'text-finance-profit' :
                      stockData.aiAnalysis?.recommendation === 'Sell' ? 'text-finance-loss' :
                      'text-muted-foreground'
                    }`}>
                      {stockData.aiAnalysis?.recommendation || 'Hold'}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full ${
                        stockData.aiAnalysis?.recommendation === 'Buy' ? 'bg-finance-profit' :
                        stockData.aiAnalysis?.recommendation === 'Sell' ? 'bg-finance-loss' :
                        'bg-finance-blue'
                      }`}
                      style={{ width: `${(stockData.aiAnalysis?.recommendationConfidence || 0.5) * 100}%` }}
                    ></div>
                  </div>
                  
                  {stockData.aiAnalysis?.rationale && (
                    <p className="text-sm mt-2 text-muted-foreground">{stockData.aiAnalysis.rationale}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="data-card p-5 rounded-md shadow-sm">
                  <h3 className="font-semibold text-lg mb-3">Strengths</h3>
                  <ul className="mt-3 space-y-3 text-base">
                    {(stockData.aiAnalysis?.strengths || []).map((strength, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="min-w-2 h-2 rounded-full bg-finance-profit mt-2 flex-shrink-0"></div>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="data-card p-5 rounded-md shadow-sm">
                  <h3 className="font-semibold text-lg mb-3">Risks</h3>
                  <ul className="mt-3 space-y-3 text-base">
                    {(stockData.aiAnalysis?.weaknesses || []).map((weakness, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="min-w-2 h-2 rounded-full bg-finance-loss mt-2 flex-shrink-0"></div>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {stockData.aiAnalysis?.keyMetrics && (
                <div className="data-card p-5 rounded-md shadow-sm">
                  <h3 className="font-semibold text-lg mb-4">Key Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stockData.aiAnalysis.keyMetrics.revenue && (
                      <div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                        <div className="text-base font-medium">{stockData.aiAnalysis.keyMetrics.revenue}</div>
                      </div>
                    )}
                    {stockData.aiAnalysis.keyMetrics.eps && (
                      <div>
                        <div className="text-sm text-muted-foreground">EPS</div>
                        <div className="text-base font-medium">{stockData.aiAnalysis.keyMetrics.eps}</div>
                      </div>
                    )}
                    {stockData.aiAnalysis.keyMetrics.pe && (
                      <div>
                        <div className="text-sm text-muted-foreground">P/E Ratio</div>
                        <div className="text-base font-medium">{stockData.aiAnalysis.keyMetrics.pe}</div>
                      </div>
                    )}
                    {stockData.aiAnalysis.keyMetrics.dividend && (
                      <div>
                        <div className="text-sm text-muted-foreground">Dividend Yield</div>
                        <div className="text-base font-medium">{stockData.aiAnalysis.keyMetrics.dividend}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {stockData.aiAnalysis?.fullAnalysis && (
                <div className="data-card p-5 rounded-md shadow-sm">
                  <h3 className="font-semibold text-lg mb-3">Full Analysis</h3>
                  <div className="text-sm mt-3 text-muted-foreground whitespace-pre-line leading-relaxed">
                    {stockData.aiAnalysis.fullAnalysis}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="investors">
            <div className="space-y-4">
              <div className="data-card">
                <h3 className="font-medium text-lg">Major Institutional Investors</h3>
                <div className="mt-4">
                  <div className="space-y-3">
                    {stockData.institutionalInvestors ? (
                      stockData.institutionalInvestors.map((investor, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-border pb-2">
                          <div>
                            <div className="font-medium">{investor.name}</div>
                            <div className="text-xs text-muted-foreground">{investor.type}</div>
                          </div>
                          <div className="text-right">
                            <div>{investor.shares.toLocaleString()} shares</div>
                            <div className="text-xs text-muted-foreground">{investor.percentage.toFixed(2)}% ownership</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Institutional investor data is not available for {stockData.symbol}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="data-card">
                <h3 className="font-medium text-lg">Recent Insider Transactions</h3>
                <div className="mt-4">
                  {stockData.insiderTransactions ? (
                    <div className="space-y-3">
                      {stockData.insiderTransactions.map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-border pb-2">
                          <div>
                            <div className="font-medium">{transaction.name}</div>
                            <div className="text-xs text-muted-foreground">{transaction.position}</div>
                          </div>
                          <div className="text-right">
                            <div className={transaction.type === 'Buy' ? 'text-finance-profit' : 'text-finance-loss'}>
                              {transaction.type} {transaction.shares.toLocaleString()} shares
                            </div>
                            <div className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Insider transaction data is not available for {stockData.symbol}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const Stocks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CompanySymbol[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockDetailData | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [searchRequestId, setSearchRequestId] = useState(0); // Track the latest search request
  
  // Memoize the defaultCompanies calculation
  const defaultCompanies = useCallback(() => {
    return popularStocks.map(s => ({
      symbol: s.symbol,
      name: s.name,
      exchange: s.exchange
    }));
  }, []);
  
  // Populate with default popular stocks on initial mount only once
  useEffect(() => {
    setSearchResults(defaultCompanies());
  }, [defaultCompanies]);
  
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    // Create a unique ID for this search request to handle race conditions
    const currentRequestId = searchRequestId + 1;
    setSearchRequestId(currentRequestId);
    
    // If the query is empty, reset to default popular stocks
    if (!query.trim()) {
      setSearchResults(defaultCompanies());
      setSelectedStock(null);
      setIsSearching(false);
      return;
    }
    
    // First try mock data for fastest response
    const mockDataMatches = searchStocks(query).map(s => ({
      symbol: s.symbol,
      name: s.name,
      exchange: s.exchange
    }));
    
    if (mockDataMatches.length > 0) {
      // If mock data has matches, show them immediately
      // But only if this is still the current search request
      if (currentRequestId === searchRequestId + 1) {
        setSearchResults(mockDataMatches);
      }
    }
    
    try {
      // Then make the API request
      const apiResults = await searchService.searchCompanies(query);
      
      // Only update if this is still the current search request
      if (currentRequestId === searchRequestId + 1) {
        // Only update if we got real API results or if we haven't already set mock results
        if (apiResults.length > 0) {
          setSearchResults(apiResults);
        } else if (mockDataMatches.length === 0) {
          // If API returned empty and we don't have mock data, let's return at least one result
          // to avoid a completely empty search result
          setSearchResults([{
            symbol: query.toUpperCase(),
            name: `No exact match for "${query}"`,
            exchange: "Search"
          }]);
        }
      }
    } catch (error) {
      console.error('Error searching companies:', error);
      // Only update if this is still the current search request
      if (currentRequestId === searchRequestId + 1) {
        // On error, check if we've already set mock results - if not, use fallback
        if (mockDataMatches.length === 0) {
          setSearchResults([{
            symbol: query.toUpperCase(),
            name: `Search for "${query}"`,
            exchange: "No results found"
          }]);
        }
      }
    } finally {
      // Only update if this is still the current search request
      if (currentRequestId === searchRequestId + 1) {
        setIsSearching(false);
      }
    }
    
    setSelectedStock(null);
  }, [defaultCompanies, searchRequestId]);
  
  const handleSelectStock = async (company: CompanySymbol) => {
    setIsLoadingDetails(true);
    try {
      // Special handling for "no results" placeholder
      if (company.exchange === "No results found") {
        setIsLoadingDetails(false);
        return;
      }
      
      const details = await stockDetailService.getStockDetails(company);
      setSelectedStock(details);
      // Scroll to top on mobile
      if (window.innerWidth < 768) {
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Error fetching stock details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Analysis</h1>
        <p className="text-muted-foreground">Search and analyze stocks from global markets</p>
      </div>

      <StockSearch onSearch={handleSearch} />
      
      {isLoadingDetails ? (
        <Card className="mt-6 relative overflow-hidden min-h-[400px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-finance-blue"></div>
          </div>
        </Card>
      ) : selectedStock && (
        <StockDetails stockData={selectedStock} />
      )}
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{searchQuery ? 'Search Results' : 'Popular Stocks'}</h2>
          <Button variant="ghost" size="sm" className="flex items-center">
            Sort By <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        {isSearching ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-finance-blue"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((company) => (
              <StockCard
                key={company.symbol}
                company={company}
                onClick={() => handleSelectStock(company)}
              />
            ))}
            {searchResults.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">No stocks found. Try a different search term.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stocks;
