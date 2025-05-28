import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  ArrowUp, 
  ArrowDown, 
  DollarSign, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import { Stock, Portfolio } from '@/types/fantasy-grounds';
import { buyStock, sellStock } from '@/services/fantasy-grounds/competitionService';
import { toast } from '@/components/ui/use-toast';

interface StockCardProps {
  stock: Stock;
  portfolio: Portfolio | null;
  competitionId: string;
  isActive: boolean;
  isParticipant: boolean;
}

const StockCard: React.FC<StockCardProps> = ({ 
  stock, 
  portfolio, 
  competitionId, 
  isActive, 
  isParticipant 
}) => {
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Find if user already owns this stock
  const position = portfolio?.positions.find(p => p.symbol === stock.symbol);
  
  const handleBuy = async () => {
    if (!portfolio) return;
    
    try {
      setIsProcessing(true);
      await buyStock(competitionId, stock.symbol, quantity);
      
      toast({
        title: 'Success',
        description: `Bought ${quantity} shares of ${stock.symbol}`,
      });
      
      setShowBuyDialog(false);
      setQuantity(1);
    } catch (error) {
      console.error('Error buying stock:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to buy stock',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSell = async () => {
    if (!portfolio || !position) return;
    
    try {
      setIsProcessing(true);
      await sellStock(competitionId, stock.symbol, quantity);
      
      toast({
        title: 'Success',
        description: `Sold ${quantity} shares of ${stock.symbol}`,
      });
      
      setShowSellDialog(false);
      setQuantity(1);
    } catch (error) {
      console.error('Error selling stock:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sell stock',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const maxAffordableShares = portfolio 
    ? Math.floor(portfolio.walletBalance / stock.price) 
    : 0;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{stock.symbol}</CardTitle>
              <div className="text-sm text-muted-foreground">{stock.name}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">${stock.price.toFixed(2)}</div>
              <div className={`text-sm flex items-center justify-end ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock.changePercent >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(stock.changePercent).toFixed(2)}%
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Volume</span>
              <span>{stock.volume.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Prev Close</span>
              <span>${stock.previousClose.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Show position if user owns this stock */}
          {position && (
            <div className="mt-3 pt-3 border-t">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Shares Owned</span>
                  <span className="font-medium">{position.quantity}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Avg Price</span>
                  <span className="font-medium">${position.averageBuyPrice.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Current Value</span>
                  <span className="font-medium">${position.currentValue.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">P/L</span>
                  <span className={`font-medium flex items-center ${position.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {position.profitLoss >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    ${Math.abs(position.profitLoss).toFixed(2)} ({Math.abs(position.profitLossPercent).toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mr-1"
            onClick={() => setShowBuyDialog(true)}
            disabled={!isActive || !isParticipant}
          >
            Buy
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full ml-1"
            onClick={() => setShowSellDialog(true)}
            disabled={!isActive || !isParticipant || !position || position.quantity <= 0}
          >
            Sell
          </Button>
        </CardFooter>
      </Card>

      {/* Buy Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy {stock.symbol}</DialogTitle>
            <DialogDescription>
              Current price: ${stock.price.toFixed(2)} per share
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span>Available Balance:</span>
              <span className="font-medium">${portfolio?.walletBalance.toFixed(2) || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Max Affordable Shares:</span>
              <span className="font-medium">{maxAffordableShares}</span>
            </div>
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={maxAffordableShares}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(maxAffordableShares, Math.max(1, parseInt(e.target.value) || 1)))}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span>Total Cost:</span>
              <span className="font-medium">${(stock.price * quantity).toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuyDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleBuy} disabled={isProcessing || quantity <= 0 || quantity > maxAffordableShares}>
              {isProcessing ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sell Dialog */}
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell {stock.symbol}</DialogTitle>
            <DialogDescription>
              Current price: ${stock.price.toFixed(2)} per share
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span>Shares Owned:</span>
              <span className="font-medium">{position?.quantity || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Average Buy Price:</span>
              <span className="font-medium">${position?.averageBuyPrice.toFixed(2) || 0}</span>
            </div>
            <div className="space-y-2">
              <label htmlFor="sell-quantity" className="text-sm font-medium">
                Quantity to Sell
              </label>
              <Input
                id="sell-quantity"
                type="number"
                min="1"
                max={position?.quantity || 0}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(position?.quantity || 0, Math.max(1, parseInt(e.target.value) || 1)))}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span>Total Value:</span>
              <span className="font-medium">${(stock.price * quantity).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Profit/Loss:</span>
              <span className={`font-medium ${(stock.price - (position?.averageBuyPrice || 0)) * quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${((stock.price - (position?.averageBuyPrice || 0)) * quantity).toFixed(2)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSellDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleSell} disabled={isProcessing || quantity <= 0 || quantity > (position?.quantity || 0)}>
              {isProcessing ? 'Processing...' : 'Confirm Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StockCard;
