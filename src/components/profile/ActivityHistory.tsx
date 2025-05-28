import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, TrendingUp, Eye, XCircle } from "lucide-react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ActivityHistory = ({ userId, data }) => {
  const [activeTab, setActiveTab] = useState("trial");
  const [activities, setActivities] = useState({
    trial: [],
    fantasy: [],
    watchlist: [],
    rejected: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Placeholder for actual Firestore queries
        // In a real implementation, you would query the respective collections

        // Example for trials
        const trialQuery = query(
          collection(db, "users", userId, "trials"),
          orderBy("date", "desc"),
          limit(5)
        );
        
        // For demonstration, using mock data
        setActivities({
          trial: [
            { id: "t1", market: "US", wallet: "$10,000", date: "2023-04-15", stocks: ["AAPL", "MSFT"], endBalance: "$10,450" },
            { id: "t2", market: "India", wallet: "₹50,000", date: "2023-04-10", stocks: ["RELIANCE", "TCS"], endBalance: "₹52,300" },
          ],
          fantasy: [
            { id: "f1", name: "Tech Growth", date: "2023-04-01", rank: 5, roi: "+8.2%" },
            { id: "f2", name: "Pharma Challenge", date: "2023-03-15", rank: 12, roi: "+3.5%" },
          ],
          watchlist: [
            { id: "w1", symbol: "GOOGL", price: "$143.85", addedOn: "2023-04-12" },
            { id: "w2", symbol: "AMZN", price: "$180.14", addedOn: "2023-04-05" },
            { id: "w3", symbol: "NFLX", price: "$624.16", addedOn: "2023-03-28" },
          ],
          rejected: [
            { id: "r1", symbol: "TSLA", reason: "Too volatile", date: "2023-04-08" },
            { id: "r2", symbol: "GME", reason: "Not aligned with strategy", date: "2023-03-20" },
          ]
        });
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle>Activity & Simulation History</CardTitle>
        </div>
        <CardDescription>
          Review your past activities and simulations across Profitaly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="trial">Trial Room</TabsTrigger>
            <TabsTrigger value="fantasy">Fantasy Grounds</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="rejected">Rejected Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trial">
            <Table>
              <TableCaption>Recent Trial Room sessions</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Market</TableHead>
                  <TableHead>Initial Wallet</TableHead>
                  <TableHead>Stocks Purchased</TableHead>
                  <TableHead>End Balance</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.trial.length > 0 ? (
                  activities.trial.map((trial) => (
                    <TableRow key={trial.id}>
                      <TableCell>{trial.market}</TableCell>
                      <TableCell>{trial.wallet}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {trial.stocks.map((stock) => (
                            <Badge key={stock} variant="secondary">{stock}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{trial.endBalance}</TableCell>
                      <TableCell>{new Date(trial.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No trial sessions yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <div className="mt-4 flex justify-center">
              <Button variant="outline">View All Trial Sessions</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="fantasy">
            <Table>
              <TableCaption>Recent Fantasy Participation</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Challenge Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Leaderboard Rank</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.fantasy.length > 0 ? (
                  activities.fantasy.map((fantasy) => (
                    <TableRow key={fantasy.id}>
                      <TableCell>{fantasy.name}</TableCell>
                      <TableCell>{new Date(fantasy.date).toLocaleDateString()}</TableCell>
                      <TableCell>#{fantasy.rank}</TableCell>
                      <TableCell className={fantasy.roi.startsWith("+") ? "text-green-600" : "text-red-600"}>
                        {fantasy.roi}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No fantasy participation yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <div className="mt-4 flex justify-center">
              <Button variant="outline">View All Fantasy Challenges</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="watchlist">
            <Table>
              <TableCaption>Your Watchlisted Stocks</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.watchlist.length > 0 ? (
                  activities.watchlist.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.symbol}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{new Date(item.addedOn).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No watchlisted stocks yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="rejected">
            <Table>
              <TableCaption>Suggestions You've Rejected</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.rejected.length > 0 ? (
                  activities.rejected.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.symbol}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No rejected suggestions yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ActivityHistory; 