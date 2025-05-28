import { useState, useEffect } from "react";
import { useFantasy } from "../hooks/useFantasyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrophyIcon, RefreshCwIcon, UserIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const LeaderboardView = () => {
  const { user } = useAuth();
  const { leaderboard, leagueData } = useFantasy();
  const [usersData, setUsersData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch user data for all users in the leaderboard
  useEffect(() => {
    const fetchUsersData = async () => {
      if (!leaderboard || leaderboard.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const userData = {};

      try {
        // Fetch data for all users in parallel
        const userPromises = leaderboard.map(async (entry) => {
          try {
            const userDoc = await getDoc(doc(db, "users", entry.uid));
            if (userDoc.exists()) {
              userData[entry.uid] = userDoc.data();
            } else {
              userData[entry.uid] = { displayName: "Unknown User" };
            }
          } catch (error) {
            console.error(`Error fetching user ${entry.uid}:`, error);
            userData[entry.uid] = { displayName: "Unknown User" };
          }
        });

        await Promise.all(userPromises);
        setUsersData(userData);
      } catch (error) {
        console.error("Error fetching users data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsersData();
  }, [leaderboard]);

  const refreshLeaderboard = async () => {
    setIsRefreshing(true);
    // The leaderboard data is automatically refreshed through the context
    // We'll just simulate a refresh delay here
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  if (!leagueData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            You need to join a league to see the leaderboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Join a league to compete with other users and view rankings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              <TrophyIcon className="h-5 w-5 mr-2 text-primary" />
              {leagueData.name} Leaderboard
            </CardTitle>
            <CardDescription>
              {leaderboard.length} participants competing
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshLeaderboard}
            disabled={isRefreshing}
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No participants in this league yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const userData = usersData[entry.uid] || {};
              const isCurrentUser = entry.uid === user.uid;
              
              return (
                <div
                  key={entry.uid}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-none w-8 text-center font-semibold">
                      {index === 0 ? (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">1</Badge>
                      ) : index === 1 ? (
                        <Badge className="bg-gray-400 hover:bg-gray-500">2</Badge>
                      ) : index === 2 ? (
                        <Badge className="bg-amber-700 hover:bg-amber-800">3</Badge>
                      ) : (
                        <span className="text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                    
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userData.photoURL} />
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-medium">
                        {userData.displayName || "User"}
                        {isCurrentUser && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ₹{entry.wallet?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`font-bold flex items-center ${
                    entry.ROI >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {entry.ROI >= 0 ? (
                      <TrendingUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 mr-1" />
                    )}
                    {entry.ROI > 0 ? '+' : ''}{entry.ROI?.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardView; 