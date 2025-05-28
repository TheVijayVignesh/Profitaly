import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import PerplexityStockInsight from './PerplexityStockInsight';

interface StockInsightButtonProps {
  stockSymbol: string;
  stockName?: string;
  className?: string;
}

const StockInsightButton: React.FC<StockInsightButtonProps> = ({
  stockSymbol,
  stockName,
  className = ""
}) => {
  return (
    <PerplexityStockInsight 
      stockSymbol={stockSymbol} 
      stockName={stockName}
      buttonText="AI Analysis"
      className={`w-full ${className}`}
    />
  );
};

export default StockInsightButton;
