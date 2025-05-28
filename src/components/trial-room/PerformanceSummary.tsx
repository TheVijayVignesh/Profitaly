import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StockHolding, Transaction } from "@/services/trialRoomService";
import { Skeleton } from "@/components/ui/skeleton";

interface PerformanceSummaryProps {
  portfolio: StockHolding[];
  transactions: Transaction[];
  initialBalance: number;
  cashBalance: number;
  totalValue: number;
  roi: number;
  isLoading?: boolean;
  currencySymbol?: string;
}

const PerformanceSummary = ({ 
  portfolio,
  transactions,
  initialBalance, 
  cashBalance,
  totalValue, 
  roi,
  isLoading = false,
  currencySymbol = "$"
}: PerformanceSummaryProps) => {
  // Calculate holdings value (total value - cash)
  const holdingsValue = totalValue - cashBalance;
  
  // Count number of unique stocks
  const uniqueStocksCount = portfolio.length;
  
  // Calculate total transactions
  const totalTransactionsCount = transactions.length;
  
  // Calculate buy and sell counts
  const buyTransactionsCount = transactions.filter(t => t.type === "buy").length;
  const sellTransactionsCount = transactions.filter(t => t.type === "sell").length;

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-40" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Initial Investment</div>
            <div className="text-2xl font-bold mt-1">{currencySymbol}{initialBalance.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Current Portfolio Value</div>
            <div className="text-2xl font-bold mt-1">{currencySymbol}{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Return on Investment</div>
            <div className={`text-2xl font-bold mt-1 flex items-center ${roi >= 0 ? 'text-finance-profit' : 'text-finance-loss'}`}>
              {roi >= 0 ? (
                <ArrowUpRight className="mr-1 h-5 w-5" />
              ) : (
                <ArrowDownRight className="mr-1 h-5 w-5" />
              )}
              {roi.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Cash Balance</div>
            <div className="text-2xl font-bold mt-1">{currencySymbol}{cashBalance.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {((cashBalance / totalValue) * 100).toFixed(1)}% of portfolio
        </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Current Holdings Value</div>
            <div className="text-2xl font-bold mt-1">{currencySymbol}{holdingsValue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {((holdingsValue / totalValue) * 100).toFixed(1)}% of portfolio
        </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
          <div className="text-sm text-muted-foreground">Total Profit/Loss</div>
            <div className={`text-2xl font-bold mt-1 ${totalValue - initialBalance >= 0 ? 'text-finance-profit' : 'text-finance-loss'}`}>
              {totalValue - initialBalance >= 0 ? '+' : ''}
              {currencySymbol}{(totalValue - initialBalance).toLocaleString()}
          </div>
          </CardContent>
        </Card>
        </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Unique Stocks</div>
            <div className="text-2xl font-bold mt-1">{uniqueStocksCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Buy Transactions</div>
            <div className="text-2xl font-bold mt-1">{buyTransactionsCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Sell Transactions</div>
            <div className="text-2xl font-bold mt-1">{sellTransactionsCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceSummary;
