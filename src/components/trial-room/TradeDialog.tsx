import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { Stock } from "@/hooks/useTrialRoomTrade";

interface TradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStock: Stock | null;
  tradeType: "buy" | "sell";
  onTradeTypeChange: (value: "buy" | "sell") => void;
  onQuantityChange: (quantity: number) => void;
  quantity: number;
  onExecuteTrade: () => void;
  isLoading?: boolean;
  currencySymbol?: string;
  maxQuantity?: number;
}

const TradeDialog = ({
  open,
  onOpenChange,
  selectedStock,
  tradeType,
  onTradeTypeChange,
  quantity,
  onQuantityChange,
  onExecuteTrade,
  isLoading = false,
  currencySymbol = "$",
  maxQuantity = 0
}: TradeDialogProps) => {
  const [localQuantity, setLocalQuantity] = useState<string>(quantity.toString());
  
  // Update local quantity when prop changes
  useEffect(() => {
    setLocalQuantity(quantity.toString());
  }, [quantity]);
  
  // Handle local quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setLocalQuantity(value);
    if (value) {
      onQuantityChange(parseInt(value));
    } else {
      onQuantityChange(0);
    }
  };
  
  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    onQuantityChange(value[0]);
    setLocalQuantity(value[0].toString());
  };
  
  // Calculate total trade amount
  const calculateTotal = () => {
    if (!selectedStock) return 0;
    return selectedStock.price * quantity;
  };

  if (!selectedStock) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {tradeType === "buy" ? "Buy" : "Sell"} {selectedStock?.symbol}
          </DialogTitle>
          <DialogDescription>
            Current price: {currencySymbol}{selectedStock?.price.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="trade-type" className="text-sm font-medium">Trade Type</label>
            <Select value={tradeType} onValueChange={(value) => onTradeTypeChange(value as "buy" | "sell")}>
              <SelectTrigger id="trade-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="quantity" className="text-sm font-medium">Quantity</label>
              <span className="text-xs text-muted-foreground">
                Max: {maxQuantity} shares
              </span>
            </div>
            <Input
              id="quantity"
              type="text"
              value={localQuantity}
              onChange={handleQuantityChange}
              className="mb-2"
            />
            <Slider 
              value={[quantity]} 
              min={1} 
              max={Math.max(maxQuantity, 1)} 
              step={1} 
              onValueChange={handleSliderChange}
              className="mt-2"
            />
          </div>
          
          <div className="bg-muted p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Price per share:</span>
              <span>{currencySymbol}{selectedStock?.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-2 mt-2">
              <span>Total Amount:</span>
              <span>{currencySymbol}{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={onExecuteTrade}
            className={tradeType === "buy" ? "bg-finance-profit hover:bg-finance-profit/90" : "bg-finance-loss hover:bg-finance-loss/90"}
            disabled={
              isLoading || 
              quantity <= 0 || 
              (tradeType === "buy" && quantity > maxQuantity) ||
              (tradeType === "sell" && quantity > maxQuantity)
            }
          >
            {isLoading ? "Processing..." : `Confirm ${tradeType === "buy" ? "Purchase" : "Sale"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TradeDialog;
