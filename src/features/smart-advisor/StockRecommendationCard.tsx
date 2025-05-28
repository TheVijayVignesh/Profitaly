import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, TrendingUp, TrendingDown, Info, ChevronDown, ChevronUp } from "lucide-react";
import { StockRecommendation } from "./types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StockRecommendationCardProps {
  stock: StockRecommendation;
  onViewDetails: (ticker: string) => void;
  isLoading?: boolean;
}

const StockRecommendationCard = ({ 
  stock, 
  onViewDetails, 
  isLoading = false 
}: StockRecommendationCardProps) => {
  const [expanded, setExpanded] = useState(false);

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

  // Generate sparkline chart data if not provided
  const chartData = stock.chartData || Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: stock.currentPrice ? stock.currentPrice * (0.9 + Math.random() * 0.2) : 100 * (0.9 + Math.random() * 0.2)
  }));

  return (
    <Card className="w-full overflow-hidden hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
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
            <CardDescription>{stock.companyName}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">
              {formatCurrency(stock.currentPrice)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        {/* Mini Sparkline Chart */}
        <div className="h-16 mt-2 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={stock.changePercent && stock.changePercent >= 0 ? "#22c55e" : "#ef4444"} 
                strokeWidth={2} 
                dot={false} 
              />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                formatter={(value) => [formatCurrency(Number(value)), 'Price']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
          <div>
            <span className="text-muted-foreground">Market Cap</span>
            <div className="font-medium">{formatMarketCap(stock.marketCap)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">P/E Ratio</span>
            <div className="font-medium">{stock.pe?.toFixed(2) || 'N/A'}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Dividend Yield</span>
            <div className="font-medium">{stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : 'N/A'}</div>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && stock.explanation && (
          <>
            <Separator className="my-3" />
            <div className="mt-3 text-sm">
              <h4 className="font-medium mb-1 flex items-center">
                <Info className="h-4 w-4 mr-1 text-blue-500" />
                Why This Stock Matches Your Profile
              </h4>
              <p className="text-muted-foreground">{stock.explanation}</p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2 pb-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          disabled={!stock.explanation}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              More
            </>
          )}
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => onViewDetails(stock.ticker)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "View Details"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StockRecommendationCard;
