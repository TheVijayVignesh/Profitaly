import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight,
  ArrowDownRight,
  LineChart,
  TrendingUp,
  TrendingDown,
  Search,
  DollarSign,
  Briefcase,
  Target,
  Award,
  BarChart3,
  Brain,
  Trophy,
  BookOpen,
  ChevronDown
} from "lucide-react";

// Mock data
const mockPortfolio = {
  totalValue: 12500,
  todayChange: 245.67,
  todayChangePercent: 2.01,
  invested: 10500,
  cashAvailable: 2000
};

const mockStocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 182.52, change: 2.3, changePercent: 1.28 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 141.80, change: -1.2, changePercent: -0.84 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 378.85, change: 5.6, changePercent: 1.50 },
];

const mockNews = [
  { id: 1, title: "Fed Signals Potential Rate Cuts", time: "2 hours ago", category: "Economy" },
  { id: 2, title: "Tech Stocks Rally on AI Optimism", time: "4 hours ago", category: "Technology" },
  { id: 3, title: "Oil Prices Surge Amid Supply Concerns", time: "6 hours ago", category: "Energy" },
];

const PortfolioSummary = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${mockPortfolio.totalValue.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          +2.1% from last month
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${mockPortfolio.todayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {mockPortfolio.todayChange >= 0 ? '+' : ''}${mockPortfolio.todayChange.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground">
          {mockPortfolio.todayChangePercent >= 0 ? '+' : ''}{mockPortfolio.todayChangePercent}% today
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Invested</CardTitle>
        <Briefcase className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${mockPortfolio.invested.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          {((mockPortfolio.invested / mockPortfolio.totalValue) * 100).toFixed(1)}% of portfolio
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Cash Available</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${mockPortfolio.cashAvailable.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          {((mockPortfolio.cashAvailable / mockPortfolio.totalValue) * 100).toFixed(1)}% of portfolio
        </p>
      </CardContent>
    </Card>
  </div>
);

const Watchlist = () => (
  <Card>
    <CardHeader>
      <CardTitle>Watchlist</CardTitle>
      <CardDescription>Your tracked stocks</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {mockStocks.map((stock, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{stock.symbol}</p>
              <p className="text-sm text-muted-foreground">{stock.name}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">${stock.price}</p>
              <p className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const MarketNews = () => (
  <Card>
    <CardHeader>
      <CardTitle>Market News</CardTitle>
      <CardDescription>Latest financial news</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {mockNews.map((news) => (
          <div key={news.id} className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div className="flex-1">
              <p className="font-medium text-sm">{news.title}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-muted-foreground">{news.time}</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">{news.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => navigate('/stocks')}
            className="w-full justify-start"
            variant="outline"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Browse Stocks
          </Button>
          <Button
            onClick={() => navigate('/trial-room')}
            className="w-full justify-start"
            variant="outline"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Practice Trading
          </Button>
          <Button
            onClick={() => navigate('/smart-advisor')}
            className="w-full justify-start"
            variant="outline"
          >
            <Brain className="mr-2 h-4 w-4" />
            AI Advisor
          </Button>
          <Button
            onClick={() => navigate('/fantasy-grounds')}
            className="w-full justify-start"
            variant="outline"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Fantasy Grounds
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome! Here's your financial overview.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stocks..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PortfolioSummary />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <QuickActions />
            <MarketNews />
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <PortfolioSummary />
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-4">
          <Watchlist />
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <MarketNews />
        </TabsContent>
      </Tabs>
    </div>
  );
}
