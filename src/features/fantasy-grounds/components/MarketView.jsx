import { useState, useEffect } from "react";
import { useFantasy } from "../hooks/useFantasyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getStockPrice, searchStocks, getTimeSeriesData } from "../utils/stockApi";
import { SearchIcon, TrendingUpIcon, TrendingDownIcon, RefreshCwIcon, ArrowRightIcon, CheckIcon, XIcon } from "lucide-react";

const MarketView = () => {
  const { fantasyData, buyStock, sellStock } = useFantasy();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockPrice, setStockPrice] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("buy"); // 'buy' or 'sell'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Get stock search results from API
      const results = await searchStocks(searchQuery, fantasyData?.market);
      setSearchResults(results || []);
    } catch (error) {
      console.error("Error searching stocks:", error);
      toast({
        title: "Search Error",
        description: "Failed to search for stocks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a stock to view details
  const handleSelectStock = async (stock) => {
    setSelectedStock(stock);
    setQuantity(1);
    await fetchStockData(stock);
  };

  // Fetch stock price and chart data
  const fetchStockData = async (stock) => {
    setIsRefreshing(true);
    
    try {
      // Get current price
      const price = await getStockPrice(stock.symbol, fantasyData?.market);
      setStockPrice(price);
      
      // Get historical data for chart
      const timeSeriesData = await getTimeSeriesData(stock.symbol, "1day", 30);
      
      // Format data for chart - simplified for now
      const labels = timeSeriesData.map(data => data.datetime.split(' ')[0]);
      const prices = timeSeriesData.map(data => parseFloat(data.close));
      
      setChartData({
        labels,
        values: prices
      });
    } catch (error) {
      console.error("Error fetching stock data:", error);
      toast({
        title: "Data Error",
        description: "Failed to fetch stock data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refresh stock data
  const refreshStockData = async () => {
    if (!selectedStock) return;
    await fetchStockData(selectedStock);
  };

  // Handle opening buy dialog
  const openBuyDialog = () => {
    setDialogMode("buy");
    setIsDialogOpen(true);
  };

  // Handle opening sell dialog
  const openSellDialog = () => {
    setDialogMode("sell");
    setIsDialogOpen(true);
  };

  // Handle stock purchase
  const handleBuyStock = async () => {
    if (!selectedStock || !stockPrice || quantity <= 0) return;
    
    setIsBuying(true);
    try {
      await buyStock(selectedStock.symbol, quantity, stockPrice);
      
      toast({
        title: "Purchase Successful",
        description: `You bought ${quantity} shares of ${selectedStock.symbol} at ₹${stockPrice.toLocaleString()}.`,
        duration: 5000,
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error buying stock:", error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to buy stock. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBuying(false);
    }
  };

  // Handle stock sale
  const handleSellStock = async () => {
    if (!selectedStock || !stockPrice || quantity <= 0) return;
    
    setIsSelling(true);
    try {
      await sellStock(selectedStock.symbol, quantity, stockPrice);
      
      toast({
        title: "Sale Successful",
        description: `You sold ${quantity} shares of ${selectedStock.symbol} at ₹${stockPrice.toLocaleString()}.`,
        duration: 5000,
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error selling stock:", error);
      toast({
        title: "Sale Failed",
        description: error.message || "Failed to sell stock. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSelling(false);
    }
  };

  // Check if user owns the selected stock and how many shares
  const getOwnedQuantity = () => {
    if (!selectedStock || !fantasyData?.holdings) return 0;
    
    const holding = fantasyData.holdings.find(h => h.symbol === selectedStock.symbol);
    return holding ? holding.qty : 0;
  };

  if (!fantasyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market</CardTitle>
          <CardDescription>Your wallet is not set up yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please join a league to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Market Search</CardTitle>
          <CardDescription>
            Search for stocks to trade in the {fantasyData.market} market
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by name or symbol (e.g., TCS, Reliance)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <RefreshCwIcon className="h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
          </form>
          
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Search Results</h3>
              <div className="space-y-2">
                {searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="p-3 border rounded-md hover:bg-secondary/20 cursor-pointer flex justify-between items-center"
                    onClick={() => handleSelectStock(stock)}
                  >
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground">{stock.name}</div>
                    </div>
                    <ArrowRightIcon className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedStock && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{selectedStock.symbol}</CardTitle>
                <CardDescription>{selectedStock.name}</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshStockData}
                disabled={isRefreshing}
              >
                <RefreshCwIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stockPrice && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Current Price</Label>
                  <div className="text-2xl font-bold">₹{stockPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <Label className="text-sm">Owned Quantity</Label>
                  <div className="text-2xl font-bold">{getOwnedQuantity()}</div>
                </div>
              </div>
            )}
            
            {chartData && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Price History</h3>
                <div className="text-xs text-muted-foreground">
                  Chart data available. Will display chart once dependencies are resolved.
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button 
                className="w-full bg-success hover:bg-success/90"
                onClick={openBuyDialog}
                disabled={!stockPrice}
              >
                <TrendingUpIcon className="h-4 w-4 mr-2" />
                Buy
              </Button>
              <Button 
                className="w-full bg-destructive hover:bg-destructive/90"
                onClick={openSellDialog}
                disabled={!stockPrice || getOwnedQuantity() === 0}
              >
                <TrendingDownIcon className="h-4 w-4 mr-2" />
                Sell
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Trade Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "buy" ? "Buy" : "Sell"} {selectedStock?.symbol}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "buy" 
                ? "Enter the quantity of shares you want to buy"
                : "Enter the quantity of shares you want to sell"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {stockPrice && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Current Price</Label>
                  <div className="text-xl font-medium">₹{stockPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                {dialogMode === "buy" ? (
                  <div>
                    <Label className="text-sm">Available Funds</Label>
                    <div className="text-xl font-medium">₹{fantasyData.wallet.toLocaleString()}</div>
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm">Owned Quantity</Label>
                    <div className="text-xl font-medium">{getOwnedQuantity()}</div>
                  </div>
                )}
              </div>
            )}
            
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                >
                  -
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={dialogMode === "sell" ? getOwnedQuantity() : undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="text-center"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (dialogMode === "sell" && quantity < getOwnedQuantity()) {
                      setQuantity(q => q + 1);
                    } else if (dialogMode === "buy") {
                      setQuantity(q => q + 1);
                    }
                  }}
                >
                  +
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-sm">Total {dialogMode === "buy" ? "Cost" : "Value"}</Label>
              <div className="text-xl font-bold mt-1">₹{(stockPrice * quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            
            {dialogMode === "buy" && stockPrice * quantity > fantasyData.wallet && (
              <div className="text-destructive text-sm flex items-center">
                <XIcon className="h-4 w-4 mr-1" />
                Insufficient funds in your wallet
              </div>
            )}
            
            {dialogMode === "sell" && quantity > getOwnedQuantity() && (
              <div className="text-destructive text-sm flex items-center">
                <XIcon className="h-4 w-4 mr-1" />
                You don't own enough shares
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            {dialogMode === "buy" ? (
              <Button 
                className="bg-success hover:bg-success/90"
                onClick={handleBuyStock}
                disabled={isBuying || stockPrice * quantity > fantasyData.wallet}
              >
                {isBuying ? (
                  <>
                    <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                    Buying...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Confirm Purchase
                  </>
                )}
              </Button>
            ) : (
              <Button 
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleSellStock}
                disabled={isSelling || quantity > getOwnedQuantity()}
              >
                {isSelling ? (
                  <>
                    <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                    Selling...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Confirm Sale
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketView; 