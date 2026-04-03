import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { trialRoomService, Market, TrialRoomData } from "@/services/trialRoomService";
import { finnhubService } from "@/services/finnhubService";
import { twelveDataService } from "@/services/twelveDataService";

// Wallet preset options
export const walletPresets = {
  inr: [10000, 50000, 100000, 500000],
  usd: [1000, 5000, 10000, 50000]
};

// List of available markets
export const availableMarkets: { id: Market, name: string, currency: string }[] = [
  { id: "NSE", name: "National Stock Exchange (India)", currency: "inr" },
  { id: "BSE", name: "Bombay Stock Exchange (India)", currency: "inr" },
  { id: "NYSE", name: "New York Stock Exchange (US)", currency: "usd" },
  { id: "NASDAQ", name: "NASDAQ (US)", currency: "usd" }
];

export function useTrialRoomSetup() {
  const [selectedMarket, setSelectedMarket] = useState<Market>("NYSE");
  const [walletAmount, setWalletAmount] = useState<number>(10000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasExistingRoom, setHasExistingRoom] = useState<boolean>(false);
  const [existingRoomData, setExistingRoomData] = useState<TrialRoomData | null>(null);
  const { toast } = useToast();
  // Authentication removed - using localStorage for demo

  // Check if user already has a trial room
  useEffect(() => {
    if (!user) return;

    const checkExistingRoom = async () => {
      setIsLoading(true);
      try {
        const roomData = await trialRoomService.getUserTrialRoom();
        if (roomData) {
          setHasExistingRoom(true);
          setExistingRoomData(roomData);
          setSelectedMarket(roomData.market);
          setWalletAmount(roomData.wallet);
        } else {
          setHasExistingRoom(false);
          setExistingRoomData(null);
        }
      } catch (error) {
        console.error("Error checking for existing trial room:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingRoom();
  }, [user]);

  // Create a new trial room
  const createTrialRoom = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a trial room",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const newRoom = await trialRoomService.createTrialRoom(selectedMarket, walletAmount);
      
      toast({
        title: "Trial Room Created",
        description: `Your virtual trading room has been set up with ${getCurrencySymbol(selectedMarket)}${walletAmount.toLocaleString()}`
      });

      setHasExistingRoom(true);
      setExistingRoomData(newRoom);
      return newRoom;
    } catch (error) {
      console.error("Error creating trial room:", error);
      toast({
        title: "Error",
        description: "Failed to create trial room. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get real-time stock quotes for a symbol
  const getStockQuote = async (symbol: string, exchange: string) => {
    try {
      // Select appropriate service based on exchange
      if (exchange === "NSE" || exchange === "BSE") {
        return await twelveDataService.getPrice(symbol);
      } else {
        return await finnhubService.getStockQuote(symbol);
      }
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  };

  // Get currency symbol based on market
  const getCurrencySymbol = (market: Market): string => {
    const marketInfo = availableMarkets.find(m => m.id === market);
    return marketInfo?.currency === "inr" ? "₹" : "$";
  };

  // Get display currency name based on market
  const getCurrencyName = (market: Market): string => {
    const marketInfo = availableMarkets.find(m => m.id === market);
    return marketInfo?.currency === "inr" ? "Indian Rupee" : "US Dollar";
  };

  // Reset trial room data (mainly for testing)
  const resetTrialRoom = async () => {
    if (!user) return false;
    
    try {
      await createTrialRoom();
      return true;
    } catch (error) {
      console.error("Error resetting trial room:", error);
      return false;
    }
  };

  return {
    // State
    selectedMarket,
    walletAmount,
    isLoading,
    hasExistingRoom,
    existingRoomData,
    
    // Actions
    setSelectedMarket,
    setWalletAmount,
    createTrialRoom,
    getStockQuote,
    getCurrencySymbol,
    getCurrencyName,
    resetTrialRoom
  };
}

export default useTrialRoomSetup; 