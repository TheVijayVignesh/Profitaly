import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stock } from "@/hooks/useTrialRoomTrade";
import { Skeleton } from "@/components/ui/skeleton";

interface StockListProps {
  stocks: Stock[];
  onTrade: (stock: Stock, type: "buy" | "sell") => void;
  isLoading?: boolean;
  currencySymbol?: string;
}

const StockList = ({ stocks, onTrade, isLoading = false, currencySymbol = "$" }: StockListProps) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="py-2 px-4 text-left font-medium">Symbol</th>
              <th className="py-2 px-4 text-left font-medium">Name</th>
              <th className="py-2 px-4 text-left font-medium">Price</th>
              <th className="py-2 px-4 text-left font-medium">Change</th>
              <th className="py-2 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {Array(5).fill(0).map((_, index) => (
              <tr key={index}>
                <td className="py-2 px-4"><Skeleton className="h-5 w-16" /></td>
                <td className="py-2 px-4"><Skeleton className="h-5 w-36" /></td>
                <td className="py-2 px-4"><Skeleton className="h-5 w-20" /></td>
                <td className="py-2 px-4"><Skeleton className="h-5 w-16" /></td>
                <td className="py-2 px-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (stocks.length === 0) {
    return (
      <div className="py-12 text-center border rounded-md">
        <p className="text-muted-foreground">No stocks found. Try changing your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="py-2 px-4 text-left font-medium">Symbol</th>
            <th className="py-2 px-4 text-left font-medium">Name</th>
            <th className="py-2 px-4 text-left font-medium">Price</th>
            <th className="py-2 px-4 text-left font-medium">Change</th>
            <th className="py-2 px-4 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {stocks.slice(0, 25).map((stock) => (
            <tr key={stock.symbol} className="hover:bg-muted/50">
              <td className="py-2 px-4 font-medium">{stock.symbol}</td>
              <td className="py-2 px-4">{stock.name}</td>
              <td className="py-2 px-4">{currencySymbol}{stock.price.toFixed(2)}</td>
              <td className="py-2 px-4">
                {stock.changePercent !== undefined ? (
                  <span className={stock.changePercent >= 0 ? "text-finance-profit flex items-center" : "text-finance-loss flex items-center"}>
                    {stock.changePercent >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-muted-foreground">--</span>
                )}
              </td>
              <td className="py-2 px-4">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => onTrade(stock, "buy")}
                  >
                    Buy
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onTrade(stock, "sell")}
                  >
                    Sell
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockList;
