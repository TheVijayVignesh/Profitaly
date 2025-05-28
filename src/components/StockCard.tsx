import { useState, useEffect, memo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { finnhubService } from "@/services/finnhubService";
import type { CompanySymbol } from "@/services/searchService";
import { popularStocks } from "@/services/mockData";

interface StockCardProps {
  company: CompanySymbol;
  onClick: () => void;
}

const StockCard = ({ company, onClick }: StockCardProps) => {
  const [priceData, setPriceData] = useState<{ price: number; change: number; changePercent: number; volume: number }>({ price: 0, change: 0, changePercent: 0, volume: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(false);

    const fetchPrice = async () => {
      try {
        const data = await finnhubService.getStockQuote(company.symbol);
        if (isMounted) {
          setPriceData({
            price: parseFloat(data.c) || 0,
            change: parseFloat(data.d) || 0,
            changePercent: parseFloat(data.dp) || 0,
            volume: parseInt(data.v) || 0
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error(`Error fetching price for ${company.symbol}:`, error);
        if (isMounted) {
          // Find fallback data from mock data
          const mockStock = popularStocks.find(stock => stock.symbol === company.symbol);
          if (mockStock) {
            setPriceData({
              price: mockStock.price,
              change: mockStock.change,
              changePercent: mockStock.changePercent,
              volume: mockStock.volume
            });
          } else {
            // Generate synthetic data based on symbol hash for consistency
            const hash = company.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const basePrice = (hash % 1000) + 50; // Price between 50-1050
            const change = (Math.random() * 10) - 5; // Change between -5 and 5
            const percentChange = (change / basePrice) * 100;
            
            setPriceData({
              price: basePrice,
              change: parseFloat(change.toFixed(2)),
              changePercent: parseFloat(percentChange.toFixed(2)),
              volume: Math.floor(Math.random() * 10000000)
            });
          }
          setError(true);
          setIsLoading(false);
        }
      }
    };
    
    fetchPrice();
    
    return () => {
      isMounted = false;
    };
  }, [company.symbol]);

  if (isLoading) {
    return (
      <div className="data-card cursor-pointer animate-pulse" onClick={onClick}>
        <div className="flex justify-between items-start">
          <div>
            <div className="h-5 w-20 bg-muted rounded"></div>
            <div className="h-4 w-32 bg-muted rounded mt-2"></div>
          </div>
          <div className="text-right">
            <div className="h-5 w-16 bg-muted rounded"></div>
            <div className="h-4 w-24 bg-muted rounded mt-2"></div>
          </div>
        </div>
        <div className="mt-4 h-4 w-full bg-muted rounded"></div>
      </div>
    );
  }

  // Always return a card with some data, never blank
  return (
    <div className="data-card cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">{company.symbol}</div>
          <div className="text-sm text-muted-foreground truncate">{company.name}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold">${priceData.price.toFixed(2)}</div>
          <div className={`text-xs flex items-center justify-end ${priceData.change >= 0 ? 'text-finance-profit' : 'text-finance-loss'}`}>
            {priceData.change >= 0 ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {priceData.change >= 0 ? '+' : ''}{priceData.change.toFixed(2)} ({priceData.changePercent.toFixed(2)}%)
          </div>
          {error && (
            <div className="text-xs text-muted-foreground mt-1">(Using est. data)</div>
          )}
        </div>
      </div>
      <div className="mt-4 text-xs text-muted-foreground flex justify-between">
        <div>Vol: {(priceData.volume / 1000000).toFixed(1)}M</div>
        <div>{company.exchange}</div>
      </div>
    </div>
  );
};

export default memo(StockCard);