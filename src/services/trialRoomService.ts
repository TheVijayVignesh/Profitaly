import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { twelveDataService } from "./twelveDataService";
import { finnhubService } from "./finnhubService";

// Development mode flag
const IS_DEV = import.meta.env.DEV;

// Mock user ID for development
const MOCK_USER_ID = "mock-user-123";

// Mock trial room data storage (for development only)
let MOCK_TRIAL_ROOM_DATA: TrialRoomData | null = null;

// Market types
export type Market = "NSE" | "NYSE" | "NASDAQ" | "BSE";

// Trial room user data structure
export interface TrialRoomData {
  market: Market;
  wallet: number;
  cash_left: number;
  holdings: StockHolding[];
  transactions: Transaction[];
  created_at?: any; // Firestore Timestamp
  last_updated?: any; // Firestore Timestamp
}

// Stock holding type
export interface StockHolding {
  symbol: string;
  name: string;
  quantity: number;
  avg_price: number;
  exchange: string;
}

// Transaction type
export interface Transaction {
  id: string;
  type: "buy" | "sell";
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  timestamp: string;
}

/**
 * Trial Room Service
 * Manages user trial room data with Firestore
 */
class TrialRoomService {
  /**
   * Get the current user's trial room data
   */
  async getUserTrialRoom(): Promise<TrialRoomData | null> {
    try {
      // In development mode, use mock data
      if (IS_DEV) {
        console.log("Returning mock trial room data");
        return MOCK_TRIAL_ROOM_DATA;
      }

      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user found");
        return null;
      }

      const trialRoomRef = doc(db, "users", user.uid, "trial_room", "data");
      const trialRoomDoc = await getDoc(trialRoomRef);

      if (trialRoomDoc.exists()) {
        return trialRoomDoc.data() as TrialRoomData;
      }

      return null;
    } catch (error) {
      console.error("Error fetching trial room data:", error);
      return null;
    }
  }

  /**
   * Create a new trial room for the user
   */
  async createTrialRoom(market: Market, wallet: number): Promise<TrialRoomData> {
    try {
      // In development mode, create mock data
      if (IS_DEV) {
        console.log("Creating mock trial room");
        const mockData: TrialRoomData = {
          market,
          wallet,
          cash_left: wallet,
          holdings: [],
          transactions: [],
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        };
        
        // Store in mock storage
        MOCK_TRIAL_ROOM_DATA = mockData;
        return mockData;
      }

      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const trialRoomData: TrialRoomData = {
        market,
        wallet,
        cash_left: wallet,
        holdings: [],
        transactions: [],
        created_at: serverTimestamp(),
        last_updated: serverTimestamp()
      };

      const trialRoomRef = doc(db, "users", user.uid, "trial_room", "data");
      await setDoc(trialRoomRef, trialRoomData);

      return {
        ...trialRoomData,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error creating trial room:", error);
      throw error;
    }
  }

  /**
   * Buy a stock in the trial room
   */
  async buyStock(
    symbol: string,
    name: string,
    quantity: number, 
    price: number,
    exchange: string
  ): Promise<TrialRoomData> {
    try {
      // In development mode, use mock data
      if (IS_DEV) {
        console.log("Using mock trial room data");
        const mockData: TrialRoomData = {
          market: MOCK_TRIAL_ROOM_DATA!.market,
          wallet: MOCK_TRIAL_ROOM_DATA!.wallet,
          cash_left: MOCK_TRIAL_ROOM_DATA!.cash_left,
          holdings: MOCK_TRIAL_ROOM_DATA!.holdings,
          transactions: MOCK_TRIAL_ROOM_DATA!.transactions,
          created_at: MOCK_TRIAL_ROOM_DATA!.created_at,
          last_updated: MOCK_TRIAL_ROOM_DATA!.last_updated
        };
        
        // Update mock data
        const totalCost = price * quantity;
        const newCashLeft = MOCK_TRIAL_ROOM_DATA!.cash_left - totalCost;
        const existingHolding = MOCK_TRIAL_ROOM_DATA!.holdings.find(h => h.symbol === symbol);
        let updatedHoldings;

        if (existingHolding) {
          // Update existing holding
          const totalShares = existingHolding.quantity + quantity;
          const totalCostBasis = (existingHolding.quantity * existingHolding.avg_price) + totalCost;
          const newAvgPrice = totalCostBasis / totalShares;

          updatedHoldings = MOCK_TRIAL_ROOM_DATA!.holdings.map(h => {
            if (h.symbol === symbol) {
              return {
                ...h,
                quantity: totalShares,
                avg_price: newAvgPrice
              };
            }
            return h;
          });
        } else {
          // Add new holding
          updatedHoldings = [
            ...MOCK_TRIAL_ROOM_DATA!.holdings,
            {
              symbol,
              name,
              quantity,
              avg_price: price,
              exchange
            }
          ];
        }

        // Create transaction record
        const transaction: Transaction = {
          id: Date.now().toString(),
          type: "buy",
          symbol,
          name,
          quantity,
          price,
          total: totalCost,
          timestamp: new Date().toISOString()
        };

        // Update mock data
        const updatedData = {
          cash_left: newCashLeft,
          holdings: updatedHoldings,
          transactions: [transaction, ...MOCK_TRIAL_ROOM_DATA!.transactions],
          last_updated: serverTimestamp()
        };
        
        MOCK_TRIAL_ROOM_DATA = {
          ...MOCK_TRIAL_ROOM_DATA!,
          ...updatedData,
          last_updated: new Date().toISOString()
        };
        
        return MOCK_TRIAL_ROOM_DATA;
      }

      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Get current trial room data
      const trialRoomRef = doc(db, "users", user.uid, "trial_room", "data");
      const trialRoomDoc = await getDoc(trialRoomRef);

      if (!trialRoomDoc.exists()) {
        throw new Error("Trial room not found");
      }

      const trialRoomData = trialRoomDoc.data() as TrialRoomData;
      const totalCost = price * quantity;

      // Check if user has enough cash
      if (trialRoomData.cash_left < totalCost) {
        throw new Error("Insufficient funds");
      }

      // Update cash balance
      const newCashLeft = trialRoomData.cash_left - totalCost;

      // Update holdings
      const existingHolding = trialRoomData.holdings.find(h => h.symbol === symbol);
      let updatedHoldings;

      if (existingHolding) {
        // Update existing holding
        const totalShares = existingHolding.quantity + quantity;
        const totalCostBasis = (existingHolding.quantity * existingHolding.avg_price) + totalCost;
        const newAvgPrice = totalCostBasis / totalShares;

        updatedHoldings = trialRoomData.holdings.map(h => {
          if (h.symbol === symbol) {
            return {
              ...h,
              quantity: totalShares,
              avg_price: newAvgPrice
            };
          }
          return h;
        });
      } else {
        // Add new holding
        updatedHoldings = [
          ...trialRoomData.holdings,
          {
            symbol,
            name,
            quantity,
            avg_price: price,
            exchange
          }
        ];
      }

      // Create transaction record
      const transaction: Transaction = {
        id: Date.now().toString(),
        type: "buy",
        symbol,
        name,
        quantity,
        price,
        total: totalCost,
        timestamp: new Date().toISOString()
      };

      // Update Firestore
      const updatedData = {
        cash_left: newCashLeft,
        holdings: updatedHoldings,
        transactions: [transaction, ...trialRoomData.transactions],
        last_updated: serverTimestamp()
      };

      await updateDoc(trialRoomRef, updatedData);

      return {
        ...trialRoomData,
        ...updatedData,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error buying stock:", error);
      throw error;
    }
  }

  /**
   * Sell a stock in the trial room
   */
  async sellStock(
    symbol: string,
    name: string,
    quantity: number,
    price: number
  ): Promise<TrialRoomData> {
    try {
      // In development mode, use mock data
      if (IS_DEV) {
        console.log("Using mock trial room data");
        const mockData: TrialRoomData = {
          market: MOCK_TRIAL_ROOM_DATA!.market,
          wallet: MOCK_TRIAL_ROOM_DATA!.wallet,
          cash_left: MOCK_TRIAL_ROOM_DATA!.cash_left,
          holdings: MOCK_TRIAL_ROOM_DATA!.holdings,
          transactions: MOCK_TRIAL_ROOM_DATA!.transactions,
          created_at: MOCK_TRIAL_ROOM_DATA!.created_at,
          last_updated: MOCK_TRIAL_ROOM_DATA!.last_updated
        };
        
        // Update mock data
        const saleAmount = price * quantity;
        const newCashLeft = MOCK_TRIAL_ROOM_DATA!.cash_left + saleAmount;
        const existingHolding = MOCK_TRIAL_ROOM_DATA!.holdings.find(h => h.symbol === symbol);
        let updatedHoldings;

        if (existingHolding) {
          if (existingHolding.quantity < quantity) {
            throw new Error(`You only have ${existingHolding.quantity} shares to sell`);
          }

          if (existingHolding.quantity === quantity) {
            // Remove holding completely
            updatedHoldings = MOCK_TRIAL_ROOM_DATA!.holdings.filter(h => h.symbol !== symbol);
          } else {
            // Reduce quantity (avg price remains the same)
            updatedHoldings = MOCK_TRIAL_ROOM_DATA!.holdings.map(h => {
              if (h.symbol === symbol) {
                return {
                  ...h,
                  quantity: h.quantity - quantity
                };
              }
              return h;
            });
          }
        } else {
          throw new Error("You don't own any shares of this stock");
        }

        // Create transaction record
        const transaction: Transaction = {
          id: Date.now().toString(),
          type: "sell",
          symbol,
          name,
          quantity,
          price,
          total: saleAmount,
          timestamp: new Date().toISOString()
        };

        // Update mock data
        const updatedData = {
          cash_left: newCashLeft,
          holdings: updatedHoldings,
          transactions: [transaction, ...MOCK_TRIAL_ROOM_DATA!.transactions],
          last_updated: serverTimestamp()
        };
        
        MOCK_TRIAL_ROOM_DATA = {
          ...MOCK_TRIAL_ROOM_DATA!,
          ...updatedData,
          last_updated: new Date().toISOString()
        };
        
        return MOCK_TRIAL_ROOM_DATA;
      }

      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Get current trial room data
      const trialRoomRef = doc(db, "users", user.uid, "trial_room", "data");
      const trialRoomDoc = await getDoc(trialRoomRef);

      if (!trialRoomDoc.exists()) {
        throw new Error("Trial room not found");
      }

      const trialRoomData = trialRoomDoc.data() as TrialRoomData;
      
      // Find the holding
      const existingHolding = trialRoomData.holdings.find(h => h.symbol === symbol);
      
      if (!existingHolding) {
        throw new Error("You don't own any shares of this stock");
      }

      if (existingHolding.quantity < quantity) {
        throw new Error(`You only have ${existingHolding.quantity} shares to sell`);
      }

      // Calculate sale amount
      const saleAmount = price * quantity;
      
      // Update cash balance
      const newCashLeft = trialRoomData.cash_left + saleAmount;

      // Update holdings
      let updatedHoldings;
      
      if (existingHolding.quantity === quantity) {
        // Remove holding completely
        updatedHoldings = trialRoomData.holdings.filter(h => h.symbol !== symbol);
      } else {
        // Reduce quantity (avg price remains the same)
        updatedHoldings = trialRoomData.holdings.map(h => {
          if (h.symbol === symbol) {
            return {
              ...h,
              quantity: h.quantity - quantity
            };
          }
          return h;
        });
      }

      // Create transaction record
      const transaction: Transaction = {
        id: Date.now().toString(),
        type: "sell",
        symbol,
        name,
        quantity,
        price,
        total: saleAmount,
        timestamp: new Date().toISOString()
      };

      // Update Firestore
      const updatedData = {
        cash_left: newCashLeft,
        holdings: updatedHoldings,
        transactions: [transaction, ...trialRoomData.transactions],
        last_updated: serverTimestamp()
      };

      await updateDoc(trialRoomRef, updatedData);

      return {
        ...trialRoomData,
        ...updatedData,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error selling stock:", error);
      throw error;
    }
  }

  /**
   * Get stock list based on market
   */
  async getStocksByMarket(market: Market) {
    try {
      // Use appropriate service based on market
      if (market === "NSE" || market === "BSE") {
        // For Indian markets
        // Note: TwelveData has better coverage for Indian markets
        return await twelveDataService.getStocksByExchange(market);
      } else {
        // For US markets
        return await finnhubService.getStocksByExchange(market);
      }
    } catch (error) {
      console.error(`Error fetching stocks for ${market}:`, error);
      // Return empty array in case of error
      return [];
    }
  }
}

export const trialRoomService = new TrialRoomService();
export default trialRoomService; 