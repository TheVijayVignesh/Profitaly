import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { perplexityService } from "@/services/perplexityService";
import { useToast } from "@/components/ui/use-toast";
import StockInsightDialog from './StockInsightDialog';

interface AIInsightButtonProps {
  stockSymbol: string;
  stockName?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
}

const AIInsightButton: React.FC<AIInsightButtonProps> = ({
  stockSymbol,
  stockName,
  className = "",
  variant = "default",
  size = "default",
  fullWidth = false
}) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insightData, setInsightData] = useState<string | null>(null);

  const fetchStockInsight = async () => {
    setIsDialogOpen(true);
    setIsLoading(true);
    
    try {
      const prompt = `Provide a detailed analysis of ${stockSymbol} ${stockName ? `(${stockName})` : ''} stock. 
      Include current market position, financial health, growth prospects, risks, and a recommendation (buy/hold/sell). 
      Format your response with clear sections for each aspect of the analysis. 
      Also include key metrics like P/E ratio, market cap, and recent performance.`;
      
      const response = await perplexityService.queryAI(prompt);
      
      // Handle both string and object response formats from Perplexity API
      if (typeof response === 'string') {
        setInsightData(response);
      } else if (response && typeof response === 'object' && 'text' in response) {
        setInsightData(response.text as string);
      } else {
        setInsightData(JSON.stringify(response));
      }
      
    } catch (error) {
      console.error(`Error fetching insights for ${stockSymbol}:`, error);
      toast({
        title: "Error",
        description: `Failed to generate insights for ${stockSymbol}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button 
        onClick={fetchStockInsight}
        className={`${fullWidth ? 'w-full' : ''} ${className}`}
        variant={variant}
        size={size}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        AI Analysis
      </Button>

      <StockInsightDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        stockSymbol={stockSymbol}
        isLoading={isLoading}
        insightData={insightData}
      />
    </>
  );
};

export default AIInsightButton;
