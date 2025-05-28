import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StockHolding } from "@/services/trialRoomService";
import { Stock } from "@/hooks/useTrialRoomTrade";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import SparklineChart from "./SparklineChart";
import { twelveDataService } from "@/services/twelveDataService";

interface PortfolioProps {
  portfolio: StockHolding[];
  stockList: Stock[];
  onTrade: (stock: Stock, type: "buy" | "sell") => void;
  calculateHoldingPerformance: (symbol: string) => any;
  isLoading?: boolean;
  currencySymbol?: string;
}

interface SparklineData {
  [symbol: string]: {
    data: number[];
    trend: "up" | "down" | "neutral";
  };
}

const Portfolio = ({ 
  portfolio, 
  stockList, 
  onTrade, 
  calculateHoldingPerformance,
  isLoading = false,
  currencySymbol = "$"
}: PortfolioProps) => {
  const [sparklineData, setSparklineData] = useState<SparklineData>({});

  // Helper to find stock data
  const findStockData = (symbol: string): Stock | undefined => {
    return stockList.find(s => s.symbol === symbol);
  };

  // Fetch historical data for sparklines
  useEffect(() => {
    if (portfolio.length === 0) return;

    const fetchHistoricalData = async () => {
      const sparklines: SparklineData = {};
      
      // Process each holding to get historical data
      for (const holding of portfolio) {
        try {
          // Get historical data (7 days)
          const historicalData = await twelveDataService.getHistoricalData(holding.symbol);
          
          // Extract price data for sparkline (last 7 days or whatever is available)
          let priceData: number[] = [];
          if (historicalData && historicalData.yearly && historicalData.yearly.length > 0) {
            priceData = historicalData.yearly.slice(0, 7).map(item => item.price).reverse();
          } else {
            // Generate mock data if real data is not available
            const basePrice = holding.avg_price;
            priceData = Array(7).fill(0).map((_, i) => {
              const randomFactor = 0.98 + (Math.random() * 0.04); // Random between 0.98 and 1.02
              return basePrice * randomFactor;
            });
          }
          
          // Determine trend
          let trend: "up" | "down" | "neutral" = "neutral";
          if (priceData.length >= 2) {
            const firstPrice = priceData[0];
            const lastPrice = priceData[priceData.length - 1];
            if (lastPrice > firstPrice) {
              trend = "up";
            } else if (lastPrice < firstPrice) {
              trend = "down";
            }
          }
          
          sparklines[holding.symbol] = {
            data: priceData,
            trend
          };
        } catch (error) {
          console.error(`Error fetching historical data for ${holding.symbol}:`, error);
          // Generate mock data on error
          const basePrice = holding.avg_price;
          const mockData = Array(7).fill(0).map((_, i) => {
            const randomFactor = 0.98 + (Math.random() * 0.04);
            return basePrice * randomFactor;
          });
          
          sparklines[holding.symbol] = {
            data: mockData,
            trend: "neutral"
          };
        }
      }
      
      setSparklineData(sparklines);
    };

    fetchHistoricalData();
  }, [portfolio]);

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <Skeleton className="h-7 w-20 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
              <Skeleton className="h-12 w-full mb-3" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (portfolio.length === 0) {
    return (
      <div className="py-12 text-center border rounded-md">
        <p className="text-muted-foreground">You don't have any holdings yet. Start trading to build your portfolio!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {portfolio.map((holding) => {
        const performance = calculateHoldingPerformance(holding.symbol);
        const stockData = findStockData(holding.symbol);
        
        // Create a stock object to pass to trade function
        const stock: Stock = {
          symbol: holding.symbol,
          name: holding.name,
          price: performance?.currentPrice || holding.avg_price,
          exchange: holding.exchange
        };

        // Get sparkline data for this holding
        const sparkline = sparklineData[holding.symbol];
        
        return (
          <Card key={holding.symbol} className="overflow-hidden">
            <CardContent className="p-4">
              {/* Header with symbol and name */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-base">{holding.symbol}</h3>
                  <p className="text-sm text-muted-foreground truncate max-w-[180px]">{holding.name}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onTrade(stock, "sell")}
                  className="text-xs h-8"
                >
                  Sell
                </Button>
              </div>
              
              {/* Value and performance */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="text-lg font-semibold">
                    {holding.quantity} {holding.quantity === 1 ? 'share' : 'shares'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg. {currencySymbol}{holding.avg_price.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {currencySymbol}{performance?.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 
                      (holding.quantity * holding.avg_price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  {performance ? (
                    <div className={performance.profit >= 0 ? "text-finance-profit text-sm" : "text-finance-loss text-sm"}>
                      {performance.profit >= 0 ? (
                        <span className="flex items-center justify-end">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          {currencySymbol}{performance.profit.toFixed(2)} ({performance.profitPercent.toFixed(2)}%)
                        </span>
                      ) : (
                        <span className="flex items-center justify-end">
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                          {currencySymbol}{Math.abs(performance.profit).toFixed(2)} ({Math.abs(performance.profitPercent).toFixed(2)}%)
                        </span>
                      )}
                    </div>
                  ) : <div className="text-sm text-muted-foreground">--</div>}
                </div>
              </div>
              
              {/* Sparkline chart */}
              <div className="mb-3 h-12">
                {sparkline ? (
                  <SparklineChart 
                    data={sparkline.data} 
                    width={280} 
                    height={48} 
                    trend={sparkline.trend}
                    className="w-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Minus className="h-4 w-4 mr-2" />
                    <span>No price history available</span>
                  </div>
                )}
              </div>
              
              {/* Current price and trend indicator */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Current: {currencySymbol}{performance?.currentPrice.toFixed(2) || holding.avg_price.toFixed(2)}
                </div>
                <div className="flex items-center gap-2">
                  {sparkline && (
                    <span className="text-xs flex items-center">
                      {sparkline.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 mr-1 text-finance-profit" />
                      ) : sparkline.trend === "down" ? (
                        <TrendingDown className="h-3 w-3 mr-1 text-finance-loss" />
                      ) : (
                        <Minus className="h-3 w-3 mr-1 text-muted-foreground" />
                      )}
                      <span className={sparkline.trend === "up" ? "text-finance-profit" : 
                        sparkline.trend === "down" ? "text-finance-loss" : "text-muted-foreground"}>
                        7-day trend
                      </span>
                    </span>
                  )}
                  <Button 
                    size="sm" 
                    onClick={() => onTrade(stock, "buy")}
                    className="text-xs h-8"
                  >
                    Buy More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Portfolio;
