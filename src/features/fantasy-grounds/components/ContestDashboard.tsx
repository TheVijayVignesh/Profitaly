import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, CalendarIcon, UsersIcon, DollarSignIcon } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LiveLeaderboard from './LiveLeaderboard';
import PortfolioTracker from './PortfolioTracker';
import StockMarketView from './StockMarketView';

interface Contest {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  market: string;
  vaultSize: number;
  participantCount: number;
  createdBy: string;
  creatorName: string;
}

const ContestDashboard: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('portfolio');
  
  // Fetch contest details
  useEffect(() => {
    const fetchContest = async () => {
      if (!contestId) {
        navigate('/fantasy-grounds/events');
        return;
      }
      
      try {
        const contestDoc = await getDoc(doc(db, 'fantasyEvents', contestId));
        
        if (!contestDoc.exists()) {
          navigate('/fantasy-grounds/events');
          return;
        }
        
        const data = contestDoc.data();
        setContest({
          id: contestDoc.id,
          ...data,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate()
        } as Contest);
      } catch (error) {
        console.error('Error fetching contest:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContest();
  }, [contestId, navigate]);
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculate contest status
  const getContestStatus = (): { status: string; variant: 'default' | 'secondary' | 'outline' } => {
    if (!contest) return { status: 'Unknown', variant: 'outline' };
    
    const now = new Date();
    if (now < contest.startDate) {
      return { status: 'Upcoming', variant: 'secondary' };
    } else if (now > contest.endDate) {
      return { status: 'Completed', variant: 'outline' };
    } else {
      return { status: 'Active', variant: 'default' };
    }
  };
  
  if (!currentUser) {
    navigate('/login', { state: { redirectTo: `/fantasy-grounds/contest/${contestId}` } });
    return null;
  }
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/fantasy-grounds/events')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          {loading ? (
            <Skeleton className="h-4 w-48" />
          ) : (
            <div>
              <h1 className="text-2xl font-bold">{contest?.name}</h1>
              <p className="text-sm text-muted-foreground">
                Created by {contest?.creatorName}
              </p>
            </div>
          )}
        </div>
        
        {!loading && contest && (
          <Badge variant={getContestStatus().variant}>
            {getContestStatus().status}
          </Badge>
        )}
      </div>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : contest ? (
        <>
          <Card>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-4">
                  <DollarSignIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Initial Balance</p>
                    <p className="text-lg font-semibold">{formatCurrency(contest.vaultSize)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <UsersIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Participants</p>
                    <p className="text-lg font-semibold">{contest.participantCount}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <p className="text-lg font-semibold">{formatDate(contest.startDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">End Date</p>
                    <p className="text-lg font-semibold">{formatDate(contest.endDate)}</p>
                  </div>
                </div>
              </div>
              
              {contest.description && (
                <p className="mt-6 text-sm text-muted-foreground">
                  {contest.description}
                </p>
              )}
            </CardContent>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio">
              <PortfolioTracker />
            </TabsContent>
            
            <TabsContent value="market">
              <StockMarketView market={contest.market} />
            </TabsContent>
            
            <TabsContent value="leaderboard">
              <LiveLeaderboard />
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
};

export default ContestDashboard;
