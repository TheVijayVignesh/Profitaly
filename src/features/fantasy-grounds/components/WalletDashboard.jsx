import { useState, useEffect } from "react";
import { useFantasy } from "../hooks/useFantasyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Clock, Briefcase, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getMultipleQuotes } from "../utils/stockApi";

const WalletDashboard = () => {
  const { fantasyData, calculatePortfolioValue, calculateROI } = useFantasy();
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [roi, setROI] = useState(0);
  const [updatedHoldings, setUpdatedHoldings] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const refreshPortfolioData = async () => {
    if (!fantasyData) return;
    
    setIsRefreshing(true);
    try {
      // Get portfolio value
      const value = await calculatePortfolioValue();
      setPortfolioValue(value);
      
      // Calculate ROI
      const calculatedROI = await calculateROI();
      setROI(calculatedROI);
      
      // Refresh holdings with current prices
      if (fantasyData.holdings && fantasyData.holdings.length > 0) {
        const symbols = fantasyData.holdings.map(h => h.symbol);
        
        try {
          const quotes = await getMultipleQuotes(symbols);
          
          const updated = fantasyData.holdings.map(holding => {
            const quote = quotes[holding.symbol];
            const currentPrice = quote ? parseFloat(quote.close) : holding.boughtPrice;
            const priceChange = currentPrice - holding.boughtPrice;
            const priceChangePercent = (priceChange / holding.boughtPrice) * 100;
            
            return {
              ...holding,
              currentPrice,
              priceChange,
              priceChangePercent,
              totalValue: currentPrice * holding.qty
            };
          });
          
          setUpdatedHoldings(updated);
        } catch (error) {
          console.error("Error fetching stock quotes:", error);
          // Fall back to using bought prices if API call fails
          const updated = fantasyData.holdings.map(holding => ({
            ...holding,
            currentPrice: holding.boughtPrice,
            priceChange: 0,
            priceChangePercent: 0,
            totalValue: holding.boughtPrice * holding.qty
          }));
          
          setUpdatedHoldings(updated);
        }
      }
      
      toast({
        title: "Portfolio Updated",
        description: "Latest market data has been applied to your portfolio.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error refreshing portfolio data:", error);
      toast({
        title: "Update Failed",
        description: "Could not refresh portfolio data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    refreshPortfolioData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(refreshPortfolioData, 30000);
    
    return () => clearInterval(intervalId);
  }, [fantasyData]);
  
  if (!fantasyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Your wallet is not set up yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please join a league to get started.</p>
        </CardContent>
      </Card>
    );
  }
  
  const netWorth = fantasyData.wallet + portfolioValue;
  const percentInvested = (portfolioValue / netWorth) * 100;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Wallet Balance</CardTitle>
            <CardDescription>Available funds for trading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-primary mr-2" />
              <span className="text-3xl font-bold">
                ₹{fantasyData.wallet.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Net Worth</CardTitle>
            <CardDescription>Total value of wallet + holdings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-primary mr-2" />
              <span className="text-3xl font-bold">
                ₹{netWorth.toLocaleString()}
              </span>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Portfolio: ₹{portfolioValue.toLocaleString()}</span>
                <span>{percentInvested.toFixed(1)}%</span>
              </div>
              <Progress value={percentInvested} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Performance</CardTitle>
              <CardDescription>Your return on investment</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshPortfolioData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {roi >= 0 ? (
              <TrendingUp className="h-8 w-8 text-success mr-2" />
            ) : (
              <TrendingDown className="h-8 w-8 text-destructive mr-2" />
            )}
            <span className={`text-3xl font-bold ${roi >= 0 ? 'text-success' : 'text-destructive'}`}>
              {roi > 0 ? '+' : ''}{roi.toFixed(2)}%
            </span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            <span>Started with ₹{fantasyData.initialWallet.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Holdings</CardTitle>
          <CardDescription>Stocks in your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {updatedHoldings.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>You don't have any holdings yet.</p>
              <p className="text-sm mt-2">Go to the Market tab to buy stocks.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Symbol</th>
                    <th className="text-right py-3 px-2">Quantity</th>
                    <th className="text-right py-3 px-2">Avg. Buy</th>
                    <th className="text-right py-3 px-2">Current</th>
                    <th className="text-right py-3 px-2">Change</th>
                    <th className="text-right py-3 px-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {updatedHoldings.map((holding) => (
                    <tr key={holding.symbol} className="border-b">
                      <td className="py-3 px-2 font-medium">{holding.symbol}</td>
                      <td className="text-right py-3 px-2">{holding.qty}</td>
                      <td className="text-right py-3 px-2">₹{holding.boughtPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right py-3 px-2">₹{holding.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className={`text-right py-3 px-2 ${holding.priceChangePercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {holding.priceChangePercent >= 0 ? '+' : ''}{holding.priceChangePercent.toFixed(2)}%
                      </td>
                      <td className="text-right py-3 px-2 font-medium">₹{holding.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDashboard; 