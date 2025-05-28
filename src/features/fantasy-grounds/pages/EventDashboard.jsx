import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon, BarChart3Icon, ClockIcon, AlertCircle, UserIcon } from "lucide-react";
import { doc, getDoc, onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StockMarketView from "../components/StockMarketView";
import HoldingsTable from "../components/HoldingsTable";
import TransactionsList from "../components/TransactionsList";
import LeaderboardTable from "../components/LeaderboardTable";

const EventDashboard = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [userVault, setUserVault] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("portfolio");
  
  // Calculate ROI percentage
  const calculateROI = () => {
    if (!userVault || !event) return 0;
    
    const totalValue = userVault.vaultBalance + portfolioValue;
    const initialVault = userVault.initialVault;
    
    return ((totalValue - initialVault) / initialVault) * 100;
  };
  
  // Fetch event and user data
  useEffect(() => {
    if (!user || !eventId) return;
    
    setLoading(true);
    
    const fetchEventData = async () => {
      try {
        // Get event details
        const eventDoc = await getDoc(doc(db, "fantasyEvents", eventId));
        
        if (!eventDoc.exists()) {
          throw new Error("Event not found");
        }
        
        const eventData = {
          id: eventDoc.id,
          ...eventDoc.data(),
          startDate: eventDoc.data().startDate?.toDate(),
          endDate: eventDoc.data().endDate?.toDate()
        };
        
        setEvent(eventData);
        
        // Check if user is participating
        const participantDoc = await getDoc(doc(db, "fantasyEvents", eventId, "participants", user.uid));
        
        if (!participantDoc.exists()) {
          throw new Error("You are not participating in this event");
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
        setError(error.message);
      }
    };
    
    fetchEventData();
    
    // Set up real-time listeners
    const vaultUnsubscribe = onSnapshot(
      doc(db, "users", user.uid, "fantasyState", eventId),
      (doc) => {
        if (doc.exists()) {
          setUserVault(doc.data());
        } else {
          setError("Vault data not found");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error in vault listener:", error);
        setError("Failed to load your portfolio");
        setLoading(false);
      }
    );
    
    // Leaderboard listener (top 20)
    const leaderboardUnsubscribe = onSnapshot(
      query(
        collection(db, "fantasyEvents", eventId, "leaderboard"),
        orderBy("ROI", "desc"),
        limit(20)
      ),
      (snapshot) => {
        const leaderboardData = snapshot.docs.map((doc, index) => ({
          rank: index + 1,
          ...doc.data()
        }));
        setLeaderboard(leaderboardData);
      },
      (error) => {
        console.error("Error in leaderboard listener:", error);
      }
    );
    
    return () => {
      vaultUnsubscribe();
      leaderboardUnsubscribe();
    };
  }, [eventId, user]);
  
  // Calculate portfolio value when holdings change
  useEffect(() => {
    if (!userVault || !userVault.holdings) {
      setPortfolioValue(0);
      return;
    }
    
    // This is a simplified calculation
    // In a real app, you would fetch current prices for all holdings
    const calculateValue = async () => {
      // For now, we'll just use the bought prices
      const value = userVault.holdings.reduce((total, holding) => {
        return total + (holding.currentPrice || holding.boughtPrice) * holding.qty;
      }, 0);
      
      setPortfolioValue(value);
    };
    
    calculateValue();
  }, [userVault]);
  
  // Redirect if not logged in
  if (!user) {
    navigate("/login", { state: { redirectTo: `/fantasy-grounds/dashboard/${eventId}` } });
    return null;
  }
  
  // Format currency based on market
  const formatCurrency = (value) => {
    if (!event) return value?.toLocaleString();
    
    const currencySymbol = event.market === "NSE" ? "₹" : "$";
    return `${currencySymbol}${value?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };
  
  // Show error if any
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => navigate("/fantasy-grounds/events")}
          >
            Back to Events
          </Button>
        </Alert>
      </div>
    );
  }
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }
  
  // Calculate ROI
  const roi = calculateROI();
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        {/* Event header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{event?.name}</h1>
            <p className="text-muted-foreground">
              {event?.market} Market
              {event?.endDate && (
                <span> · Ends {new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }).format(event.endDate)}</span>
              )}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/fantasy-grounds/events")}
          >
            Back to Events
          </Button>
        </div>
        
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Vault Balance</CardTitle>
              <CardDescription>Available funds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSignIcon className="h-6 w-6 text-primary mr-2" />
                <span className="text-3xl font-bold">{formatCurrency(userVault?.vaultBalance)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Portfolio Value</CardTitle>
              <CardDescription>Value of current holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart3Icon className="h-6 w-6 text-primary mr-2" />
                <span className="text-3xl font-bold">{formatCurrency(portfolioValue)}</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Portfolio: {formatCurrency(portfolioValue)}</span>
                  <span>
                    {((portfolioValue / (userVault?.vaultBalance + portfolioValue)) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(portfolioValue / (userVault?.vaultBalance + portfolioValue)) * 100} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Performance</CardTitle>
              <CardDescription>Your return on investment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {roi >= 0 ? (
                  <TrendingUpIcon className="h-6 w-6 text-green-500 mr-2" />
                ) : (
                  <TrendingDownIcon className="h-6 w-6 text-red-500 mr-2" />
                )}
                <span className={`text-3xl font-bold ${roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {roi > 0 ? '+' : ''}{roi.toFixed(2)}%
                </span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <ClockIcon className="h-3 w-3 inline mr-1" />
                <span>Started with {formatCurrency(userVault?.initialVault)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Current Holdings</CardTitle>
                <CardDescription>Your stock portfolio for this event</CardDescription>
              </CardHeader>
              <CardContent>
                <HoldingsTable 
                  holdings={userVault?.holdings || []} 
                  market={event?.market} 
                  eventId={eventId}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="market">
            <StockMarketView 
              market={event?.market} 
              eventId={eventId}
              vaultBalance={userVault?.vaultBalance}
            />
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Top performers in this event</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardTable 
                  leaderboard={leaderboard} 
                  currentUser={user?.uid}
                  market={event?.market}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your trading activity</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionsList 
                  transactions={userVault?.transactions || []} 
                  market={event?.market}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Your Rank card */}
        {leaderboard.length > 0 && (
          <Card className="bg-muted/20">
            <CardContent className="py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarImage src={user?.photoURL} />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p className="font-medium">{user?.displayName || user?.email?.split('@')[0]}</p>
                    <p className="text-sm text-muted-foreground">
                      Total Value: {formatCurrency(userVault?.vaultBalance + portfolioValue)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Your Rank</p>
                    <p className="text-xl font-bold">
                      {leaderboard.findIndex(entry => entry.uid === user?.uid) + 1}
                      <span className="text-sm font-normal text-muted-foreground">/{event?.participantCount || 0}</span>
                    </p>
                  </div>
                  
                  <Badge className={roi >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                    {roi.toFixed(2)}% ROI
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventDashboard; 