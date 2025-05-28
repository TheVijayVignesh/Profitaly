import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  BarChart2, 
  Percent 
} from "lucide-react";
import { StockRecommendation } from "./types";
import { twelveDataService } from "@/services/twelveDataService";
import { finnhubService } from "@/services/finnhubService";
import { perplexityService } from "@/services/perplexityService";

interface StockDetailViewProps {
  stock: StockRecommendation;
  onBack: () => void;
}

interface HistoricalDataPoint {
  date: string;
  value: number;
}

const StockDetailView = ({ stock, onBack }: StockDetailViewProps) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<HistoricalDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1m' | '6m' | '1y'>('6m');
  const [detailedExplanation, setDetailedExplanation] = useState<string>(stock.explanation || '');
  const [metrics, setMetrics] = useState({
    pe: stock.pe,
    dividendYield: stock.dividendYield,
    marketCap: stock.marketCap,
    volume: undefined as number | undefined,
    high52w: undefined as number | undefined,
    low52w: undefined as number | undefined
  });

  // Format currency with commas
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format market cap in billions/millions
  const formatMarketCap = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    return formatCurrency(value);
  };

  // Format percent with + or - sign
  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Format volume with commas
  const formatVolume = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Fetch detailed stock data
  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      try {
        // Fetch historical data for chart
        const historicalData = await twelveDataService.getHistoricalData(stock.ticker);
        
        // Determine the date range based on timeframe
        const now = new Date();
        let startDate = new Date();
        
        if (timeframe === '1m') {
          startDate.setMonth(now.getMonth() - 1);
        } else if (timeframe === '6m') {
          startDate.setMonth(now.getMonth() - 6);
        } else if (timeframe === '1y') {
          startDate.setFullYear(now.getFullYear() - 1);
        }
        
        // Filter and format the data
        let formattedData: HistoricalDataPoint[] = [];
        
        if (historicalData && historicalData.yearly && historicalData.yearly.length > 0) {
          formattedData = historicalData.yearly
            .filter((point: any) => {
              const pointDate = new Date(point.date);
              return pointDate >= startDate;
            })
            .map((point: any) => ({
              date: point.date,
              value: point.close || point.price
            }));
        } else {
          // Generate mock data if API fails
          const days = timeframe === '1m' ? 30 : timeframe === '6m' ? 180 : 365;
          const basePrice = stock.currentPrice || 100;
          
          formattedData = Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - i));
            
            // Create somewhat realistic price movements
            const randomWalk = Math.random() * 0.04 - 0.02; // -2% to +2%
            const trend = (i / days) * 0.1; // Overall trend
            const seasonality = Math.sin(i / 30 * Math.PI) * 0.02; // Cyclical pattern
            
            const priceChange = basePrice * (randomWalk + trend + seasonality);
            const price = basePrice + priceChange;
            
            return {
              date: date.toISOString().split('T')[0],
              value: Number(price.toFixed(2))
            };
          });
        }
        
        setChartData(formattedData);
        
        // Fetch additional metrics
        const quote = await finnhubService.getStockQuote(stock.ticker);
        const profile = await finnhubService.getCompanyProfile(stock.ticker);
        
        // Update metrics with real data if available
        setMetrics({
          pe: profile.pe || stock.pe,
          dividendYield: profile.dividendYield || stock.dividendYield,
          marketCap: profile.marketCapitalization || stock.marketCap,
          volume: quote.v,
          high52w: quote.h,
          low52w: quote.l
        });
        
        // Fetch detailed AI explanation if not already provided
        if (!stock.explanation) {
          const aiAnalysis = await perplexityService.getStockAnalysis(stock.ticker, stock.companyName);
          if (aiAnalysis && aiAnalysis.text) {
            setDetailedExplanation(aiAnalysis.text);
          }
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
        // Use existing data if available or generate mock data
        if (!chartData.length) {
          const days = timeframe === '1m' ? 30 : timeframe === '6m' ? 180 : 365;
          const basePrice = stock.currentPrice || 100;
          
          const mockData = Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - i));
            return {
              date: date.toISOString().split('T')[0],
              value: basePrice * (0.9 + Math.random() * 0.2)
            };
          });
          
          setChartData(mockData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [stock.ticker, timeframe]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Recommendations
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant={timeframe === '1m' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setTimeframe('1m')}
          >
            1M
          </Button>
          <Button 
            variant={timeframe === '6m' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setTimeframe('6m')}
          >
            6M
          </Button>
          <Button 
            variant={timeframe === '1y' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setTimeframe('1y')}
          >
            1Y
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center">
                {stock.ticker}
                {stock.changePercent !== undefined && (
                  <Badge 
                    className={`ml-2 ${stock.changePercent >= 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    {stock.changePercent >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {formatPercent(stock.changePercent)}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-lg">{stock.companyName}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {formatCurrency(stock.currentPrice)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stock Chart */}
          <div className="h-72">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Price']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Price" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Key Metrics */}
          <div>
            <h3 className="text-lg font-medium mb-3">Key Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Market Cap</div>
                  <div className="font-medium">{formatMarketCap(metrics.marketCap)}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <BarChart2 className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-sm text-muted-foreground">P/E Ratio</div>
                  <div className="font-medium">{metrics.pe?.toFixed(2) || 'N/A'}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Percent className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Dividend Yield</div>
                  <div className="font-medium">{metrics.dividendYield ? `${metrics.dividendYield.toFixed(2)}%` : 'N/A'}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Volume</div>
                  <div className="font-medium">{formatVolume(metrics.volume)}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-sm text-muted-foreground">52W High</div>
                  <div className="font-medium">{formatCurrency(metrics.high52w)}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <div>
                  <div className="text-sm text-muted-foreground">52W Low</div>
                  <div className="font-medium">{formatCurrency(metrics.low52w)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* AI Analysis */}
          <div>
            <h3 className="text-lg font-medium mb-3">AI Analysis</h3>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p>{detailedExplanation}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockDetailView;
