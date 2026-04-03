import { auth } from "@/lib/firebase";
import { 
  getPortfolios, 
  createPortfolio, 
  getHoldings, 
  upsertHolding, 
  getTransactions, 
  addTransaction,
  updatePortfolio 
} from "./dbService";
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

      // Authentication removed - using demo user
const user = { uid: "demo-user-123" };
      if (!user) {
        console.error("No authenticated user found");
        return null;
      }

      // Get user portfolios and look for trial room portfolio
      const portfolios = await getPortfolios(user.uid);
      const trialPortfolio = portfolios.find(p => p.name === "Trial Room");
      
      if (!trialPortfolio) {
        return null;
      }

      // Get holdings and transactions for this portfolio
      const holdings = await getHoldings(trialPortfolio.id);
      const transactions = await getTransactions(user.uid, trialPortfolio.id);

      // Convert to the expected format
      return {
        market: (trialPortfolio.name.includes("NSE") || trialPortfolio.name.includes("BSE")) ? "NSE" : "NYSE",
        wallet: parseFloat(trialPortfolio.cashBalance),
        cash_left: parseFloat(trialPortfolio.cashBalance),
        holdings: holdings.map(h => ({
          symbol: h.symbol,
          name: h.companyName || h.symbol,
          quantity: parseFloat(h.quantity),
          avg_price: parseFloat(h.averageCost),
          exchange: h.exchange || "NSE"
        })),
        transactions: transactions.map(t => ({
          id: t.id,
          type: t.type.toLowerCase() as "buy" | "sell",
          symbol: t.symbol,
          name: t.symbol, // We don't have company name in transactions
          quantity: parseFloat(t.quantity),
          price: parseFloat(t.price),
          total: parseFloat(t.total),
          timestamp: t.executedAt
        }))
      };
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

      // Authentication removed - using demo user
const user = { uid: "demo-user-123" };
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const trialRoomData: TrialRoomData = {
        market,
        wallet,
        cash_left: wallet,
        holdings: [],
        transactions: [],
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      // Create a new portfolio for the trial room
      const portfolio = await createPortfolio(user.uid, {
        name: `Trial Room - ${market}`,
        cashBalance: wallet.toString()
      });

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
          last_updated: new Date().toISOString()
        };
        
        MOCK_TRIAL_ROOM_DATA = {
          ...MOCK_TRIAL_ROOM_DATA!,
          ...updatedData,
          last_updated: new Date().toISOString()
        };
        
        return MOCK_TRIAL_ROOM_DATA;
      }

      // Authentication removed - using demo user
const user = { uid: "demo-user-123" };
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Get trial room portfolio
      const portfolios = await getPortfolios(user.uid);
      const trialPortfolio = portfolios.find(p => p.name.includes("Trial Room"));
      
      if (!trialPortfolio) {
        throw new Error("Trial room not found");
      }

      const totalCost = price * quantity;

      // Check if user has enough cash
      if (parseFloat(trialPortfolio.cashBalance) < totalCost) {
        throw new Error("Insufficient funds");
      }

      // Get current holdings
      const holdings = await getHoldings(trialPortfolio.id);
      const existingHolding = holdings.find(h => h.symbol === symbol);

      // Calculate new average cost if holding exists
      let newAverageCost = price;
      let newQuantity = quantity;

      if (existingHolding) {
        const currentQuantity = parseFloat(existingHolding.quantity);
        const currentCost = parseFloat(existingHolding.averageCost);
        const totalShares = currentQuantity + quantity;
        const totalCostBasis = (currentQuantity * currentCost) + totalCost;
        newAverageCost = totalCostBasis / totalShares;
        newQuantity = totalShares;
      }

      // Update or create holding
      await upsertHolding({
        portfolioId: trialPortfolio.id,
        userId: user.uid,
        symbol,
        companyName: name,
        quantity: newQuantity.toString(),
        averageCost: newAverageCost.toString(),
        exchange
      });

      // Add transaction
      await addTransaction({
        portfolioId: trialPortfolio.id,
        symbol,
        type: "BUY",
        quantity: quantity.toString(),
        price: price.toString(),
        total: totalCost.toString(),
        exchange
      });

      // Update portfolio cash balance
      const newCashBalance = parseFloat(trialPortfolio.cashBalance) - totalCost;
      await updatePortfolio(trialPortfolio.id, {
        cashBalance: newCashBalance.toString()
      });

      // Return updated trial room data
      return await this.getUserTrialRoom();
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
          last_updated: new Date().toISOString()
        };
        
        MOCK_TRIAL_ROOM_DATA = {
          ...MOCK_TRIAL_ROOM_DATA!,
          ...updatedData,
          last_updated: new Date().toISOString()
        };
        
        return MOCK_TRIAL_ROOM_DATA;
      }

      // Authentication removed - using demo user
const user = { uid: "demo-user-123" };
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Get trial room portfolio
      const portfolios = await getPortfolios(user.uid);
      const trialPortfolio = portfolios.find(p => p.name.includes("Trial Room"));
      
      if (!trialPortfolio) {
        throw new Error("Trial room not found");
      }

      // Get current holdings
      const holdings = await getHoldings(trialPortfolio.id);
      const existingHolding = holdings.find(h => h.symbol === symbol);
      
      if (!existingHolding) {
        throw new Error("You don't own any shares of this stock");
      }

      const currentQuantity = parseFloat(existingHolding.quantity);
      if (currentQuantity < quantity) {
        throw new Error(`You only have ${currentQuantity} shares to sell`);
      }

      const saleAmount = price * quantity;
      const newCashBalance = parseFloat(trialPortfolio.cashBalance) + saleAmount;

      // Update holding quantity or remove if all shares are sold
      const newQuantity = currentQuantity - quantity;
      if (newQuantity > 0) {
        await upsertHolding({
          portfolioId: trialPortfolio.id,
          userId: user.uid,
          symbol,
          companyName: name,
          quantity: newQuantity.toString(),
          averageCost: existingHolding.averageCost,
          exchange: existingHolding.exchange || "NSE"
        });
      }
      // Note: We would need a deleteHolding function to completely remove holdings

      // Add transaction
      await addTransaction({
        portfolioId: trialPortfolio.id,
        symbol,
        type: "SELL",
        quantity: quantity.toString(),
        price: price.toString(),
        total: saleAmount.toString(),
        exchange: existingHolding.exchange || "NSE"
      });

      // Update portfolio cash balance
      await updatePortfolio(trialPortfolio.id, {
        cashBalance: newCashBalance.toString()
      });

      // Return updated trial room data
      return await this.getUserTrialRoom();
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