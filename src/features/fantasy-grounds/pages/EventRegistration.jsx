import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, UsersIcon, DollarSignIcon, ClockIcon, AlertCircle, ChevronLeft, CheckIcon } from "lucide-react";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const EventRegistration = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        navigate("/fantasy-grounds/events");
        return;
      }
      
      setLoading(true);
      try {
        const eventDoc = await getDoc(doc(db, "fantasyEvents", eventId));
        
        if (!eventDoc.exists()) {
          setError("Event not found");
          navigate("/fantasy-grounds/events");
          return;
        }
        
        const eventData = {
          id: eventDoc.id,
          ...eventDoc.data(),
          startDate: eventDoc.data().startDate?.toDate(),
          endDate: eventDoc.data().endDate?.toDate()
        };
        
        // Check if event has already ended
        if (eventData.endDate < new Date()) {
          setError("This event has already ended");
        }
        
        // Check if user is already participating
        if (user) {
          const participantDoc = await getDoc(doc(db, "fantasyEvents", eventId, "participants", user.uid));
          if (participantDoc.exists()) {
            setSuccess(true);
          }
        }
        
        setEvent(eventData);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchEvent();
    }
  }, [eventId, user, navigate]);
  
  // Format date to readable string
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Join event
  const handleJoinEvent = async () => {
    if (!user || !event) return;
    
    setJoining(true);
    setError(null);
    
    try {
      // Create user vault for this event
      const userVaultRef = doc(db, "users", user.uid, "fantasyState", eventId);
      await setDoc(userVaultRef, {
        eventId: eventId,
        market: event.market,
        vaultBalance: event.vaultSize,
        initialVault: event.vaultSize,
        holdings: [],
        transactions: [],
        joinedAt: serverTimestamp()
      });
      
      // Add user to event participants
      const participantRef = doc(db, "fantasyEvents", eventId, "participants", user.uid);
      await setDoc(participantRef, {
        uid: user.uid,
        joinedAt: serverTimestamp(),
        displayName: user.displayName || user.email?.split('@')[0] || "Anonymous",
        photoURL: user.photoURL || null,
        ROI: 0,
        vaultBalance: event.vaultSize
      });
      
      // Update participant count
      const eventRef = doc(db, "fantasyEvents", eventId);
      await updateDoc(eventRef, {
        participantCount: increment(1)
      });
      
      // Add user to leaderboard
      const leaderboardRef = doc(db, "fantasyEvents", eventId, "leaderboard", user.uid);
      await setDoc(leaderboardRef, {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || "Anonymous",
        photoURL: user.photoURL || null,
        ROI: 0,
        vaultBalance: event.vaultSize,
        lastUpdated: serverTimestamp()
      });
      
      setSuccess(true);
      
      // Wait a moment before redirecting
      setTimeout(() => {
        navigate(`/fantasy-grounds/dashboard/${eventId}`);
      }, 2000);
    } catch (error) {
      console.error("Error joining event:", error);
      setError("Failed to join the event. Please try again.");
    } finally {
      setJoining(false);
    }
  };
  
  // Redirect if not logged in
  if (!user) {
    navigate("/login", { state: { redirectTo: `/fantasy-grounds/register/${eventId}` } });
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
              You've already joined this event. Go to your dashboard to start trading!
            </AlertDescription>
            <Button 
              className="mt-4 bg-emerald-600 hover:bg-emerald-700" 
              onClick={() => navigate(`/fantasy-grounds/dashboard/${eventId}`)}
            >
              Go to Dashboard
            </Button>
          </Alert>
        ) : event && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{event.name}</CardTitle>
                  <CardDescription>
                    Starts {formatDate(event.startDate)}
                  </CardDescription>
                </div>
                <Badge 
                  variant={event.market === "NSE" ? "default" : 
                          event.market === "NASDAQ" ? "secondary" : 
                          "outline"}
                >
                  {event.market}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Event Details</h3>
                <p>{event.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/20 p-2 rounded-full">
                    <DollarSignIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Starting Vault</p>
                    <p className="text-lg font-bold">
                      {event.market === "NSE" ? "₹" : "$"}
                      {event.vaultSize?.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/20 p-2 rounded-full">
                    <UsersIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Participants</p>
                    <p className="text-lg font-bold">{event.participantCount || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/20 p-2 rounded-full">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="text-lg font-bold">
                      {formatDate(event.startDate)} - {formatDate(event.endDate)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/20 p-2 rounded-full">
                    <ClockIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Market Hours</p>
                    <p className="text-lg font-bold">
                      {event.market === "NSE" ? "9:15 AM - 3:30 PM IST" : 
                       event.market === "NASDAQ" ? "9:30 AM - 4:00 PM EST" : 
                       "9:30 AM - 4:00 PM EST"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-secondary/10 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Event Rules</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>You'll receive a virtual vault of {event.market === "NSE" ? "₹" : "$"}{event.vaultSize?.toLocaleString()}</li>
                  <li>Trade stocks from the {event.market} market only</li>
                  <li>No additional funds can be added during the event</li>
                  <li>Winners are determined by highest ROI percentage</li>
                  <li>Rankings are updated in real-time</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleJoinEvent}
                disabled={joining}
              >
                {joining ? "Joining Event..." : "Join Event"}
              </Button>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventRegistration; 