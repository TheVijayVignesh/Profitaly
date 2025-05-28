import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stock } from "@/hooks/useTrialRoomTrade";
import { aiInsightService } from "@/services/aiInsightService";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIInsightPanelProps {
  stock: Stock | null;
  newsHeadlines?: string[];
}

interface Insight {
  recommendation: 'buy' | 'sell' | 'hold';
  analysis: string;
  timestamp: string;
}

const AIInsightPanel = ({ stock, newsHeadlines }: AIInsightPanelProps) => {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch insight when stock changes
  useEffect(() => {
    if (!stock) {
      setInsight(null);
      return;
    }

    fetchInsight();
  }, [stock]);

  const fetchInsight = async () => {
    if (!stock) return;
    
    setIsLoading(true);
    try {
      const insightData = await aiInsightService.getStockInsight(
        stock.symbol, 
        stock.name, 
        stock.price,
        newsHeadlines
      );
      setInsight(insightData);
    } catch (error) {
      console.error("Error fetching AI insight:", error);
      setInsight(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Get badge color based on recommendation
  const getBadgeVariant = (recommendation: 'buy' | 'sell' | 'hold') => {
    switch (recommendation) {
      case 'buy':
        return 'success';
      case 'sell':
        return 'destructive';
      case 'hold':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>AI Insight</CardTitle>
          <CardDescription>Expert analysis and recommendation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  // No stock selected
  if (!stock) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>AI Insight</CardTitle>
          <CardDescription>Select a stock to view AI analysis</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12 text-muted-foreground">
          No stock selected
        </CardContent>
      </Card>
    );
  }

  // No insight found
  if (!insight) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>AI Insight</CardTitle>
          <CardDescription>Expert analysis for {stock.name}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 space-y-4">
          <p className="text-muted-foreground">
            No analysis available for {stock.symbol}
          </p>
          <Button 
            variant="outline" 
            onClick={fetchInsight}
            className="mx-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle>AI Insight</CardTitle>
          <CardDescription>Expert analysis for {stock.name}</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={fetchInsight}
          title="Refresh analysis"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Badge variant={getBadgeVariant(insight.recommendation) as any}>
            {insight.recommendation.toUpperCase()}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Updated {formatRelativeTime(insight.timestamp)}
          </span>
        </div>
        <p className="text-sm whitespace-pre-line">
          {insight.analysis}
        </p>
      </CardContent>
    </Card>
  );
};

export default AIInsightPanel;
