import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUpIcon, TrendingDownIcon, Medal, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const LeaderboardTable = ({ leaderboard = [], currentUser, market }) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Format currency based on market
  const formatCurrency = (value) => {
    if (!value) return "0";
    const currencySymbol = market === "NSE" ? "₹" : "$";
    return `${currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };
  
  // Get user's initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(part => part[0]).join("").toUpperCase().substring(0, 2);
  };
  
  // Get rank badge color
  const getRankColor = (rank) => {
    if (rank === 1) return "bg-yellow-500";
    if (rank === 2) return "bg-gray-400";
    if (rank === 3) return "bg-amber-700";
    return "";
  };
  
  // Filter leaderboard based on search query
  const filteredLeaderboard = searchQuery.trim() 
    ? leaderboard.filter(entry => 
        entry.displayName?.toLowerCase().includes(searchQuery.toLowerCase()))
    : leaderboard;
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by participant name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Participant</TableHead>
            <TableHead className="text-right">ROI</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLeaderboard.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                {searchQuery.trim() 
                  ? `No participants found matching '${searchQuery}'` 
                  : "No participants in this event yet"}
              </TableCell>
            </TableRow>
          ) : (
            filteredLeaderboard.map((entry) => {
              const isCurrentUser = entry.uid === currentUser;
              
              return (
                <TableRow 
                  key={entry.uid}
                  className={isCurrentUser ? "bg-secondary/20" : ""}
                >
                  <TableCell>
                    <div className="flex items-center">
                      {entry.rank <= 3 ? (
                        <div className={`p-1 rounded-full ${getRankColor(entry.rank)}`}>
                          <Medal className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 text-center font-medium">{entry.rank}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.photoURL} />
                        <AvatarFallback>
                          {getInitials(entry.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {entry.displayName}
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`font-medium ${entry.ROI >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {entry.ROI >= 0 ? (
                        <TrendingUpIcon className="h-3 w-3 inline mr-1" />
                      ) : (
                        <TrendingDownIcon className="h-3 w-3 inline mr-1" />
                      )}
                      {entry.ROI > 0 ? '+' : ''}{entry.ROI.toFixed(2)}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(entry.vaultBalance)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      
      {filteredLeaderboard.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Leaderboard rankings are updated in real-time
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable; 