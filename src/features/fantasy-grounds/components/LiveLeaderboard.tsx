import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  vaultBalance: number;
  ROI: number;
  rank?: number;
}

const LiveLeaderboard: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    if (!contestId) return;
    
    try {
      setRefreshing(true);
      
      const leaderboardRef = collection(db, 'fantasyEvents', contestId, 'leaderboard');
      const leaderboardQuery = query(leaderboardRef, orderBy('vaultBalance', 'desc'));
      const snapshot = await getDocs(leaderboardQuery);
      
      const entries: LeaderboardEntry[] = [];
      let index = 0;
      snapshot.forEach((doc) => {
        const data = doc.data() as LeaderboardEntry;
        entries.push({
          ...data,
          rank: index + 1
        });
        index++;
      });
      
      setLeaderboard(entries);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [contestId]);
  
  // Initial fetch
  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchLeaderboard();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [contestId, fetchLeaderboard]);
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
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
  
  // Format last updated time
  const formatLastUpdated = (): string => {
    if (!lastUpdated) return 'Never';
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }).format(lastUpdated);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Live Leaderboard</CardTitle>
            <CardDescription>
              Real-time ranking of all participants
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLeaderboard} 
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Last updated: {formatLastUpdated()}
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No participants yet
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-2 py-2 px-2 text-sm font-medium text-muted-foreground">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Trader</div>
              <div className="col-span-3 text-right">Portfolio Value</div>
              <div className="col-span-3 text-right">Gain/Loss</div>
            </div>
            
            {leaderboard.map((entry) => (
              <div 
                key={entry.uid} 
                className="grid grid-cols-12 gap-2 py-3 px-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="col-span-1 flex items-center font-medium">
                  {entry.rank}
                </div>
                <div className="col-span-5 flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.photoURL || undefined} />
                    <AvatarFallback>
                      {entry.displayName?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="truncate">
                    <p className="font-medium truncate">{entry.displayName}</p>
                  </div>
                </div>
                <div className="col-span-3 flex items-center justify-end font-medium">
                  {formatCurrency(entry.vaultBalance)}
                </div>
                <div className={`col-span-3 flex items-center justify-end font-medium ${entry.ROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.ROI >= 0 ? '+' : ''}{formatPercentage(entry.ROI)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveLeaderboard;
