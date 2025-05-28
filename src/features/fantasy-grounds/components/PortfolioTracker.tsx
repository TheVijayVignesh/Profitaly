import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { fetchStockData } from '@/services/fantasy-grounds/stockDataService';
import { toast } from '@/components/ui/use-toast';

interface Position {
  symbol: string;
  name: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface Transaction {
  id: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
}

interface Portfolio {
  vaultBalance: number;
  initialVault: number;
  positions: Position[];
  transactions: Transaction[];
  lastUpdated?: Date;
}

const PortfolioTracker: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const { currentUser } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [roi, setRoi] = useState<number>(0);
  
  // Fetch portfolio data
  const fetchPortfolio = async () => {
    if (!currentUser || !contestId) return;
    
    try {
      setRefreshing(true);
      
      const portfolioRef = doc(db, 'users', currentUser.uid, 'fantasyState', contestId);
      const portfolioSnap = await getDoc(portfolioRef);
      
      if (!portfolioSnap.exists()) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      const portfolioData = portfolioSnap.data() as Portfolio;
      
      // Update current prices for all positions
      const updatedPositions = await Promise.all(
        (portfolioData.positions || []).map(async (position) => {
          try {
            const stockData = await fetchStockData(position.symbol);
            const currentPrice = stockData?.price || position.averageBuyPrice;
            const currentValue = currentPrice * position.quantity;
            const profitLoss = currentValue - (position.averageBuyPrice * position.quantity);
            const profitLossPercent = ((currentPrice / position.averageBuyPrice) - 1) * 100;
            
            return {
              ...position,
              currentPrice,
              currentValue,
              profitLoss,
              profitLossPercent
            };
          } catch (error) {
            console.error(`Error updating price for ${position.symbol}:`, error);
            return position;
          }
        })
      );
      
      // Calculate total portfolio value
      const positionsValue = updatedPositions.reduce((sum, position) => sum + position.currentValue, 0);
      const calculatedTotalValue = portfolioData.vaultBalance + positionsValue;
      const calculatedRoi = ((calculatedTotalValue / portfolioData.initialVault) - 1) * 100;
      
      setPortfolio({
        ...portfolioData,
        positions: updatedPositions,
        lastUpdated: new Date()
      });
      setTotalValue(calculatedTotalValue);
      setRoi(calculatedRoi);
      
      // Update leaderboard with new portfolio value
      const leaderboardRef = doc(db, 'fantasyEvents', contestId, 'leaderboard', currentUser.uid);
      await updateDoc(leaderboardRef, {
        vaultBalance: calculatedTotalValue,
        ROI: calculatedRoi,
        lastUpdated: serverTimestamp()
      });
      
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to update portfolio data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchPortfolio();
    
    // Auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      fetchPortfolio();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [contestId, currentUser]);
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Portfolio Tracker</CardTitle>
            <CardDescription>
              Track your mock trading performance
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPortfolio} 
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Update Prices
          </Button>
        </div>
        {portfolio?.lastUpdated && (
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {formatDate(portfolio.lastUpdated)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !portfolio ? (
          <div className="text-center py-8 text-muted-foreground">
            No portfolio data available
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                    </div>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cash Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolio.vaultBalance)}</p>
                    </div>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Return on Investment</p>
                      <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {roi >= 0 ? '+' : ''}{formatPercentage(roi)}
                      </p>
                    </div>
                    {roi >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="positions">
              <TabsList className="mb-4">
                <TabsTrigger value="positions">Positions</TabsTrigger>
                <TabsTrigger value="transactions">Transaction History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="positions">
                {portfolio.positions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-md">
                    <Activity className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>You don't have any open positions</p>
                    <p className="text-sm">Start trading to build your portfolio</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left py-3 px-4 font-medium">Symbol</th>
                            <th className="text-left py-3 px-4 font-medium">Name</th>
                            <th className="text-right py-3 px-4 font-medium">Quantity</th>
                            <th className="text-right py-3 px-4 font-medium">Avg. Price</th>
                            <th className="text-right py-3 px-4 font-medium">Current Price</th>
                            <th className="text-right py-3 px-4 font-medium">Value</th>
                            <th className="text-right py-3 px-4 font-medium">P/L</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {portfolio.positions.map((position) => (
                            <tr key={position.symbol} className="hover:bg-muted/30">
                              <td className="py-3 px-4 font-medium">{position.symbol}</td>
                              <td className="py-3 px-4">{position.name}</td>
                              <td className="py-3 px-4 text-right">{position.quantity}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(position.averageBuyPrice)}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(position.currentPrice)}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(position.currentValue)}</td>
                              <td className={`py-3 px-4 text-right ${position.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {position.profitLoss >= 0 ? '+' : ''}{formatCurrency(position.profitLoss)}
                                <br />
                                <span className="text-xs">
                                  {position.profitLossPercent >= 0 ? '+' : ''}{formatPercentage(position.profitLossPercent)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="transactions">
                {portfolio.transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-md">
                    <Activity className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No transaction history</p>
                    <p className="text-sm">Your trading activity will appear here</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left py-3 px-4 font-medium">Date</th>
                            <th className="text-left py-3 px-4 font-medium">Type</th>
                            <th className="text-left py-3 px-4 font-medium">Symbol</th>
                            <th className="text-right py-3 px-4 font-medium">Quantity</th>
                            <th className="text-right py-3 px-4 font-medium">Price</th>
                            <th className="text-right py-3 px-4 font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {portfolio.transactions
                            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                            .map((transaction) => (
                              <tr key={transaction.id} className="hover:bg-muted/30">
                                <td className="py-3 px-4">{formatDate(transaction.timestamp)}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    transaction.type === 'BUY' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  }`}>
                                    {transaction.type}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-medium">{transaction.symbol}</td>
                                <td className="py-3 px-4 text-right">{transaction.quantity}</td>
                                <td className="py-3 px-4 text-right">{formatCurrency(transaction.price)}</td>
                                <td className="py-3 px-4 text-right">{formatCurrency(transaction.total)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioTracker;
