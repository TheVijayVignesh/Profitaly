import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, LineChart, Loader2, X } from "lucide-react";

interface StockInsightDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stockSymbol: string | null;
  isLoading: boolean;
  insightData: string | null;
}

const StockInsightDialog: React.FC<StockInsightDialogProps> = ({
  isOpen,
  onClose,
  stockSymbol,
  isLoading,
  insightData
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              {stockSymbol ? `${stockSymbol} - AI Powered Analysis` : 'Stock Analysis'}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Detailed stock analysis powered by Perplexity AI
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p>Generating detailed AI analysis...</p>
          </div>
        ) : insightData ? (
          <div className="space-y-4">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: insightData.replace(/\n/g, '<br />') }} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-center">Failed to load stock insights. Please try again.</p>
          </div>
        )}
        
        <DialogFooter className="flex justify-between items-center border-t pt-4 mt-4">
          <p className="text-xs text-muted-foreground">
            Analysis powered by Perplexity AI. Data may not be real-time.
          </p>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockInsightDialog;
