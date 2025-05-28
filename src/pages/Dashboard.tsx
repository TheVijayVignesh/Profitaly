
import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, LineChart, TrendingUp, TrendingDown, Info, Search } from "lucide-react";
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
import { 
  marketIndices, 
  popularStocks, 
  trendingSectors,
  portfolioPerformance as initialPortfolioPerformance
} from "@/services/mockData";
import { finnhubService } from "@/services/finnhubService";
import { twelveDataService } from "@/services/twelveDataService";
import { trialRoomService, TrialRoomData } from "@/services/trialRoomService";
import { useNavigate } from "react-router-dom";
import { Stock } from "@/hooks/useTrialRoomTrade";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Cell,
  Legend
} from "recharts";

const PerformanceChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
          dy={10}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
        />
        <Tooltip 
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
          labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric' 
          })}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="url(#colorValue)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const SectorPerformanceChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `${value}%`} />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(2)}%`, 'Performance']}
        />
        <Bar dataKey="performance">
          {trendingSectors.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.performance >= 0 ? '#4CAF50' : '#F44336'} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [trialRoomData, setTrialRoomData] = useState<TrialRoomData | null>(null);
  const [portfolioPerformance, setPortfolioPerformance] = useState(initialPortfolioPerformance);
  const [todayChange, setTodayChange] = useState({ value: 0, percent: 0 });
  const [stockList, setStockList] = useState<Stock[]>([]);
  const [fantasyRanking, setFantasyRanking] = useState(42);
  const [isLoading, setIsLoading] = useState(true);

  // Navigate to Trial Rooms
  const goToTrialRooms = () => {
    navigate('/trial-rooms');
  };

  // Fetch trial room data
  useEffect(() => {
    const fetchTrialRoomData = async () => {
      setIsLoading(true);
      try {
        // Get trial room data
        const data = await trialRoomService.getUserTrialRoom();
        
        if (data) {
          setTrialRoomData(data);
          
          // Load stocks for the market
          const stocks = await trialRoomService.getStocksByMarket(data.market);
          setStockList(stocks);
          
          // Calculate today's change based on holdings
          if (data.holdings.length > 0) {
            let totalValue = 0;
            let previousValue = 0;
            
            // Get current prices for holdings
            const holdingsWithPrices = await Promise.all(data.holdings.map(async (holding) => {
              try {
                const priceData = await twelveDataService.getPrice(holding.symbol)
                  .catch(() => finnhubService.getStockQuote(holding.symbol))
                  .catch(() => ({ price: null }));
                
                const currentPrice = priceData.price || priceData.c || 0;
                const previousPrice = currentPrice * (1 - (Math.random() * 0.05)); // Simulate previous day price
                
                totalValue += currentPrice * holding.quantity;
                previousValue += previousPrice * holding.quantity;
                
                return {
                  ...holding,
                  currentPrice,
                  previousPrice
                };
              } catch (error) {
                console.error(`Error fetching data for ${holding.symbol}:`, error);
                return holding;
              }
            }));
            
            // Calculate today's change
            const changeValue = totalValue - previousValue;
            const changePercent = previousValue > 0 ? (changeValue / previousValue) * 100 : 0;
            
            setTodayChange({
              value: parseFloat(changeValue.toFixed(2)),
              percent: parseFloat(changePercent.toFixed(2))
            });
          }
          
          // Generate portfolio performance data based on transactions
          if (data.transactions.length > 0) {
            // Sort transactions by timestamp
            const sortedTransactions = [...data.transactions].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            
            // Generate performance data points
            const performanceData = [];
            let balance = data.wallet; // Starting balance
            const startDate = new Date(sortedTransactions[0].timestamp);
            const endDate = new Date();
            
            // Create data points for each month
            for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
              const date = new Date(d).toISOString();
              
              // Apply transactions up to this date
              const relevantTransactions = sortedTransactions.filter(
                tx => new Date(tx.timestamp) <= d
              );
              
              // Calculate portfolio value based on transactions
              let portfolioValue = data.wallet;
              relevantTransactions.forEach(tx => {
                if (tx.type === 'buy') {
                  portfolioValue -= tx.total;
                } else {
                  portfolioValue += tx.total;
                }
              });
              
              // Add some randomness for visual appeal
              const randomFactor = 1 + (Math.random() * 0.1 - 0.05);
              
              performanceData.push({
                date,
                value: portfolioValue * randomFactor
              });
            }
            
            setPortfolioPerformance(performanceData);
          }
        } else {
          // If no trial room data exists, create one
          const newRoom = await trialRoomService.createTrialRoom("NASDAQ", 10000);
          setTrialRoomData(newRoom);
          
          // Load stocks for NASDAQ
          const stocks = await trialRoomService.getStocksByMarket("NASDAQ");
          setStockList(stocks);
        }
      } catch (error) {
        console.error('Error fetching trial room data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrialRoomData();
  }, [navigate]);

  // Calculate portfolio statistics
  const portfolioValue = trialRoomData ? trialRoomData.holdings.reduce((total, holding) => {
    // Get current price (mock for now)
    const stock = stockList.find(s => s.symbol === holding.symbol);
    const currentPrice = stock?.price || holding.avg_price;
    return total + (holding.quantity * currentPrice);
  }, trialRoomData.cash_left) : 0;
  
  const initialInvestment = trialRoomData?.wallet || 10000;
  const portfolioProfit = portfolioValue - initialInvestment;
  const portfolioProfitPercent = initialInvestment > 0 ? (portfolioProfit / initialInvestment) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stocks..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>Search</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={goToTrialRooms}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioValue.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <div className="flex items-center pt-1 text-xs">
              {portfolioProfit >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-finance-profit mr-1" />
                  <span className="text-finance-profit">{portfolioProfitPercent.toFixed(2)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-finance-loss mr-1" />
                  <span className="text-finance-loss">{portfolioProfitPercent.toFixed(2)}%</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">from initial investment</span>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={goToTrialRooms}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayChange.value >= 0 ? '+' : ''}{todayChange.value.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <div className="flex items-center pt-1 text-xs">
              {todayChange.value >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-finance-profit mr-1" />
                  <span className="text-finance-profit">+{todayChange.percent.toFixed(2)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-finance-loss mr-1" />
                  <span className="text-finance-loss">{todayChange.percent.toFixed(2)}%</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={goToTrialRooms}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Room Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trialRoomData?.cash_left.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2}) || '$0.00'}</div>
            <div className="flex items-center pt-1 text-xs">
              <ArrowUpRight className="h-3 w-3 text-finance-profit mr-1" />
              <span className="text-finance-profit">+{trialRoomData ? (((trialRoomData.cash_left - (trialRoomData.wallet / 2)) / (trialRoomData.wallet / 2)) * 100).toFixed(2) : '0.00'}%</span>
              <span className="text-muted-foreground ml-1">from initial</span>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/fantasy-grounds')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fantasy Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{fantasyRanking}</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <span>Out of {1000 + Math.floor(Math.random() * 500)} players</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="market">Market Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>
                  Your investment growth over time
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <PerformanceChart data={portfolioPerformance} />
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Your Holdings</CardTitle>
                <CardDescription>
                  Current portfolio allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trialRoomData?.holdings.map((holding) => {
                    // Get current price from stockList
                    const stock = stockList.find(s => s.symbol === holding.symbol);
                    const currentPrice = stock?.price || holding.avg_price;
                    const currentValue = holding.quantity * currentPrice;
                    const cost = holding.quantity * holding.avg_price;
                    const profit = currentValue - cost;
                    const profitPercent = (profit / cost) * 100;
                    
                    return (
                      <div key={holding.symbol} className="flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors" onClick={goToTrialRooms}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {holding.symbol.substring(0, 1)}
                          </div>
                          <div>
                            <div className="font-medium">{holding.symbol}</div>
                            <div className="text-xs text-muted-foreground">{holding.quantity} shares</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{currentValue.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                          <div className="text-xs flex items-center justify-end">
                            {profit >= 0 ? (
                              <>
                                <ArrowUpRight className="h-3 w-3 text-finance-profit mr-1" />
                                <span className="text-finance-profit">{profitPercent.toFixed(2)}%</span>
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="h-3 w-3 text-finance-loss mr-1" />
                                <span className="text-finance-loss">{profitPercent.toFixed(2)}%</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }) || <div className="text-muted-foreground text-center py-4">No holdings yet. Visit Trial Room to start trading.</div>}
                  
                  <Button variant="outline" className="w-full" onClick={goToTrialRooms}>View All Holdings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="market" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Market Indices</CardTitle>
                <CardDescription>
                  Today's performance of major indices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketIndices.map((index) => (
                    <div key={index.name} className="flex items-center justify-between">
                      <div className="font-medium">{index.name}</div>
                      <div className="flex items-center gap-2">
                        <div>{index.value.toLocaleString()}</div>
                        <div className={`flex items-center text-xs ${index.change >= 0 ? 'text-finance-profit' : 'text-finance-loss'}`}>
                          {index.change >= 0 ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Sector Performance</CardTitle>
                <CardDescription>
                  Today's performance by sector
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectorPerformanceChart data={trendingSectors} />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Movers Today</CardTitle>
              <CardDescription>
                Stocks with significant price changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {popularStocks.slice(0, 6).map((stock) => (
                  <div key={stock.symbol} className="data-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground truncate">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${stock.price.toFixed(2)}</div>
                        <div className={`text-xs flex justify-end items-center ${stock.change >= 0 ? 'text-finance-profit' : 'text-finance-loss'}`}>
                          {stock.change >= 0 ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground flex justify-between">
                      <div>Vol: {(stock.volume / 1000000).toFixed(1)}M</div>
                      <div>{stock.exchange}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>
                  Personalized stock picks based on your profile
                </CardDescription>
              </div>
              <Info className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {popularStocks.slice(1, 4).map((stock) => (
                  <div key={stock.symbol} className="data-card border-l-4" style={{ borderLeftColor: '#3498DB' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground truncate">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${stock.price.toFixed(2)}</div>
                        <div className={`text-xs flex justify-end items-center ${stock.change >= 0 ? 'text-finance-profit' : 'text-finance-loss'}`}>
                          {stock.change >= 0 ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs">
                      <div className="flex gap-1 mb-2">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">Strong Buy</span>
                        <span className="bg-muted px-2 py-0.5 rounded-full">{stock.sector}</span>
                      </div>
                      <p className="text-muted-foreground">
                        Recommended based on strong financials, positive analyst ratings, and alignment with your investment strategy.
                      </p>
                    </div>
                    <div className="mt-4 flex justify-between">
                      <Button variant="outline" size="sm" className="w-[calc(50%-0.25rem)]">Details</Button>
                      <Button size="sm" className="w-[calc(50%-0.25rem)]">Buy</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>
                Latest trends and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-finance-blue/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-finance-blue" />
                  </div>
                  <div>
                    <h3 className="font-medium">Technology Sector Outperforming</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tech stocks have shown strong performance over the past month, with AI-related companies leading the gains.
                    </p>
                    <div className="mt-2">
                      <Button variant="link" size="sm" className="px-0 h-auto">
                        View Analysis
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-finance-loss/10 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-finance-loss" />
                  </div>
                  <div>
                    <h3 className="font-medium">Energy Sector Facing Headwinds</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Energy stocks are experiencing pressure due to global supply concerns and policy shifts toward renewable energy.
                    </p>
                    <div className="mt-2">
                      <Button variant="link" size="sm" className="px-0 h-auto">
                        View Analysis
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-finance-profit/10 flex items-center justify-center">
                    <LineChart className="h-5 w-5 text-finance-profit" />
                  </div>
                  <div>
                    <h3 className="font-medium">Financial Earnings Season</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Major banks are reporting strong quarterly earnings, exceeding analyst expectations with solid loan growth.
                    </p>
                    <div className="mt-2">
                      <Button variant="link" size="sm" className="px-0 h-auto">
                        View Analysis
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
