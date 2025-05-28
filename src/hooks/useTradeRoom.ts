import { useState, useEffect } from "react";
import { Stock } from "@/services/mockData";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
}

export interface Transaction {
  id: string;
  type: "buy" | "sell";
  symbol: string;
  shares: number;
  price: number;
  timestamp: string;
}

export const useTradeRoom = (
  initialStocks: Stock[],
  initialBalance: number,
  initialPortfolio: Portfolio[],
  initialTransactions: Transaction[]
) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStocks, setFilteredStocks] = useState(initialStocks);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState(1);
  const [balance, setBalance] = useState(initialBalance);
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [transactions, setTransactions] = useState(initialTransactions);
  const { toast } = useToast();

  // Filter stocks based on search query
  useEffect(() => {
    if (searchQuery) {
      setFilteredStocks(initialStocks.filter(stock => 
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setFilteredStocks(initialStocks);
    }
  }, [searchQuery, initialStocks]);

  // Calculate portfolio value
  const portfolioValue = portfolio.reduce((total, holding) => {
    const stock = initialStocks.find(s => s.symbol === holding.symbol);
    if (stock) {
      return total + (holding.shares * stock.price);
    }
    return total;
  }, 0);

  const totalValue = balance + portfolioValue;
  const initialStartingBalance = 100000; // Starting balance
  const roi = ((totalValue - initialStartingBalance) / initialStartingBalance) * 100;

  // Calculate per-stock performance data
  const calculateStockPerformance = (symbol: string) => {
    const holding = portfolio.find(h => h.symbol === symbol);
    if (!holding) return null;
    
    const stock = initialStocks.find(s => s.symbol === symbol);
    if (!stock) return null;
    
    const currentValue = holding.shares * stock.price;
    const cost = holding.shares * holding.avgPrice;
    const profit = currentValue - cost;
    const profitPercent = (profit / cost) * 100;
    
    return {
      currentValue,
      profit,
      profitPercent
    };
  };

  // Open trade dialog
  const openTradeDialog = (stock: Stock, type: "buy" | "sell") => {
    setSelectedStock(stock);
    setTradeType(type);
    setTradeDialogOpen(true);
  };

  // Handle trade execution
  const executeTrade = () => {
    if (!selectedStock) return;
    
    const tradeAmount = selectedStock.price * quantity;
    
    if (tradeType === "buy") {
      // Check if user has enough balance
      if (tradeAmount > balance) {
        toast({
          title: "Insufficient funds",
          description: `You need $${tradeAmount.toLocaleString()} to complete this purchase.`,
          variant: "destructive",
        });
        return;
      }
      
      // Update balance
      setBalance(prev => prev - tradeAmount);
      
      // Update portfolio
      const existingPosition = portfolio.find(item => item.symbol === selectedStock.symbol);
      if (existingPosition) {
        // Average down/up existing position
        const newShares = existingPosition.shares + quantity;
        const newAvgPrice = ((existingPosition.shares * existingPosition.avgPrice) + tradeAmount) / newShares;
        
        setPortfolio(portfolio.map(item => 
          item.symbol === selectedStock.symbol 
            ? { ...item, shares: newShares, avgPrice: newAvgPrice } 
            : item
        ));
      } else {
        // Add new position
        setPortfolio([...portfolio, {
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          shares: quantity,
          avgPrice: selectedStock.price
        }]);
      }
      
      // Add transaction record
      setTransactions([
        {
          id: Date.now().toString(),
          type: "buy",
          symbol: selectedStock.symbol,
          shares: quantity,
          price: selectedStock.price,
          timestamp: new Date().toISOString()
        },
        ...transactions
      ]);
      
      toast({
        title: "Purchase successful",
        description: `Bought ${quantity} shares of ${selectedStock.symbol} at $${selectedStock.price.toFixed(2)}.`,
      });
    } else {
      // Check if user has enough shares
      const existingPosition = portfolio.find(item => item.symbol === selectedStock.symbol);
      if (!existingPosition || existingPosition.shares < quantity) {
        toast({
          title: "Insufficient shares",
          description: `You don't have enough shares of ${selectedStock.symbol} to sell.`,
          variant: "destructive",
        });
        return;
      }
      
      // Update balance
      setBalance(prev => prev + tradeAmount);
      
      // Update portfolio
      const newShares = existingPosition.shares - quantity;
      if (newShares === 0) {
        setPortfolio(portfolio.filter(item => item.symbol !== selectedStock.symbol));
      } else {
        setPortfolio(portfolio.map(item => 
          item.symbol === selectedStock.symbol 
            ? { ...item, shares: newShares } 
            : item
        ));
      }
      
      // Add transaction record
      setTransactions([
        {
          id: Date.now().toString(),
          type: "sell",
          symbol: selectedStock.symbol,
          shares: quantity,
          price: selectedStock.price,
          timestamp: new Date().toISOString()
        },
        ...transactions
      ]);
      
      toast({
        title: "Sale successful",
        description: `Sold ${quantity} shares of ${selectedStock.symbol} at $${selectedStock.price.toFixed(2)}.`,
      });
    }
    
    setTradeDialogOpen(false);
    setQuantity(1);
  };
  
  // Generate mock chart data for tutorial
  const generateMockChartData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString(),
        value: Math.random() * 10000 + 90000 // Random value between 90k-100k
      });
    }
    
    return data;
  };

  return {
    // State
    searchQuery,
    filteredStocks,
    selectedStock,
    tradeDialogOpen,
    tradeType,
    quantity,
    balance,
    portfolio,
    transactions,
    totalValue,
    portfolioValue,
    roi,
    
    // Actions
    setSearchQuery,
    setTradeDialogOpen,
    setTradeType,
    setQuantity,
    openTradeDialog,
    executeTrade,
    
    // Calculations
    calculateStockPerformance,
    generateMockChartData,
    
    // Constants
    initialBalance: initialStartingBalance,
  };
};
