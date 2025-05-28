import { useState } from "react";
import { useFantasy } from "../hooks/useFantasyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUpIcon, TrendingDownIcon, ArrowUpDownIcon, SearchIcon } from "lucide-react";
import { format } from "date-fns";

const TransactionHistory = () => {
  const { fantasyData } = useFantasy();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'amount-high', 'amount-low'
  const [filterType, setFilterType] = useState("all"); // 'all', 'buy', 'sell'

  if (!fantasyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>You need to join a league to see your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Join a league to start trading and view your transaction history.</p>
        </CardContent>
      </Card>
    );
  }

  const transactions = fantasyData?.transactions || [];

  // Filter and sort transactions
  const filteredAndSortedTransactions = [...transactions]
    // Apply search filter
    .filter(txn => {
      if (!searchTerm) return true;
      const searchTermLower = searchTerm.toLowerCase();
      return txn.symbol.toLowerCase().includes(searchTermLower);
    })
    // Apply type filter
    .filter(txn => {
      if (filterType === "all") return true;
      return txn.type.toLowerCase() === filterType.toLowerCase();
    })
    // Apply sorting
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case "amount-high":
          return b.total - a.total;
        case "amount-low":
          return a.total - b.total;
        case "newest":
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Transaction History</CardTitle>
        <CardDescription>
          Record of your trades and portfolio changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by symbol"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                prefix={<SearchIcon className="w-4 h-4 mr-2 opacity-50" />}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="buy">Buy Only</SelectItem>
                <SelectItem value="sell">Sell Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredAndSortedTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions found.</p>
            {transactions.length > 0 && searchTerm && (
              <p className="mt-2 text-sm">Try adjusting your search or filters.</p>
            )}
            {transactions.length === 0 && (
              <p className="mt-2 text-sm">Go to the Market tab to start trading.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedTransactions.map((txn, index) => {
              const isBuy = txn.type === "BUY";
              const timestamp = txn.timestamp instanceof Date 
                ? txn.timestamp 
                : txn.timestamp?.toDate?.() || new Date(txn.timestamp);
              
              return (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      isBuy ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {isBuy ? (
                        <TrendingUpIcon className="h-4 w-4" />
                      ) : (
                        <TrendingDownIcon className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium flex items-center">
                        <span>{txn.symbol}</span>
                        <Badge 
                          variant={isBuy ? "outline" : "destructive"} 
                          className="ml-2 text-xs"
                        >
                          {txn.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(timestamp, "MMM d, yyyy h:mm a")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">
                      {isBuy ? '-' : '+'} ₹{txn.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {txn.qty} shares @ ₹{txn.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {transactions.length > 10 && (
          <div className="mt-6 flex justify-center">
            <Button variant="outline">
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory; 