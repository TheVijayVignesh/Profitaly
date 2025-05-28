import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { trialRoomService, TrialRoomData, StockHolding, Transaction } from "@/services/trialRoomService";
import { availableMarkets } from "./useTrialRoomSetup";

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change?: number;
  changePercent?: number;
  exchange: string;
  sector?: string;
}

export function useTrialRoomTrade() {
  const [trialRoomData, setTrialRoomData] = useState<TrialRoomData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeQuantity, setTradeQuantity] = useState<number>(1);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [isTrading, setIsTrading] = useState<boolean>(false);
  const [stockList, setStockList] = useState<Stock[]>([]);
  const [isLoadingStocks, setIsLoadingStocks] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);

  const { toast } = useToast();
  const { user } = useAuth();

  // Load trial room data
  useEffect(() => {
    // For development, create mock data if none exists
    const createMockDataIfNeeded = async () => {
      if (import.meta.env.DEV) {
        setIsLoading(true);
        try {
          // Check if we already have trial room data
          const data = await trialRoomService.getUserTrialRoom();
          
          if (!data) {
            // Create mock trial room data for development
            console.log("Creating mock trial room data for development");
            const mockData = await trialRoomService.createTrialRoom("NASDAQ", 10000);
            setTrialRoomData(mockData);
            loadStocksForMarket("NASDAQ");
          } else {
            setTrialRoomData(data);
            loadStocksForMarket(data.market);
          }
        } catch (error) {
          console.error("Error creating mock trial room data:", error);
        } finally {
          setIsLoading(false);
        }
        return;
      }
      
      // Regular flow for production
      if (!user) return;
      
      setIsLoading(true);
      try {
        const data = await trialRoomService.getUserTrialRoom();
        setTrialRoomData(data);
        
        // If we have room data, load stocks for that market
        if (data) {
          loadStocksForMarket(data.market);
        }
      } catch (error) {
        console.error("Error loading trial room data:", error);
        toast({
          title: "Error",
          description: "Failed to load your trial room data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    createMockDataIfNeeded();
  }, [user]);

  // Filter stocks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStocks(stockList);
      console.log(`Showing all ${stockList.length} stocks`);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = stockList.filter(
      stock => 
        stock.symbol.toLowerCase().includes(query) || 
        stock.name.toLowerCase().includes(query) ||
        (stock.sector && stock.sector.toLowerCase().includes(query))
    );
    
    console.log(`Filtered stocks by "${searchQuery}": ${filtered.length} results`);
    setFilteredStocks(filtered);
  }, [searchQuery, stockList]);

  // Load stocks for a market
  const loadStocksForMarket = async (market) => {
    setIsLoadingStocks(true);
    try {
      const stocks = await trialRoomService.getStocksByMarket(market);
      setStockList(stocks);
      setFilteredStocks(stocks);
    } catch (error) {
      console.error(`Error loading stocks for ${market}:`, error);
      toast({
        title: "Error",
        description: `Failed to load stock list for ${market}`,
        variant: "destructive"
      });
    } finally {
      setIsLoadingStocks(false);
    }
  };

  // Open trade dialog
  const openTradeDialog = (stock: Stock, type: "buy" | "sell" = "buy") => {
    setSelectedStock(stock);
    setTradeType(type);
    setTradeQuantity(1);
  };

  // Execute a trade
  const executeTrade = async () => {
    if (!trialRoomData || !selectedStock || !user) {
      console.error("Trade execution failed: Missing required information", {
        hasTrialRoomData: !!trialRoomData,
        hasSelectedStock: !!selectedStock,
        hasUser: !!user
      });
      toast({
        title: "Error",
        description: "Missing required information to complete trade",
        variant: "destructive"
      });
      return false;
    }

    console.log(`Executing ${tradeType} trade for ${selectedStock.symbol}`, {
      quantity: tradeQuantity,
      price: selectedStock.price,
      total: tradeQuantity * selectedStock.price
    });

    setIsTrading(true);
    try {
      if (tradeType === "buy") {
        // Execute buy
        const updatedRoom = await trialRoomService.buyStock(
          selectedStock.symbol,
          selectedStock.name,
          tradeQuantity,
          selectedStock.price,
          selectedStock.exchange
        );
        setTrialRoomData(updatedRoom);
        
        toast({
          title: "Purchase Complete",
          description: `Bought ${tradeQuantity} shares of ${selectedStock.symbol} at ${getCurrencySymbol(trialRoomData.market)}${selectedStock.price}`
        });
      } else {
        // Execute sell
        const updatedRoom = await trialRoomService.sellStock(
          selectedStock.symbol,
          selectedStock.name,
          tradeQuantity,
          selectedStock.price
        );
        setTrialRoomData(updatedRoom);
        
        toast({
          title: "Sale Complete",
          description: `Sold ${tradeQuantity} shares of ${selectedStock.symbol} at ${getCurrencySymbol(trialRoomData.market)}${selectedStock.price}`
        });
      }
      
      // Reset selection
      setSelectedStock(null);
      setTradeQuantity(1);
      return true;
    } catch (error) {
      console.error("Error executing trade:", error);
      toast({
        title: "Trade Failed",
        description: error.message || "An error occurred while processing your trade",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsTrading(false);
    }
  };

  // Calculate portfolio performance
  const calculatePortfolioPerformance = () => {
    if (!trialRoomData) return { totalValue: 0, roi: 0 };
    
    // Calculate current value of holdings
    const holdingsValue = trialRoomData.holdings.reduce((total, holding) => {
      // Find current price from stock list
      const stock = stockList.find(s => s.symbol === holding.symbol);
      const currentPrice = stock ? stock.price : holding.avg_price; // Fall back to avg price if no current price
      
      return total + (holding.quantity * currentPrice);
    }, 0);
    
    // Total portfolio value = cash + holdings
    const totalValue = trialRoomData.cash_left + holdingsValue;
    
    // Calculate ROI
    const initialInvestment = trialRoomData.wallet;
    const profit = totalValue - initialInvestment;
    const roi = (profit / initialInvestment) * 100;
    
    return {
      cashBalance: trialRoomData.cash_left,
      holdingsValue,
      totalValue,
      profit,
      roi
    };
  };

  // Calculate performance metrics for a specific holding
  const calculateHoldingPerformance = (symbol: string) => {
    if (!trialRoomData) return null;
    
    const holding = trialRoomData.holdings.find(h => h.symbol === symbol);
    if (!holding) return null;
    
    // Find current price from stock list
    const stock = stockList.find(s => s.symbol === symbol);
    const currentPrice = stock ? stock.price : holding.avg_price;
    
    const initialValue = holding.quantity * holding.avg_price;
    const currentValue = holding.quantity * currentPrice;
    const profit = currentValue - initialValue;
    const profitPercent = (profit / initialValue) * 100;
    
    return {
      symbol,
      quantity: holding.quantity,
      avgPrice: holding.avg_price,
      currentPrice,
      initialValue,
      currentValue,
      profit,
      profitPercent
    };
  };

  // Get currency symbol for market
  const getCurrencySymbol = (market) => {
    const marketInfo = availableMarkets.find(m => m.id === market);
    return marketInfo?.currency === "inr" ? "₹" : "$";
  };

  return {
    // State
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
    
    // Actions
    setTradeQuantity,
    setTradeType,
    setSelectedStock,
    setSearchQuery,
    openTradeDialog,
    executeTrade,
    loadStocksForMarket,
    
    // Calculations
    calculatePortfolioPerformance,
    calculateHoldingPerformance,
    getCurrencySymbol
  };
}

export default useTrialRoomTrade; 