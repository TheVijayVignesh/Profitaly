import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stock } from "@/hooks/useTrialRoomTrade";
import { newsApiService } from "@/services/newsApiService";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

interface StockNewsPanelProps {
  stock: Stock | null;
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage?: string;
}

const StockNewsPanel = ({ stock }: StockNewsPanelProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch news when stock changes
  useEffect(() => {
    if (!stock) {
      setNews([]);
      return;
    }

    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const newsData = await newsApiService.getStockNews(stock.symbol, stock.name, 5);
        setNews(newsData);
      } catch (error) {
        console.error("Error fetching news:", error);
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [stock]);

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

  // Loading state
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
          <CardDescription>Recent articles about this stock</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="border-b pb-3 last:border-0">
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <div className="flex justify-between items-center mt-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // No stock selected
  if (!stock) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
          <CardDescription>Select a stock to view related news</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12 text-muted-foreground">
          No stock selected
        </CardContent>
      </Card>
    );
  }

  // No news found
  if (news.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
          <CardDescription>Recent articles about {stock.name}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12 text-muted-foreground">
          No recent news found for {stock.symbol}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
        <CardDescription>Recent articles about {stock.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 overflow-auto max-h-[500px]">
        {news.map((item, index) => (
          <div key={index} className="border-b pb-3 last:border-0">
            <div className="group">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-start font-medium text-primary hover:underline"
              >
                {item.title}
                <ExternalLink className="h-3 w-3 ml-1 inline-flex opacity-70" />
              </a>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {item.description}
                </p>
              )}
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>{item.source}</span>
                <span>{formatRelativeTime(item.publishedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default StockNewsPanel;
