import { Stock } from "@/hooks/useTrialRoomTrade";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, PlusCircle, MinusCircle } from "lucide-react";
import StockNewsPanel from "./StockNewsPanel";
import AIInsightPanel from "./AIInsightPanel";
import { useState, useEffect } from "react";
import { newsApiService } from "@/services/newsApiService";

interface StockDetailProps {
  stock: Stock | null;
  onTrade: (stock: Stock, type: "buy" | "sell") => void;
  currencySymbol?: string;
  hasHolding?: boolean;
}

const StockDetail = ({ stock, onTrade, currencySymbol = "$", hasHolding = false }: StockDetailProps) => {
  const [newsHeadlines, setNewsHeadlines] = useState<string[]>([]);

  // Fetch news headlines for AI analysis when stock changes
  useEffect(() => {
    if (!stock) {
      setNewsHeadlines([]);
      return;
    }

    const fetchNewsHeadlines = async () => {
      try {
        const newsData = await newsApiService.getStockNews(stock.symbol, stock.name, 3);
        const headlines = newsData.map(item => item.title);
        setNewsHeadlines(headlines);
      } catch (error) {
        console.error("Error fetching news headlines:", error);
        setNewsHeadlines([]);
      }
    };

    fetchNewsHeadlines();
  }, [stock]);

  // No stock selected
  if (!stock) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Stock Details</CardTitle>
          <CardDescription>Select a stock to view details</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12 text-muted-foreground">
          Use the search bar above to find and select a stock
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stock Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center">
                {stock.symbol}
                <span className="text-sm ml-2 text-muted-foreground">
                  {stock.exchange}
                </span>
              </CardTitle>
              <CardDescription className="text-base">{stock.name}</CardDescription>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold">
                {currencySymbol}{stock.price.toFixed(2)}
              </div>
              {stock.changePercent !== undefined && (
                <div className={stock.changePercent >= 0 ? "text-finance-profit flex items-center" : "text-finance-loss flex items-center"}>
                  {stock.changePercent >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  {stock.change !== undefined && (
                    <span className="mr-1">
                      {stock.changePercent >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                    </span>
                  )}
                  ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => onTrade(stock, "buy")}
              className="flex-1 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 active:shadow-inner"
            >
              <span className="flex items-center">
                <PlusCircle className="mr-1 h-4 w-4" />
                Buy
              </span>
            </Button>
            <Button
              onClick={() => onTrade(stock, "sell")}
              className="flex-1 bg-red-600 hover:bg-red-700 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 active:shadow-inner"
              disabled={!hasHolding}
            >
              <span className="flex items-center">
                <MinusCircle className="mr-1 h-4 w-4" />
                Sell
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* News and AI Insight Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StockNewsPanel stock={stock} />
        <AIInsightPanel stock={stock} newsHeadlines={newsHeadlines} />
      </div>
    </div>
  );
};

export default StockDetail;
