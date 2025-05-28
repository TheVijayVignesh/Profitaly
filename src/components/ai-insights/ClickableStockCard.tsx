import React from 'react';
import { Card } from "@/components/ui/card";
import PerplexityStockInsight from './PerplexityStockInsight';

interface ClickableStockCardProps {
  stockSymbol: string;
  stockName?: string;
  children: React.ReactNode;
  className?: string;
}

const ClickableStockCard: React.FC<ClickableStockCardProps> = ({
  stockSymbol,
  stockName,
  children,
  className = ""
}) => {
  return (
    <div className="relative group">
      <Card className={`overflow-hidden transition-all ${className}`}>
        {children}
      </Card>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
        <PerplexityStockInsight 
          stockSymbol={stockSymbol} 
          stockName={stockName}
          buttonText="View AI Analysis"
          className="shadow-lg"
        />
      </div>
    </div>
  );
};

export default ClickableStockCard;
