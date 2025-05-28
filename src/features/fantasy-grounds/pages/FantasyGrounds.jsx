import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TrophyIcon, BarChart3Icon, TrendingUpIcon } from "lucide-react";

const FantasyGrounds = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to events page by default
    navigate("/fantasy-grounds/events");
  }, [navigate]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6 items-center text-center">
        <TrophyIcon className="h-16 w-16 text-primary" />
        <div>
          <h1 className="text-3xl font-bold mb-2">Fantasy Grounds</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Join virtual stock market events, compete with others, and test your 
            trading skills with risk-free simulated trading using real market data
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
          <Card>
            <CardHeader>
              <TrophyIcon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Fantasy Events</CardTitle>
              <CardDescription>
                Join trading competitions with fixed virtual funds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Participate in time-limited trading events across various markets and
                compete for the highest returns on your investment
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => navigate("/fantasy-grounds/events")}
              >
                Browse Events
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <BarChart3Icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Your Dashboard</CardTitle>
              <CardDescription>
                View your active events and portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access your current events, check portfolio performance, and track your
                progress in the leaderboards
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate("/fantasy-grounds/my-events")}
              >
                My Events
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <TrendingUpIcon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Leaderboards</CardTitle>
              <CardDescription>
                See top performers across all events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View the global leaderboards to see the top traders and learn from
                the best performers' strategies
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate("/fantasy-grounds/leaderboards")}
              >
                Global Rankings
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <p className="text-sm text-muted-foreground mt-8">
          Fantasy Grounds uses simulated trading with real market data. No real money is involved.
        </p>
      </div>
    </div>
  );
};

export default FantasyGrounds; 