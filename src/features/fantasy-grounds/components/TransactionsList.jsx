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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

const TransactionsList = ({ transactions = [], market }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCount, setShowCount] = useState(15);
  
  // Format currency based on market
  const formatCurrency = (value) => {
    if (!value) return "0";
    const currencySymbol = market === "NSE" ? "₹" : "$";
    return `${currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };
  
  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(transaction => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      transaction.symbol?.toLowerCase().includes(query) ||
      transaction.name?.toLowerCase().includes(query) ||
      transaction.type?.toLowerCase().includes(query)
    );
  });
  
  // Get transactions to display
  const displayedTransactions = filteredTransactions.slice(0, showCount);
  
  // Load more transactions
  const handleLoadMore = () => {
    setShowCount(prev => prev + 15);
  };
  
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No transactions yet</p>
        <p className="text-sm mt-2">Your trading activity will appear here</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by symbol or transaction type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedTransactions.map((transaction, index) => (
            <TableRow key={index}>
              <TableCell className="whitespace-nowrap">
                {formatDate(transaction.timestamp)}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={transaction.type === "BUY" ? "default" : "outline"}
                  className={transaction.type === "BUY" ? "bg-blue-500" : "bg-amber-500"}
                >
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-medium">{transaction.symbol}</div>
                <div className="text-xs text-muted-foreground">{transaction.name}</div>
              </TableCell>
              <TableCell>{transaction.qty}</TableCell>
              <TableCell>{formatCurrency(transaction.price)}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(transaction.total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {filteredTransactions.length > 0 && (
          <TableCaption>
            Showing {Math.min(showCount, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </TableCaption>
        )}
      </Table>
      
      {showCount < filteredTransactions.length && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={handleLoadMore}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionsList; 