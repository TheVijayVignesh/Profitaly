import { 
  Competition, 
  Portfolio, 
  Participant, 
  Transaction, 
  MarketRegion 
} from '@/types/fantasy-grounds';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp,
  arrayUnion,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { fetchStockData } from './stockDataService';

/**
 * Create a new competition
 */
export const createCompetition = async (
  title: string,
  description: string,
  startTime: Date,
  endTime: Date,
  marketRegion: MarketRegion,
  initialBalance: number
): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const competitionRef = await addDoc(collection(db, 'competitions'), {
      title,
      description,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      marketRegion,
      initialBalance,
      createdBy: user.uid,
      participants: [],
      isActive: true,
      createdAt: serverTimestamp()
    });

    return competitionRef.id;
  } catch (error) {
    console.error('Error creating competition:', error);
    throw error;
  }
};

/**
 * Join a competition
 */
export const joinCompetition = async (competitionId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get competition details
    const competitionRef = doc(db, 'competitions', competitionId);
    const competitionSnap = await getDoc(competitionRef);

    if (!competitionSnap.exists()) {
      throw new Error('Competition not found');
    }

    const competitionData = competitionSnap.data() as Competition;
    
    // Check if user is already a participant
    if (competitionData.participants.includes(user.uid)) {
      throw new Error('You have already joined this competition');
    }

    // Check if competition has started
    const now = new Date();
    const startTime = competitionData.startTime.toDate();
    const endTime = competitionData.endTime.toDate();

    if (now > endTime) {
      throw new Error('This competition has already ended');
    }

    // Add user to participants
    await updateDoc(competitionRef, {
      participants: arrayUnion(user.uid)
    });

    // Create portfolio for user
    await addDoc(collection(db, 'portfolios'), {
      userId: user.uid,
      competitionId,
      walletBalance: competitionData.initialBalance,
      positions: [],
      transactions: [],
      totalValue: competitionData.initialBalance,
      roi: 0,
      createdAt: serverTimestamp()
    });

    // Add user to participants collection
    await addDoc(collection(db, 'participants'), {
      userId: user.uid,
      competitionId,
      displayName: user.displayName || 'Anonymous',
      photoURL: user.photoURL || '',
      walletBalance: competitionData.initialBalance,
      portfolioValue: competitionData.initialBalance,
      roi: 0,
      joinedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error joining competition:', error);
    throw error;
  }
};

/**
 * Get competition details
 */
export const getCompetition = async (competitionId: string): Promise<Competition> => {
  try {
    const competitionRef = doc(db, 'competitions', competitionId);
    const competitionSnap = await getDoc(competitionRef);

    if (!competitionSnap.exists()) {
      throw new Error('Competition not found');
    }

    const data = competitionSnap.data();
    return {
      id: competitionSnap.id,
      ...data,
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
      createdAt: data.createdAt.toDate()
    } as Competition;
  } catch (error) {
    console.error('Error getting competition:', error);
    throw error;
  }
};

/**
 * Get user's portfolio for a competition
 */
export const getPortfolio = async (competitionId: string): Promise<Portfolio | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const portfolioQuery = query(
      collection(db, 'portfolios'),
      where('userId', '==', user.uid),
      where('competitionId', '==', competitionId)
    );

    const portfolioSnap = await getDocs(portfolioQuery);

    if (portfolioSnap.empty) {
      return null;
    }

    return portfolioSnap.docs[0].data() as Portfolio;
  } catch (error) {
    console.error('Error getting portfolio:', error);
    throw error;
  }
};

/**
 * Get leaderboard for a competition
 */
export const getLeaderboard = async (competitionId: string): Promise<Participant[]> => {
  try {
    const participantsQuery = query(
      collection(db, 'participants'),
      where('competitionId', '==', competitionId)
    );

    const participantsSnap = await getDocs(participantsQuery);
    
    if (participantsSnap.empty) {
      return [];
    }

    const participants = participantsSnap.docs.map(doc => ({
      ...doc.data(),
      joinedAt: doc.data().joinedAt.toDate()
    })) as Participant[];

    // Sort by portfolio value (descending)
    return participants.sort((a, b) => b.portfolioValue - a.portfolioValue);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

/**
 * Buy stocks in a competition
 */
export const buyStock = async (
  competitionId: string,
  symbol: string,
  quantity: number
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get competition details
    const competitionRef = doc(db, 'competitions', competitionId);
    const competitionSnap = await getDoc(competitionRef);

    if (!competitionSnap.exists()) {
      throw new Error('Competition not found');
    }

    const competitionData = competitionSnap.data() as Competition;
    
    // Check if competition is active
    const now = new Date();
    const startTime = competitionData.startTime.toDate();
    const endTime = competitionData.endTime.toDate();

    if (now < startTime || now > endTime) {
      throw new Error('Competition is not active');
    }

    // Get current stock price
    const stock = await fetchStockData(symbol, competitionData.marketRegion);
    const totalCost = stock.price * quantity;

    // Get user's portfolio
    const portfolioQuery = query(
      collection(db, 'portfolios'),
      where('userId', '==', user.uid),
      where('competitionId', '==', competitionId)
    );

    const portfolioSnap = await getDocs(portfolioQuery);

    if (portfolioSnap.empty) {
      throw new Error('Portfolio not found');
    }

    const portfolioDoc = portfolioSnap.docs[0];
    const portfolioData = portfolioDoc.data() as Portfolio;

    // Check if user has enough balance
    if (portfolioData.walletBalance < totalCost) {
      throw new Error('Insufficient funds');
    }

    // Execute transaction
    await runTransaction(db, async (transaction) => {
      // Update wallet balance
      transaction.update(portfolioDoc.ref, {
        walletBalance: increment(-totalCost)
      });

      // Add transaction
      const transactionData: Omit<Transaction, 'id'> = {
        competitionId,
        userId: user.uid,
        symbol,
        type: 'BUY',
        quantity,
        price: stock.price,
        total: totalCost,
        timestamp: new Date()
      };

      const transactionRef = doc(collection(db, 'transactions'));
      transaction.set(transactionRef, {
        ...transactionData,
        id: transactionRef.id,
        timestamp: serverTimestamp()
      });

      // Update positions
      const existingPosition = portfolioData.positions.find(p => p.symbol === symbol);

      if (existingPosition) {
        // Update existing position
        const newTotalQuantity = existingPosition.quantity + quantity;
        const newAverageBuyPrice = (
          (existingPosition.averageBuyPrice * existingPosition.quantity) + 
          (stock.price * quantity)
        ) / newTotalQuantity;

        const newPositions = portfolioData.positions.map(p => 
          p.symbol === symbol 
            ? { 
                ...p, 
                quantity: newTotalQuantity, 
                averageBuyPrice: newAverageBuyPrice,
                currentValue: newTotalQuantity * stock.price,
                profitLoss: (stock.price - newAverageBuyPrice) * newTotalQuantity,
                profitLossPercent: ((stock.price - newAverageBuyPrice) / newAverageBuyPrice) * 100
              } 
            : p
        );

        transaction.update(portfolioDoc.ref, { positions: newPositions });
      } else {
        // Add new position
        const newPosition = {
          symbol,
          quantity,
          averageBuyPrice: stock.price,
          currentValue: quantity * stock.price,
          profitLoss: 0,
          profitLossPercent: 0
        };

        transaction.update(portfolioDoc.ref, { 
          positions: [...portfolioData.positions, newPosition] 
        });
      }

      // Update portfolio total value
      const newTotalValue = portfolioData.walletBalance - totalCost + 
        portfolioData.positions.reduce((total, position) => {
          if (position.symbol === symbol) {
            return total + ((position.quantity + quantity) * stock.price);
          }
          return total + position.currentValue;
        }, 0);

      const roi = ((newTotalValue - competitionData.initialBalance) / competitionData.initialBalance) * 100;

      transaction.update(portfolioDoc.ref, { 
        totalValue: newTotalValue,
        roi
      });

      // Update participant record
      const participantQuery = query(
        collection(db, 'participants'),
        where('userId', '==', user.uid),
        where('competitionId', '==', competitionId)
      );

      const participantSnap = await getDocs(participantQuery);
      
      if (!participantSnap.empty) {
        const participantDoc = participantSnap.docs[0];
        transaction.update(participantDoc.ref, {
          walletBalance: increment(-totalCost),
          portfolioValue: newTotalValue,
          roi
        });
      }
    });
  } catch (error) {
    console.error('Error buying stock:', error);
    throw error;
  }
};

/**
 * Sell stocks in a competition
 */
export const sellStock = async (
  competitionId: string,
  symbol: string,
  quantity: number
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get competition details
    const competitionRef = doc(db, 'competitions', competitionId);
    const competitionSnap = await getDoc(competitionRef);

    if (!competitionSnap.exists()) {
      throw new Error('Competition not found');
    }

    const competitionData = competitionSnap.data() as Competition;
    
    // Check if competition is active
    const now = new Date();
    const startTime = competitionData.startTime.toDate();
    const endTime = competitionData.endTime.toDate();

    if (now < startTime || now > endTime) {
      throw new Error('Competition is not active');
    }

    // Get current stock price
    const stock = await fetchStockData(symbol, competitionData.marketRegion);
    const totalValue = stock.price * quantity;

    // Get user's portfolio
    const portfolioQuery = query(
      collection(db, 'portfolios'),
      where('userId', '==', user.uid),
      where('competitionId', '==', competitionId)
    );

    const portfolioSnap = await getDocs(portfolioQuery);

    if (portfolioSnap.empty) {
      throw new Error('Portfolio not found');
    }

    const portfolioDoc = portfolioSnap.docs[0];
    const portfolioData = portfolioDoc.data() as Portfolio;

    // Check if user has the position and enough quantity
    const position = portfolioData.positions.find(p => p.symbol === symbol);
    
    if (!position) {
      throw new Error('You do not own this stock');
    }

    if (position.quantity < quantity) {
      throw new Error('Insufficient quantity');
    }

    // Execute transaction
    await runTransaction(db, async (transaction) => {
      // Update wallet balance
      transaction.update(portfolioDoc.ref, {
        walletBalance: increment(totalValue)
      });

      // Add transaction
      const transactionData: Omit<Transaction, 'id'> = {
        competitionId,
        userId: user.uid,
        symbol,
        type: 'SELL',
        quantity,
        price: stock.price,
        total: totalValue,
        timestamp: new Date()
      };

      const transactionRef = doc(collection(db, 'transactions'));
      transaction.set(transactionRef, {
        ...transactionData,
        id: transactionRef.id,
        timestamp: serverTimestamp()
      });

      // Update positions
      const newQuantity = position.quantity - quantity;
      
      if (newQuantity === 0) {
        // Remove position if all shares are sold
        const newPositions = portfolioData.positions.filter(p => p.symbol !== symbol);
        transaction.update(portfolioDoc.ref, { positions: newPositions });
      } else {
        // Update position
        const newPositions = portfolioData.positions.map(p => 
          p.symbol === symbol 
            ? { 
                ...p, 
                quantity: newQuantity,
                currentValue: newQuantity * stock.price,
                profitLoss: (stock.price - p.averageBuyPrice) * newQuantity,
                profitLossPercent: ((stock.price - p.averageBuyPrice) / p.averageBuyPrice) * 100
              } 
            : p
        );

        transaction.update(portfolioDoc.ref, { positions: newPositions });
      }

      // Update portfolio total value
      const newTotalValue = portfolioData.walletBalance + totalValue + 
        portfolioData.positions.reduce((total, p) => {
          if (p.symbol === symbol) {
            return total + ((p.quantity - quantity) * stock.price);
          }
          return total + p.currentValue;
        }, 0);

      const roi = ((newTotalValue - competitionData.initialBalance) / competitionData.initialBalance) * 100;

      transaction.update(portfolioDoc.ref, { 
        totalValue: newTotalValue,
        roi
      });

      // Update participant record
      const participantQuery = query(
        collection(db, 'participants'),
        where('userId', '==', user.uid),
        where('competitionId', '==', competitionId)
      );

      const participantSnap = await getDocs(participantQuery);
      
      if (!participantSnap.empty) {
        const participantDoc = participantSnap.docs[0];
        transaction.update(participantDoc.ref, {
          walletBalance: increment(totalValue),
          portfolioValue: newTotalValue,
          roi
        });
      }
    });
  } catch (error) {
    console.error('Error selling stock:', error);
    throw error;
  }
};
