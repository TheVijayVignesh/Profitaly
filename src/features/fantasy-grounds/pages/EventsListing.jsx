import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, UsersIcon, DollarSignIcon, ClockIcon, TrendingUpIcon } from "lucide-react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

const EventsListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const now = new Date();
        
        // Get active events (not yet ended)
        const activeEventsRef = query(
          collection(db, "fantasyEvents"),
          where("endDate", ">", now),
          orderBy("endDate", "asc")
        );
        
        // Get completed events
        const completedEventsRef = query(
          collection(db, "fantasyEvents"),
          where("endDate", "<=", now),
          orderBy("endDate", "desc"),
          limit(10)
        );
        
        const [activeSnapshot, completedSnapshot] = await Promise.all([
          getDocs(activeEventsRef),
          getDocs(completedEventsRef)
        ]);
        
        const activeEvents = activeSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate(),
          endDate: doc.data().endDate?.toDate()
        }));
        
        const completedEvents = completedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate(),
          endDate: doc.data().endDate?.toDate(),
          completed: true
        }));
        
        setEvents([...activeEvents, ...completedEvents]);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Format date to readable string
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Format duration between two dates
  const formatDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "N/A";
    
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return "1 Day";
    if (diffDays === 1) return "1 Day";
    if (diffDays <= 7) return `${diffDays} Days`;
    if (diffDays <= 31) return `${Math.ceil(diffDays / 7)} Weeks`;
    return `${Math.ceil(diffDays / 30)} Months`;
  };
  
  // Handle joining an event
  const handleJoinEvent = (eventId) => {
    if (!user) {
      // Redirect to login or show login modal
      navigate("/login", { state: { redirectTo: `/fantasy-grounds/events` } });
      return;
    }
    
    // Redirect to registration page with event ID
    navigate(`/fantasy-grounds/register/${eventId}`);
  };
  
  // Group events based on tab
  const activeEvents = events.filter(event => !event.completed);
  const completedEvents = events.filter(event => event.completed);
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fantasy Grounds</h1>
          <p className="text-muted-foreground">
            Join virtual stock market events, compete with others, and test your trading skills with risk-free simulated trading
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Events</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : activeEvents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">No active events available at the moment.</p>
                  <p className="text-sm">Check back soon for new events!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{event.name}</CardTitle>
                          <CardDescription>
                            {event.description?.substring(0, 100)}
                            {event.description?.length > 100 ? '...' : ''}
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
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 my-4">
                        <div className="flex items-center gap-2">
                          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Vault Size</p>
                            <p className="text-lg">
                              {event.market === "NSE" ? "₹" : "$"}
                              {event.vaultSize?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Participants</p>
                            <p className="text-lg">{event.participantCount || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Start Date</p>
                            <p className="text-lg">{formatDate(event.startDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Duration</p>
                            <p className="text-lg">{formatDuration(event.startDate, event.endDate)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => handleJoinEvent(event.id)}
                      >
                        Join Event
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : completedEvents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">No completed events yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{event.name}</CardTitle>
                          <CardDescription>
                            {event.description?.substring(0, 100)}
                            {event.description?.length > 100 ? '...' : ''}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant="outline"
                        >
                          {event.market}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 my-4">
                        <div className="flex items-center gap-2">
                          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Vault Size</p>
                            <p className="text-lg">
                              {event.market === "NSE" ? "₹" : "$"}
                              {event.vaultSize?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Participants</p>
                            <p className="text-lg">{event.participantCount || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Winner ROI</p>
                            <p className="text-lg">{event.winnerROI?.toFixed(2) || 0}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">End Date</p>
                            <p className="text-lg">{formatDate(event.endDate)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => navigate(`/fantasy-grounds/event/${event.id}`)}
                      >
                        View Results
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventsListing; 