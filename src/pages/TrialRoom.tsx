import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// New imports
import { useState, useEffect } from "react";
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
import { TrendingUp, Target, Activity, Search } from "lucide-react";

const TrialRoom = () => {
  console.log("TrialRoom component rendering");

  const [setupCompleted, setSetupCompleted] = useState(false);
  const [detailStock, setDetailStock] = useState<Stock | null>(null);

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

  // If we don't have trial room data and setup isn't completed yet, show setup form
  if (!trialRoomData && !setupCompleted) {
    console.log("No trial room data, showing setup form");
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trial Room</h1>
            <p className="text-muted-foreground">
              Practice trading with virtual money. No real risk involved!
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Risk-Free Trading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Practice your trading strategies with virtual money. Learn without losing real funds.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Real Market Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Trade with live market data and prices. Experience realistic trading conditions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor your portfolio performance and track your trading progress over time.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Set up your virtual trading account to begin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SetupForm onSetupComplete={handleSetupComplete} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main trading interface
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trial Room</h1>
          <p className="text-muted-foreground">
            Practice trading with ${trialRoomData?.cash_left?.toLocaleString() || "10,000"} virtual money
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search stocks..."
              className="pl-8 pr-4 py-2 border rounded-md w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <BalanceSummary
        totalPortfolioValue={totalPortfolioValue}
        cashLeft={trialRoomData?.cash_left || 0}
        currencySymbol={currencySymbol}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {/* Main Trading Area */}
        <div className="md:col-span-2 space-y-4">
          <Tabs defaultValue="stocks" className="w-full">
            <TabsList>
              <TabsTrigger value="stocks">Stocks</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="stocks" className="space-y-4">
              <StockList
                stocks={filteredStocks}
                onSelectStock={handleSelectStock}
                isLoading={isLoadingStocks}
                searchQuery={searchQuery}
              />
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-4">
              <Portfolio
                holdings={trialRoomData?.holdings || []}
                performance={performance}
                currencySymbol={currencySymbol}
                calculateHoldingPerformance={calculateHoldingPerformance}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <TransactionHistory
                transactions={trialRoomData?.transactions || []}
                currencySymbol={currencySymbol}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {detailStock && (
            <StockDetail
              stock={detailStock}
              onTrade={(stock, type) => {
                setSelectedStock(stock);
                setTradeType(type);
                openTradeDialog();
              }}
              currencySymbol={currencySymbol}
            />
          )}

          <PerformanceSummary
            performance={performance}
            currencySymbol={currencySymbol}
          />

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setSetupCompleted(false)}
                >
                  <Target className="mr-2 h-4 w-4" />
                  Reset Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trade Dialog */}
      <TradeDialog
        stock={selectedStock}
        quantity={tradeQuantity}
        tradeType={tradeType}
        isOpen={!!selectedStock}
        onClose={() => setSelectedStock(null)}
        onQuantityChange={setTradeQuantity}
        onExecute={executeTrade}
        isExecuting={isTrading}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};

export default TrialRoom;
