import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, TrendingDownIcon, MoreHorizontal } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HoldingsTable = ({ holdings = [], market, eventId, onTradeClick }) => {
  const { user } = useAuth();
  
  // Format currency based on market
  const formatCurrency = (value) => {
    if (!value) return "0";
    const currencySymbol = market === "NSE" ? "₹" : "$";
    return `${currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Calculate total portfolio value
  const totalValue = holdings.reduce((total, holding) => {
    return total + (holding.currentPrice || holding.boughtPrice) * holding.qty;
  }, 0);
  
  // Calculate profit/loss for a holding
  const calculatePL = (holding) => {
    const currentValue = holding.currentPrice * holding.qty;
    const costBasis = holding.boughtPrice * holding.qty;
    return currentValue - costBasis;
  };
  
  // Calculate profit/loss percentage
  const calculatePLPercent = (holding) => {
    if (!holding.boughtPrice) return 0;
    return ((holding.currentPrice - holding.boughtPrice) / holding.boughtPrice) * 100;
  };
  
  // Sort holdings by value
  const sortedHoldings = [...holdings].sort((a, b) => {
    const aValue = (a.currentPrice || a.boughtPrice) * a.qty;
    const bValue = (b.currentPrice || b.boughtPrice) * b.qty;
    return bValue - aValue;
  });
  
  if (holdings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>You don't have any holdings yet.</p>
        <p className="text-sm mt-2">Start trading to build your portfolio!</p>
      </div>
    );
  }
  
  return (
    <div>
      <Table>
        <TableCaption>
          Total Portfolio Value: {formatCurrency(totalValue)}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Avg. Price</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
            <TableHead className="text-right">P/L</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedHoldings.map((holding) => {
            const pl = calculatePL(holding);
            const plPercent = calculatePLPercent(holding);
            const isProfit = pl >= 0;
            
            return (
              <TableRow key={holding.symbol}>
                <TableCell className="font-medium">
                  <div>{holding.symbol}</div>
                  <div className="text-xs text-muted-foreground">{holding.name}</div>
                </TableCell>
                <TableCell>{holding.qty}</TableCell>
                <TableCell>{formatCurrency(holding.boughtPrice)}</TableCell>
                <TableCell>{formatCurrency(holding.currentPrice || holding.boughtPrice)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency((holding.currentPrice || holding.boughtPrice) * holding.qty)}
                </TableCell>
                <TableCell className="text-right">
                  <div className={isProfit ? "text-green-500" : "text-red-500"}>
                    {isProfit ? (
                      <TrendingUpIcon className="h-3 w-3 inline mr-1" />
                    ) : (
                      <TrendingDownIcon className="h-3 w-3 inline mr-1" />
                    )}
                    <span>
                      {formatCurrency(Math.abs(pl))}
                    </span>
                  </div>
                  <div className={`text-xs ${isProfit ? "text-green-500" : "text-red-500"}`}>
                    {isProfit ? "+" : ""}{plPercent.toFixed(2)}%
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onTradeClick && onTradeClick(holding, "buy")}>
                        Buy More
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTradeClick && onTradeClick(holding, "sell")}>
                        Sell Shares
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default HoldingsTable; 