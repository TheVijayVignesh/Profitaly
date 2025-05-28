import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { SearchIcon, TrendingUpIcon, TrendingDownIcon, AlertCircle, LineChart } from "lucide-react";
import { doc, getDoc, updateDoc, arrayUnion, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { fetchStockPrice, searchStocks } from "../utils/stockApi";

const StockMarketView = ({ market, eventId, vaultBalance }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [tradeType, setTradeType] = useState("buy");
  const [userHoldings, setUserHoldings] = useState([]);
  
  // Format currency based on market
  const formatCurrency = (value) => {
    if (!value) return "0";
    const currencySymbol = market === "NSE" ? "₹" : "$";
    return `${currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Load user holdings
  useEffect(() => {
    const loadUserHoldings = async () => {
      if (!user || !eventId) return;
      
      try {
        const userVaultRef = doc(db, "users", user.uid, "fantasyState", eventId);
        const vaultDoc = await getDoc(userVaultRef);
        
        if (vaultDoc.exists() && vaultDoc.data().holdings) {
          setUserHoldings(vaultDoc.data().holdings);
        }
      } catch (error) {
        console.error("Error loading holdings:", error);
      }
    };
    
    loadUserHoldings();
  }, [user, eventId]);
  
  // Handle stock search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const results = await searchStocks(searchQuery, market);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching stocks:", error);
      setError("Failed to search for stocks. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle stock selection for trade
  const handleSelectStock = async (stock) => {
    setIsLoading(true);
    
    try {
      // Get latest price for the stock
      const priceData = await fetchStockPrice(stock.symbol);
      
      setSelectedStock({
        ...stock,
        currentPrice: priceData.price,
        change: priceData.change,
        changePercent: priceData.changePercent
      });
      
      setQuantity(1);
    } catch (error) {
      console.error("Error fetching stock price:", error);
      toast({
        title: "Error",
        description: "Failed to fetch current stock price. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate total cost
  const calculateTotal = () => {
    if (!selectedStock || !quantity) return 0;
    return selectedStock.currentPrice * quantity;
  };
  
  // Execute trade (buy or sell)
  const executeTrade = async () => {
    if (!user || !eventId || !selectedStock || !quantity) return;
    
    setIsLoading(true);
    setError(null);
    
    const userVaultRef = doc(db, "users", user.uid, "fantasyState", eventId);
    const total = calculateTotal();
    
    try {
      // Get current vault data
      const vaultDoc = await getDoc(userVaultRef);
      if (!vaultDoc.exists()) {
        throw new Error("Vault data not found");
      }
      
      const vaultData = vaultDoc.data();
      
      if (tradeType === "buy") {
        // Check if user has enough funds
        if (vaultData.vaultBalance < total) {
          throw new Error("Insufficient funds in your vault");
        }
        
        // Create transaction record
        const transaction = {
          type: "BUY",
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          qty: quantity,
          price: selectedStock.currentPrice,
          total: total,
          timestamp: serverTimestamp()
        };
        
        // Check if user already owns this stock
        const existingHoldingIndex = vaultData.holdings?.findIndex(h => h.symbol === selectedStock.symbol) ?? -1;
        
        if (existingHoldingIndex >= 0) {
          // Update existing holding
          const existingHolding = vaultData.holdings[existingHoldingIndex];
          const newQty = existingHolding.qty + quantity;
          const newAvgPrice = ((existingHolding.qty * existingHolding.boughtPrice) + (quantity * selectedStock.currentPrice)) / newQty;
          
          const updatedHoldings = [...vaultData.holdings];
          updatedHoldings[existingHoldingIndex] = {
            ...existingHolding,
            qty: newQty,
            boughtPrice: newAvgPrice,
            currentPrice: selectedStock.currentPrice,
            lastUpdated: serverTimestamp()
          };
          
          // Update vault data
          await updateDoc(userVaultRef, {
            vaultBalance: increment(-total),
            holdings: updatedHoldings,
            transactions: arrayUnion(transaction)
          });
        } else {
          // Add new holding
          const newHolding = {
            symbol: selectedStock.symbol,
            name: selectedStock.name,
            qty: quantity,
            boughtPrice: selectedStock.currentPrice,
            currentPrice: selectedStock.currentPrice,
            lastUpdated: serverTimestamp()
          };
          
          // Update vault data
          await updateDoc(userVaultRef, {
            vaultBalance: increment(-total),
            holdings: arrayUnion(newHolding),
            transactions: arrayUnion(transaction)
          });
        }
        
        toast({
          title: "Purchase Successful",
          description: `You bought ${quantity} ${selectedStock.symbol} for ${formatCurrency(total)}`,
          variant: "default"
        });
      } else {
        // Sell transaction
        // Check if user owns the stock
        const holdingIndex = vaultData.holdings?.findIndex(h => h.symbol === selectedStock.symbol) ?? -1;
        
        if (holdingIndex === -1) {
          throw new Error(`You don't own any shares of ${selectedStock.symbol}`);
        }
        
        const holding = vaultData.holdings[holdingIndex];
        
        if (holding.qty < quantity) {
          throw new Error(`You only have ${holding.qty} shares of ${selectedStock.symbol}`);
        }
        
        // Create transaction record
        const transaction = {
          type: "SELL",
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          qty: quantity,
          price: selectedStock.currentPrice,
          total: total,
          timestamp: serverTimestamp()
        };
        
        // Update holdings
        const updatedHoldings = [...vaultData.holdings];
        
        if (holding.qty === quantity) {
          // Remove the holding completely
          updatedHoldings.splice(holdingIndex, 1);
          
          await updateDoc(userVaultRef, {
            vaultBalance: increment(total),
            holdings: updatedHoldings,
            transactions: arrayUnion(transaction)
          });
        } else {
          // Update the holding quantity
          updatedHoldings[holdingIndex] = {
            ...holding,
            qty: holding.qty - quantity,
            lastUpdated: serverTimestamp()
          };
          
          await updateDoc(userVaultRef, {
            vaultBalance: increment(total),
            holdings: updatedHoldings,
            transactions: arrayUnion(transaction)
          });
        }
        
        toast({
          title: "Sale Successful",
          description: `You sold ${quantity} ${selectedStock.symbol} for ${formatCurrency(total)}`,
          variant: "default"
        });
      }
      
      // Update user holdings state
      const updatedVaultDoc = await getDoc(userVaultRef);
      if (updatedVaultDoc.exists()) {
        setUserHoldings(updatedVaultDoc.data().holdings || []);
      }
      
      // Close dialog
      setSelectedStock(null);
    } catch (error) {
      console.error("Error executing trade:", error);
      toast({
        title: "Trade Failed",
        description: error.message || "Failed to complete the trade. Please try again.",
        variant: "destructive"
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get holding for a symbol
  const getHolding = (symbol) => {
    return userHoldings.find(holding => holding.symbol === symbol);
  };
  
  // Modal is open when selectedStock is not null
  const isDialogOpen = !!selectedStock;
  
  // Handle enter key for search
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  
  // Calculate maximum quantity user can buy with current balance
  const getMaxBuyQuantity = () => {
    if (!selectedStock || !vaultBalance) return 0;
    return Math.floor(vaultBalance / selectedStock.currentPrice);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{market} Market</CardTitle>
          <CardDescription>Search and trade stocks in the {market} market</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${market} stocks...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="mt-6">
            {isSearching ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((stock) => {
                  const holding = getHolding(stock.symbol);
                  
                  return (
                    <Card key={stock.symbol} className="overflow-hidden">
                      <div className="p-4 flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{stock.symbol}</h3>
                          <p className="text-sm text-muted-foreground">{stock.name}</p>
                          {holding && (
                            <div className="mt-1">
                              <span className="text-xs bg-secondary/30 px-2 py-0.5 rounded">
                                You own: {holding.qty} shares
                              </span>
                            </div>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleSelectStock(stock)}
                        >
                          Trade
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-8 text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <LineChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Search for stocks to start trading</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Your Holdings Quick View */}
      {userHoldings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
            <CardDescription>
              Quick access to trade stocks you already own
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userHoldings.map((holding) => (
                <div 
                  key={holding.symbol} 
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-secondary/10"
                >
                  <div>
                    <div className="font-medium">{holding.symbol}</div>
                    <div className="text-sm text-muted-foreground">{holding.qty} shares</div>
                  </div>
                  <div className="text-right">
                    <div>
                      {formatCurrency(holding.currentPrice || holding.boughtPrice)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-1"
                      onClick={() => handleSelectStock({
                        symbol: holding.symbol,
                        name: holding.name
                      })}
                    >
                      Trade
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Trade Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && setSelectedStock(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Trade {selectedStock?.symbol}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {selectedStock?.name}
              </span>
            </DialogTitle>
            <DialogDescription>
              Current Price: {formatCurrency(selectedStock?.currentPrice)}
              {selectedStock?.changePercent && (
                <span className={`ml-2 ${selectedStock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedStock.changePercent >= 0 ? (
                    <TrendingUpIcon className="h-3 w-3 inline mr-1" />
                  ) : (
                    <TrendingDownIcon className="h-3 w-3 inline mr-1" />
                  )}
                  {selectedStock.changePercent > 0 ? '+' : ''}
                  {selectedStock.changePercent.toFixed(2)}%
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={tradeType} onValueChange={setTradeType} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>
            
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex items-center mt-1.5">
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={tradeType === "sell" ? getHolding(selectedStock?.symbol)?.qty : undefined}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                  {tradeType === "buy" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => setQuantity(getMaxBuyQuantity())}
                      disabled={getMaxBuyQuantity() <= 0}
                    >
                      Max
                    </Button>
                  )}
                  {tradeType === "sell" && getHolding(selectedStock?.symbol) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => setQuantity(getHolding(selectedStock?.symbol).qty)}
                    >
                      All
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <div className="flex justify-between text-sm">
                  <span>Price per share:</span>
                  <span>{formatCurrency(selectedStock?.currentPrice)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="border-t my-2 border-muted-foreground/20" />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
              
              {tradeType === "buy" && (
                <div className="text-sm text-muted-foreground">
                  Available funds: {formatCurrency(vaultBalance)}
                </div>
              )}
              {tradeType === "sell" && getHolding(selectedStock?.symbol) && (
                <div className="text-sm text-muted-foreground">
                  You own: {getHolding(selectedStock?.symbol).qty} shares
                </div>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </Tabs>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedStock(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={executeTrade}
              disabled={
                isLoading ||
                quantity <= 0 ||
                (tradeType === "buy" && calculateTotal() > vaultBalance) ||
                (tradeType === "sell" && 
                  (!getHolding(selectedStock?.symbol) || 
                   getHolding(selectedStock?.symbol).qty < quantity))
              }
              className={tradeType === "buy" ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-600 hover:bg-amber-700"}
            >
              {isLoading 
                ? "Processing..." 
                : tradeType === "buy" 
                  ? `Buy ${quantity} Share${quantity !== 1 ? 's' : ''}` 
                  : `Sell ${quantity} Share${quantity !== 1 ? 's' : ''}`
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockMarketView; 