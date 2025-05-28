import React, { createContext, useContext, useState, useEffect } from 'react';
import { Competition, Portfolio, Stock } from '@/types/fantasy-grounds';
import { db, auth } from '@/firebase/config';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

interface FantasyGroundsContextType {
  competitions: Competition[];
  activeCompetition: Competition | null;
  portfolio: Portfolio | null;
  stocks: Stock[];
  loading: boolean;
  error: string | null;
  setActiveCompetition: (competition: Competition | null) => void;
}

const FantasyGroundsContext = createContext<FantasyGroundsContextType | undefined>(undefined);

export const FantasyGroundsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [activeCompetition, setActiveCompetition] = useState<Competition | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch competitions
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const competitionsQuery = query(
      collection(db, 'competitions'),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(
      competitionsQuery,
      (snapshot) => {
        const competitionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          startTime: doc.data().startTime.toDate(),
          endTime: doc.data().endTime.toDate(),
          createdAt: doc.data().createdAt.toDate(),
        })) as Competition[];
        
        setCompetitions(competitionsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching competitions:', err);
        setError('Failed to load competitions');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch portfolio when active competition changes
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !activeCompetition) {
      setPortfolio(null);
      return;
    }

    const portfolioQuery = query(
      collection(db, 'portfolios'),
      where('userId', '==', user.uid),
      where('competitionId', '==', activeCompetition.id)
    );

    const unsubscribe = onSnapshot(
      portfolioQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setPortfolio(null);
          return;
        }

        const portfolioData = snapshot.docs[0].data() as Portfolio;
        setPortfolio(portfolioData);
      },
      (err) => {
        console.error('Error fetching portfolio:', err);
        setError('Failed to load portfolio');
      }
    );

    return () => unsubscribe();
  }, [activeCompetition]);

  const value = {
    competitions,
    activeCompetition,
    portfolio,
    stocks,
    loading,
    error,
    setActiveCompetition,
  };

  return (
    <FantasyGroundsContext.Provider value={value}>
      {children}
    </FantasyGroundsContext.Provider>
  );
};

export const useFantasyGrounds = () => {
  const context = useContext(FantasyGroundsContext);
  if (context === undefined) {
    throw new Error('useFantasyGrounds must be used within a FantasyGroundsProvider');
  }
  return context;
};
