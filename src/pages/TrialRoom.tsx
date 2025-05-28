import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// New imports
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTrialRoomTrade, Stock } from "@/hooks/useTrialRoomTrade";
import SetupForm from "@/components/trial-room/SetupForm";

// Components
import StockList from "@/components/trial-room/StockList";
import Portfolio from "@/components/trial-room/Portfolio";
import TransactionHistory from "@/components/trial-room/TransactionHistory";
import PerformanceSummary from "@/components/trial-room/PerformanceSummary";
import TradeDialog from "@/components/trial-room/TradeDialog";
import BalanceSummary from "@/components/trial-room/BalanceSummary";
import SearchBar from "@/components/trial-room/SearchBar";
import StockDetail from "@/components/trial-room/StockDetail";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Add mock user for development
const MOCK_USER = {
  uid: "mock-user-123",
  email: "demo@example.com",
  displayName: "Demo User"
};

const TrialRoom = () => {
  console.log("TrialRoom component rendering");
  
  const [setupCompleted, setSetupCompleted] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const [useMockUser, setUseMockUser] = useState(false);
  const [detailStock, setDetailStock] = useState<Stock | null>(null);
  
  // For development, use a mock user if authentication is taking too long
  useEffect(() => {
    // Use mock user immediately in development
    if (import.meta.env.DEV) {
      console.log("Using mock user for development");
      setUseMockUser(true);
    } else {
      // In production, wait a bit before falling back to mock user
      const timer = setTimeout(() => {
        if (authLoading || !user) {
          console.log("Using mock user after timeout");
          setUseMockUser(true);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [authLoading, user]);
  
  // Log whenever auth state changes
  useEffect(() => {
    console.log("Auth state changed:", { user, authLoading, useMockUser });
  }, [user, authLoading, useMockUser]);
  
  const {
    trialRoomData,
    isLoading,
    selectedStock,
    tradeQuantity,
    tradeType,
    isTrading,
    stockList,
    isLoadingStocks,
    searchQuery,
    filteredStocks,
    
    setTradeQuantity,
    setTradeType,
    setSelectedStock,
    setSearchQuery,
    openTradeDialog,
    executeTrade,
    
    calculatePortfolioPerformance,
    calculateHoldingPerformance,
    getCurrencySymbol
  } = useTrialRoomTrade();

  // Log trial room data changes
  useEffect(() => {
    console.log("Trial room data changed:", { 
      hasData: !!trialRoomData,
      market: trialRoomData?.market,
      stocksLoaded: stockList.length,
      isLoading
    });
  }, [trialRoomData, stockList, isLoading]);

  // Handle setup completion
  const handleSetupComplete = () => {
    setSetupCompleted(true);
  };

  // Handle stock selection from search
  const handleSelectStock = (stock: Stock) => {
    setDetailStock(stock);
  };

  // Get performance metrics
  const performance = calculatePortfolioPerformance();
  const currencySymbol = trialRoomData ? getCurrencySymbol(trialRoomData.market) : "$";
  
  // Calculate total portfolio value (cash + holdings)
  const totalPortfolioValue = (trialRoomData?.cash_left || 0) + (performance?.totalValue || 0);

  // If user is not authenticated, show login message or use mock user
  if (!user && !useMockUser) {
    console.log("No user and no mock user, showing login prompt");
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to access the Trial Room and practice trading with virtual money.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Use mock user for development if needed
  const effectiveUser = user || (useMockUser ? MOCK_USER : null);

  // If we don't have trial room data and setup isn't completed yet, show setup form
  if (!trialRoomData && !setupCompleted) {
    console.log("No trial room data, showing setup form");
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trial Room</h1>
          <p className="text-muted-foreground">Practice trading with virtual money. No real risk!</p>
        </div>
        
        <div className="flex justify-center pt-8">
          <SetupForm onSetupComplete={handleSetupComplete} />
        </div>
      </div>
    );
  }

  console.log("Rendering full trial room UI");
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trial Room</h1>
          <p className="text-muted-foreground">Practice trading with virtual money. No real risk!</p>
        </div>
        
        <BalanceSummary 
          balance={trialRoomData?.cash_left || 0}
          totalValue={totalPortfolioValue}
          roi={performance?.roi || 0}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* Enhanced Global Stock Search */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoading={isLoadingStocks}
        onSelectStock={handleSelectStock}
        currencySymbol={currencySymbol}
      />
      
      {/* Stock Detail View (shown when a stock is selected) */}
      {detailStock && (
        <div className="mb-6">
          <StockDetail
            stock={detailStock}
            onTrade={openTradeDialog}
            currencySymbol={currencySymbol}
            hasHolding={trialRoomData?.holdings?.some(h => h.symbol === detailStock.symbol) || false}
          />
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setDetailStock(null)}
              className="text-sm"
            >
              Close Detail View
            </Button>
          </div>
          <Separator className="my-6" />
        </div>
      )}

      <Tabs defaultValue={detailStock ? "portfolio" : "stocks"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="stocks">Available Stocks</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stocks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Stocks</CardTitle>
              <CardDescription>
                Browse stocks and practice trading. All trades use virtual money.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StockList 
                stocks={filteredStocks} 
                onTrade={(stock) => {
                  setDetailStock(stock);
                  openTradeDialog(stock, "buy");
                }}
                isLoading={isLoadingStocks}
                currencySymbol={currencySymbol}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>My Portfolio</CardTitle>
                <CardDescription>
                  Your current holdings and their performance.
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Cash Remaining</div>
                <div className="text-2xl font-bold">
                  {currencySymbol}{(trialRoomData?.cash_left || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Portfolio 
                portfolio={trialRoomData?.holdings || []}
                stockList={stockList}
                onTrade={(stock, type) => {
                  setDetailStock(stock);
                  openTradeDialog(stock, type);
                }}
                calculateHoldingPerformance={calculateHoldingPerformance}
                isLoading={isLoading}
                currencySymbol={currencySymbol}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Record of your buy and sell transactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionHistory 
                transactions={trialRoomData?.transactions || []}
                isLoading={isLoading}
                currencySymbol={currencySymbol}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>
                Overview of your trial room performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceSummary 
                portfolio={trialRoomData?.holdings || []}
                transactions={trialRoomData?.transactions || []}
                initialBalance={trialRoomData?.wallet || 0}
                cashBalance={trialRoomData?.cash_left || 0}
                totalValue={performance?.totalValue || 0}
                roi={performance?.roi || 0}
                isLoading={isLoading}
                currencySymbol={currencySymbol}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Trade Dialog */}
      <TradeDialog
        open={!!selectedStock}
        onOpenChange={(open) => !open && setSelectedStock(null)}
        selectedStock={selectedStock}
        tradeType={tradeType}
        onTradeTypeChange={setTradeType}
        quantity={tradeQuantity}
        onQuantityChange={setTradeQuantity}
        onExecuteTrade={executeTrade}
        isLoading={isTrading}
        currencySymbol={currencySymbol}
        maxQuantity={tradeType === "sell" ? 
          trialRoomData?.holdings.find(h => h.symbol === selectedStock?.symbol)?.quantity || 0 :
          selectedStock ? Math.floor((trialRoomData?.cash_left || 0) / (selectedStock?.price || 1)) : 0
        }
      />
    </div>
  );
};

export default TrialRoom;
