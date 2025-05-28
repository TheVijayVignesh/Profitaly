import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Transaction } from "@/services/trialRoomService";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  currencySymbol?: string;
}

const TransactionHistory = ({ 
  transactions, 
  isLoading = false, 
  currencySymbol = "$" 
}: TransactionHistoryProps) => {
  // Format date nicely
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="py-2 px-4 text-left font-medium">Date</th>
              <th className="py-2 px-4 text-left font-medium">Symbol</th>
              <th className="py-2 px-4 text-left font-medium">Type</th>
              <th className="py-2 px-4 text-left font-medium">Quantity</th>
              <th className="py-2 px-4 text-left font-medium">Price</th>
              <th className="py-2 px-4 text-left font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {Array(5).fill(0).map((_, index) => (
              <tr key={index}>
                <td className="py-2 px-4"><Skeleton className="h-5 w-32" /></td>
                <td className="py-2 px-4"><Skeleton className="h-5 w-20" /></td>
                <td className="py-2 px-4"><Skeleton className="h-5 w-12" /></td>
                <td className="py-2 px-4"><Skeleton className="h-5 w-12" /></td>
                <td className="py-2 px-4"><Skeleton className="h-5 w-20" /></td>
                <td className="py-2 px-4"><Skeleton className="h-5 w-24" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center border rounded-md">
        <p className="text-muted-foreground">No transaction history yet. Start trading to build your history!</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="py-2 px-4 text-left font-medium">Date</th>
            <th className="py-2 px-4 text-left font-medium">Symbol</th>
            <th className="py-2 px-4 text-left font-medium">Type</th>
            <th className="py-2 px-4 text-left font-medium">Quantity</th>
            <th className="py-2 px-4 text-left font-medium">Price</th>
            <th className="py-2 px-4 text-left font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-muted/50">
              <td className="py-2 px-4">{formatDate(transaction.timestamp)}</td>
              <td className="py-2 px-4">
                <div className="font-medium">{transaction.symbol}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[150px]">{transaction.name}</div>
              </td>
              <td className="py-2 px-4">
                {transaction.type === "buy" ? (
                  <span className="inline-flex items-center text-finance-profit">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Buy
                  </span>
                ) : (
                  <span className="inline-flex items-center text-finance-loss">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    Sell
                </span>
                )}
              </td>
              <td className="py-2 px-4">{transaction.quantity}</td>
              <td className="py-2 px-4">{currencySymbol}{transaction.price.toFixed(2)}</td>
              <td className="py-2 px-4">
                {transaction.type === "buy" ? (
                  <span className="text-finance-loss font-medium">-{currencySymbol}{transaction.total.toFixed(2)}</span>
                ) : (
                  <span className="text-finance-profit font-medium">+{currencySymbol}{transaction.total.toFixed(2)}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
