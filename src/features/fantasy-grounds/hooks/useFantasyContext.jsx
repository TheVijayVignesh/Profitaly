import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

// Create context
const FantasyContext = createContext();

// Fantasy provider component
export const FantasyProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fantasyData, setFantasyData] = useState(null);
  const [leagueData, setLeagueData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // Initialize or load fantasy data when user logs in
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setFantasyData(null);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const fantasyDocRef = doc(db, "fantasyData", user.uid);

    // Check if user has fantasy data
    const loadFantasyData = async () => {
      setLoading(true);
      
      try {
        const fantasySnapshot = await getDoc(fantasyDocRef);
        
        if (fantasySnapshot.exists()) {
          // User already has fantasy data
          const data = fantasySnapshot.data();
          setFantasyData(data);
          
          // If user is in a league, load league data
          if (data.league) {
            const leagueDocRef = doc(db, "fantasyLeagues", data.league);
            const leagueSnapshot = await getDoc(leagueDocRef);
            
            if (leagueSnapshot.exists()) {
              setLeagueData(leagueSnapshot.data());
            }
          }
        } else {
          // Check if user has fantasyConfig in their user profile
          const userSnapshot = await getDoc(userDocRef);
          
          if (userSnapshot.exists() && userSnapshot.data().fantasyConfig) {
            // User has config but no data yet, initialize their fantasy data
            const config = userSnapshot.data().fantasyConfig;
            const initialFantasyData = {
              uid: user.uid,
              wallet: config.walletSize || 100000,
              market: config.market || "NSE",
              league: config.league || null,
              holdings: [],
              transactions: [],
              initialWallet: config.walletSize || 100000,
              createdAt: new Date()
            };
            
            // Create fantasy data document
            await setDoc(fantasyDocRef, initialFantasyData);
            setFantasyData(initialFantasyData);
            
            // If user joined a league, update the league document
            if (config.league) {
              // Implementation for joining league would go here
              // This would update the leagueData state as well
            }
          }
        }
      } catch (error) {
        console.error("Error loading fantasy data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFantasyData();
    
    // Set up real-time listeners for fantasy data updates
    const unsubscribeFantasy = onSnapshot(fantasyDocRef, (doc) => {
      if (doc.exists()) {
        setFantasyData(doc.data());
      }
    });
    
    // Return cleanup function
    return () => {
      unsubscribeFantasy();
    };
  }, [user]);
  
  // Set up real-time listener for league data and leaderboard
  useEffect(() => {
    if (!user || !fantasyData || !fantasyData.league) return;
    
    const leagueDocRef = doc(db, "fantasyLeagues", fantasyData.league);
    
    const unsubscribeLeague = onSnapshot(leagueDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLeagueData(data);
        
        // Process leaderboard data
        if (data.leaderboard) {
          const leaderboardArray = Object.entries(data.leaderboard)
            .map(([uid, userData]) => ({
              uid,
              ...userData
            }))
            .sort((a, b) => b.ROI - a.ROI);
            
          setLeaderboard(leaderboardArray);
        }
      }
    });
    
    return () => {
      unsubscribeLeague();
    };
  }, [user, fantasyData]);
  
  // Helper function to calculate current portfolio value
  const calculatePortfolioValue = async () => {
    if (!fantasyData || !fantasyData.holdings || fantasyData.holdings.length === 0) {
      return 0;
    }
    
    // In a real implementation, you would fetch current prices for all holdings
    // For now, we'll use a placeholder calculation
    let totalValue = 0;
    
    // TODO: Replace with actual API calls to get current prices
    for (const holding of fantasyData.holdings) {
      // This is just a placeholder - in reality you would get the current price from an API
      const currentPrice = holding.boughtPrice; // Replace with API call
      totalValue += currentPrice * holding.qty;
    }
    
    return totalValue;
  };
  
  // Function to buy stocks
  const buyStock = async (symbol, qty, price) => {
    if (!user || !fantasyData) return;
    
    const cost = qty * price;
    
    // Check if user has enough funds
    if (fantasyData.wallet < cost) {
      throw new Error("Insufficient funds in wallet");
    }
    
    // Reference to user's fantasy data document
    const fantasyDocRef = doc(db, "fantasyData", user.uid);
    
    // Create a new holding or update existing one
    const existingHoldingIndex = fantasyData.holdings.findIndex(h => h.symbol === symbol);
    let updatedHoldings = [...fantasyData.holdings];
    
    if (existingHoldingIndex >= 0) {
      // Update existing holding
      const existingHolding = updatedHoldings[existingHoldingIndex];
      const newQty = existingHolding.qty + qty;
      const newAvgPrice = ((existingHolding.qty * existingHolding.boughtPrice) + (qty * price)) / newQty;
      
      updatedHoldings[existingHoldingIndex] = {
        ...existingHolding,
        qty: newQty,
        boughtPrice: newAvgPrice
      };
    } else {
      // Add new holding
      updatedHoldings.push({
        symbol,
        qty,
        boughtPrice: price
      });
    }
    
    // Create transaction record
    const transaction = {
      type: "BUY",
      symbol,
      qty,
      price,
      total: cost,
      timestamp: new Date()
    };
    
    // Update fantasy data with new wallet amount, holdings, and transaction
    const updatedFantasyData = {
      ...fantasyData,
      wallet: fantasyData.wallet - cost,
      holdings: updatedHoldings,
      transactions: [transaction, ...fantasyData.transactions]
    };
    
    // Save to Firestore
    await setDoc(fantasyDocRef, updatedFantasyData);
  };
  
  // Function to sell stocks
  const sellStock = async (symbol, qty, price) => {
    if (!user || !fantasyData) return;
    
    // Find the holding
    const holdingIndex = fantasyData.holdings.findIndex(h => h.symbol === symbol);
    
    if (holdingIndex === -1) {
      throw new Error(`You don't own any shares of ${symbol}`);
    }
    
    const holding = fantasyData.holdings[holdingIndex];
    
    if (holding.qty < qty) {
      throw new Error(`You only have ${holding.qty} shares of ${symbol}`);
    }
    
    // Calculate sale amount
    const saleAmount = qty * price;
    
    // Create updated holdings array
    let updatedHoldings = [...fantasyData.holdings];
    
    if (holding.qty === qty) {
      // Remove the holding completely
      updatedHoldings.splice(holdingIndex, 1);
    } else {
      // Update the holding quantity
      updatedHoldings[holdingIndex] = {
        ...holding,
        qty: holding.qty - qty
      };
    }
    
    // Create transaction record
    const transaction = {
      type: "SELL",
      symbol,
      qty,
      price,
      total: saleAmount,
      timestamp: new Date()
    };
    
    // Reference to user's fantasy data document
    const fantasyDocRef = doc(db, "fantasyData", user.uid);
    
    // Update fantasy data with new wallet amount, holdings, and transaction
    const updatedFantasyData = {
      ...fantasyData,
      wallet: fantasyData.wallet + saleAmount,
      holdings: updatedHoldings,
      transactions: [transaction, ...fantasyData.transactions]
    };
    
    // Save to Firestore
    await setDoc(fantasyDocRef, updatedFantasyData);
  };
  
  // Function to join a league
  const joinLeague = async (leagueId, initialConfig) => {
    if (!user) return;
    
    // Check if league exists
    const leagueDocRef = doc(db, "fantasyLeagues", leagueId);
    const leagueSnapshot = await getDoc(leagueDocRef);
    
    if (!leagueSnapshot.exists()) {
      throw new Error("League does not exist");
    }
    
    // Check if user is already in another league
    if (fantasyData && fantasyData.league) {
      throw new Error("You are already part of a league");
    }
    
    const walletSize = initialConfig?.walletSize || 100000;
    const market = initialConfig?.market || "NSE";
    
    // Create or update fantasy data
    const fantasyDocRef = doc(db, "fantasyData", user.uid);
    
    if (fantasyData) {
      // Update existing fantasy data
      await setDoc(fantasyDocRef, {
        ...fantasyData,
        league: leagueId,
        wallet: walletSize,
        initialWallet: walletSize,
        market: market,
        holdings: [],
        transactions: []
      });
    } else {
      // Create new fantasy data
      const newFantasyData = {
        uid: user.uid,
        wallet: walletSize,
        initialWallet: walletSize,
        market: market,
        league: leagueId,
        holdings: [],
        transactions: [],
        createdAt: new Date()
      };
      
      await setDoc(fantasyDocRef, newFantasyData);
    }
    
    // Update user's league reference
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      fantasyConfig: {
        league: leagueId,
        walletSize: walletSize,
        market: market
      }
    }, { merge: true });
    
    // Add user to league's users array
    const leagueUsers = leagueSnapshot.data().users || [];
    if (!leagueUsers.includes(user.uid)) {
      await setDoc(leagueDocRef, {
        users: [...leagueUsers, user.uid],
        leaderboard: {
          ...leagueSnapshot.data().leaderboard,
          [user.uid]: { ROI: 0, wallet: walletSize }
        }
      }, { merge: true });
    }
  };
  
  // Function to create a new league
  const createLeague = async (leagueName, isPrivate, initialConfig) => {
    if (!user) return;
    
    const walletSize = initialConfig?.walletSize || 100000;
    const market = initialConfig?.market || "NSE";
    
    // Generate a unique ID for the league
    const leagueId = `league_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create league document
    const leagueDocRef = doc(db, "fantasyLeagues", leagueId);
    await setDoc(leagueDocRef, {
      name: leagueName,
      isPrivate: isPrivate,
      createdBy: user.uid,
      createdAt: new Date(),
      users: [user.uid],
      market: market,
      walletSize: walletSize,
      leaderboard: {
        [user.uid]: { ROI: 0, wallet: walletSize }
      }
    });
    
    // Join the created league
    await joinLeague(leagueId, initialConfig);
    
    return leagueId;
  };
  
  // Function to leave current league
  const leaveLeague = async () => {
    if (!user || !fantasyData || !fantasyData.league) return;
    
    const leagueId = fantasyData.league;
    
    // Remove user from league
    const leagueDocRef = doc(db, "fantasyLeagues", leagueId);
    const leagueSnapshot = await getDoc(leagueDocRef);
    
    if (leagueSnapshot.exists()) {
      const leagueData = leagueSnapshot.data();
      const updatedUsers = leagueData.users.filter(uid => uid !== user.uid);
      
      // Create updated leaderboard without the user
      const { [user.uid]: _, ...updatedLeaderboard } = leagueData.leaderboard;
      
      await setDoc(leagueDocRef, {
        users: updatedUsers,
        leaderboard: updatedLeaderboard
      }, { merge: true });
    }
    
    // Update user's fantasy data to remove league
    const fantasyDocRef = doc(db, "fantasyData", user.uid);
    await setDoc(fantasyDocRef, {
      league: null
    }, { merge: true });
    
    // Update user's config
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      fantasyConfig: {
        league: null
      }
    }, { merge: true });
  };

  // Calculate ROI
  const calculateROI = async () => {
    if (!fantasyData) return 0;
    
    const portfolioValue = await calculatePortfolioValue();
    const currentTotal = portfolioValue + fantasyData.wallet;
    const initialWallet = fantasyData.initialWallet;
    
    const roi = ((currentTotal - initialWallet) / initialWallet) * 100;
    return parseFloat(roi.toFixed(2));
  };
  
  // Value to be provided by context
  const value = {
    loading,
    fantasyData,
    leagueData,
    leaderboard,
    buyStock,
    sellStock,
    joinLeague,
    createLeague,
    leaveLeague,
    calculatePortfolioValue,
    calculateROI
  };

  return (
    <FantasyContext.Provider value={value}>
      {children}
    </FantasyContext.Provider>
  );
};

// Custom hook to use the fantasy context
export const useFantasy = () => {
  const context = useContext(FantasyContext);
  if (context === undefined) {
    throw new Error("useFantasy must be used within a FantasyProvider");
  }
  return context;
}; 