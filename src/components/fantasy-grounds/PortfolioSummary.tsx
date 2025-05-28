import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Portfolio, Position, Transaction } from '@/types/fantasy-grounds';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolio }) => {
  // Sort positions by current value (descending)
  const sortedPositions = [...portfolio.positions].sort((a, b) => b.currentValue - a.currentValue);
  
  // Get recent transactions (last 5)
  const recentTransactions = portfolio.transactions 
    ? [...portfolio.transactions]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5)
    : [];
  
  // Calculate portfolio allocation percentages
  const totalInvested = sortedPositions.reduce((sum, position) => sum + position.currentValue, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Portfolio</CardTitle>
        <CardDescription>
          Current portfolio value: ${portfolio.totalValue.toFixed(2)} | 
          Wallet balance: ${portfolio.walletBalance.toFixed(2)} | 
          ROI: <span className={portfolio.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
            {portfolio.roi >= 0 ? '+' : ''}{portfolio.roi.toFixed(2)}%
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="positions">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="positions" className="space-y-4">
            {sortedPositions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Avg Price</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead className="text-right">P/L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPositions.map((position) => (
                    <TableRow key={position.symbol}>
                      <TableCell className="font-medium">{position.symbol}</TableCell>
                      <TableCell>{position.quantity}</TableCell>
                      <TableCell>${position.averageBuyPrice.toFixed(2)}</TableCell>
                      <TableCell>${position.currentValue.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className={`font-medium flex items-center justify-end ${position.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {position.profitLoss >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          ${Math.abs(position.profitLoss).toFixed(2)} ({Math.abs(position.profitLossPercent).toFixed(2)}%)
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                You don't have any positions yet. Start trading to build your portfolio!
              </div>
            )}
            
            {sortedPositions.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="text-sm font-medium">Portfolio Allocation</h3>
                {sortedPositions.map((position) => {
                  const percentage = totalInvested > 0 
                    ? (position.currentValue / totalInvested) * 100 
                    : 0;
                    
                  return (
                    <div key={`allocation-${position.symbol}`} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{position.symbol}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="transactions">
            {recentTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          transaction.type === 'BUY' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'BUY' ? (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          )}
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{transaction.symbol}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>${transaction.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${
                          transaction.type === 'BUY' 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {transaction.type === 'BUY' ? '-' : '+'}${transaction.total.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                You haven't made any transactions yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
