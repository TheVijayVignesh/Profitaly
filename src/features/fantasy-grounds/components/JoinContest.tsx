import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, UsersIcon, DollarSignIcon, ClockIcon, AlertCircle, ChevronLeft, CheckIcon } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';

interface JoinContestProps {
  onJoinSuccess?: (contestId: string) => void;
}

const JoinContest: React.FC<JoinContestProps> = ({ onJoinSuccess }) => {
  const { contestId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Fetch contest details
  useEffect(() => {
    const fetchContest = async () => {
      if (!contestId) {
        navigate("/fantasy-grounds");
        return;
      }
      
      setLoading(true);
      try {
        const contestDoc = await getDoc(doc(db, "fantasyEvents", contestId));
        
        if (!contestDoc.exists()) {
          setError("Contest not found");
          navigate("/fantasy-grounds");
          return;
        }
        
        const contestData = {
          id: contestDoc.id,
          ...contestDoc.data(),
          startDate: contestDoc.data().startDate?.toDate(),
          endDate: contestDoc.data().endDate?.toDate(),
          initialBalance: contestDoc.data().initialBalance || 100000
        };
        
        // Check if contest has already ended
        if (contestData.endDate < new Date()) {
          setError("This contest has already ended");
        }
        
        // Check if user is already participating
        if (currentUser) {
          const participantDoc = await getDoc(doc(db, "fantasyEvents", contestId, "participants", currentUser.uid));
          if (participantDoc.exists()) {
            setSuccess(true);
          }
        }
        
        setContest(contestData);
      } catch (error) {
        console.error("Error fetching contest:", error);
        setError("Failed to load contest details");
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchContest();
    }
  }, [contestId, currentUser, navigate]);
  
  // Format date to readable string
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Join contest
  const handleJoinContest = async () => {
    if (!currentUser || !contest) return;
    
    setJoining(true);
    setError(null);
    
    try {
      // Create user portfolio for this contest
      const userPortfolioRef = doc(db, "users", currentUser.uid, "fantasyState", contestId);
      
      // Check if user is already a participant
      const participantRef = doc(db, 'fantasyEvents', contestId, 'participants', currentUser.uid);
      const participantDoc = await getDoc(participantRef);
      
      if (participantDoc.exists()) {
        toast({
          title: 'Already joined',
          description: 'You have already joined this contest.',
          variant: 'default',
        });
        setJoining(false);
        return;
      }
      
      // Create participant entry
      await setDoc(participantRef, {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous User',
        photoURL: currentUser.photoURL,
        joinedAt: serverTimestamp(),
        vaultBalance: contest.initialBalance || 100000, // Default to 100k if not specified
        ROI: 0,
      });
      
      // Update contest participants count
      const contestRef = doc(db, 'fantasyEvents', contestId);
      await updateDoc(contestRef, {
        participantsCount: increment(1)
      });
      
      // Create initial portfolio entry
      await setDoc(doc(db, 'fantasyEvents', contestId, 'portfolios', currentUser.uid), {
        userId: currentUser.uid,
        cash: contest.initialBalance || 100000,
        totalValue: contest.initialBalance || 100000,
        positions: [],
        transactions: [],
        lastUpdated: serverTimestamp(),
      });
      
      // Add user to leaderboard
      await setDoc(doc(db, 'fantasyEvents', contestId, 'leaderboard', currentUser.uid), {
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous User',
        photoURL: currentUser.photoURL,
        vaultBalance: contest.initialBalance || 100000,
        ROI: 0,
      });
      
      toast({
        title: 'Success!',
        description: 'You have successfully joined the contest.',
        variant: 'default',
      });
      
      // Call onJoinSuccess prop if provided, otherwise navigate
      if (onJoinSuccess && contestId) {
        onJoinSuccess(contestId);
      } else {
        navigate(`/fantasy-grounds/competition/${contestId}`);
      }
      
    } catch (error) {
      console.error('Error joining contest:', error);
      toast({
        title: 'Error',
        description: 'Failed to join the contest. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setJoining(false);
    }
  };
  
  // Redirect if not logged in
  if (!currentUser) {
    navigate("/login", { state: { redirectTo: `/fantasy-grounds/join/${contestId}` } });
    return null;
  }
  
  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate("/fantasy-grounds/events")}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Button>
      
      <div className="max-w-2xl mx-auto">
        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </CardContent>
          </Card>
        ) : error && !success ? (
          <Alert variant="destructive">
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
        ) : success ? (
          <Alert className="bg-emerald-50 border-emerald-200">
            <CheckIcon className="h-4 w-4 text-emerald-500" />
            <AlertTitle className="text-emerald-800">Already Joined</AlertTitle>
            <AlertDescription className="text-emerald-700">
              You've already joined this contest. Go to your dashboard to start trading!
            </AlertDescription>
            <Button 
              className="mt-4 bg-emerald-600 hover:bg-emerald-700" 
              onClick={() => navigate(`/fantasy-grounds/dashboard/${contestId}`)}
            >
              Go to Dashboard
            </Button>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{contest.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {contest.description || "No description provided."}
                  </CardDescription>
                </div>
                <Badge variant="outline">{contest.market}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="flex items-center gap-2">
                  <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Initial Balance</p>
                    <p className="text-lg">
                      {contest.market === "NSE" ? "₹" : "$"}
                      {contest.vaultSize?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Participants</p>
                    <p className="text-lg">{contest.participantCount || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-lg">{formatDate(contest.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">End Date</p>
                    <p className="text-lg">{formatDate(contest.endDate)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <h3 className="font-medium mb-2">Contest Rules</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Each participant starts with {contest.market === "NSE" ? "₹" : "$"}{contest.vaultSize?.toLocaleString()} in virtual currency</li>
                  <li>Trade stocks available on the {contest.market} market</li>
                  <li>The contest runs from {formatDate(contest.startDate)} to {formatDate(contest.endDate)}</li>
                  <li>Participants are ranked based on portfolio value and ROI</li>
                  <li>All trades are simulated - no real money is involved</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                className="w-full" 
                onClick={handleJoinContest}
                disabled={joining}
              >
                {joining ? "Joining..." : "Join Contest"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                By joining, you agree to participate fairly and follow the contest rules
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JoinContest;
