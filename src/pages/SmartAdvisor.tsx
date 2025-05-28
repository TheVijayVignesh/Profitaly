import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { 
  InvestmentProfile, 
  StockRecommendation, 
  RiskTolerance, 
  PrimaryGoal, 
  InvestmentHorizon, 
  SectorPreference, 
  GeographicFocus 
} from "@/features/smart-advisor/types";

import { smartAdvisorService } from "@/features/smart-advisor/smartAdvisorService";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

/**
 * Smart Advisor Page
 * Provides investment profile management and AI-powered stock recommendations
 */
const SmartAdvisor = () => {
  const { toast } = useToast();
  
  // State for investment profile
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('Moderate');
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>('Growth');
  const [investmentHorizon, setInvestmentHorizon] = useState<InvestmentHorizon>('3–7 years');
  const [sectorPreferences, setSectorPreferences] = useState<SectorPreference[]>([]);
  const [geographicFocus, setGeographicFocus] = useState<GeographicFocus[]>([]);
  
  // State for recommendations
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>([]);
  const [analysisText, setAnalysisText] = useState<string>("");
  
  // UI state
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockRecommendation | null>(null);
  
  // Handle sector preference toggle
  const toggleSectorPreference = (sector: SectorPreference) => {
    setSectorPreferences(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector) 
        : [...prev, sector]
    );
  };

  // Handle geographic focus toggle
  const toggleGeographicFocus = (region: GeographicFocus) => {
    setGeographicFocus(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region) 
        : [...prev, region]
    );
  };

  // Reset form to default values
  const handleReset = () => {
    setRiskTolerance('Moderate');
    setPrimaryGoal('Growth');
    setInvestmentHorizon('3–7 years');
    setSectorPreferences([]);
    setGeographicFocus([]);
  };

  /**
   * Handle form submission and generate recommendations
   */
  const handleProfileSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create profile object
      const profile: InvestmentProfile = {
        riskTolerance,
        primaryGoal,
        investmentHorizon,
        sectorPreferences,
        geographicFocus
      };
      
      // Generate recommendations
      const response = await smartAdvisorService.getRecommendations(profile);
      
      // Update state with recommendations
      setRecommendations(response.recommendations);
      setAnalysisText(response.analysisText || "");
      
      // Switch to recommendations tab
      setActiveTab("recommendations");
      
      toast({
        title: "Recommendations Generated",
        description: "Your personalized stock recommendations are ready to view.",
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      setError("Failed to generate recommendations. Please try again.");
      
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle viewing details of a stock
   * @param ticker Stock ticker symbol
   */
  const handleViewStockDetails = (ticker: string) => {
    const stock = recommendations.find(rec => rec.ticker === ticker);
    if (stock) {
      setSelectedStock(stock);
    }
  };
  
  /**
   * Handle going back to recommendations list
   */
  const handleBackToRecommendations = () => {
    setSelectedStock(null);
  };

  // Format currency with commas
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percent with + or - sign
  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };
  
  // All sector preferences options
  const sectorOptions: SectorPreference[] = [
    'Technology', 
    'Healthcare', 
    'Energy', 
    'Financials', 
    'Consumer', 
    'Industrials', 
    'ESG/Impact'
  ];

  // All geographic focus options
  const geographicOptions: GeographicFocus[] = [
    'North America', 
    'Europe', 
    'Asia-Pacific', 
    'Emerging Markets', 
    'Global Diversification'
  ];
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Smart Advisor</h1>
        <p className="text-muted-foreground">
          Get personalized investment recommendations based on your preferences and goals
        </p>
      </div>
      
      {/* Main Content */}
      {selectedStock ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handleBackToRecommendations}>
              ← Back to Recommendations
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{selectedStock.ticker}</CardTitle>
                  <CardDescription className="text-lg">{selectedStock.companyName}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatCurrency(selectedStock.currentPrice)}
                  </div>
                  {selectedStock.changePercent !== undefined && (
                    <div className={selectedStock.changePercent >= 0 ? "text-green-500" : "text-red-500"}>
                      {formatPercent(selectedStock.changePercent)}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stock Chart */}
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={selectedStock.chartData || []} 
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Price']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Price" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={false} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Key Metrics */}
              <div>
                <h3 className="text-lg font-medium mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Market Cap</div>
                    <div className="font-medium">
                      {selectedStock.marketCap ? 
                        (selectedStock.marketCap >= 1_000_000_000 ? 
                          `$${(selectedStock.marketCap / 1_000_000_000).toFixed(2)}B` : 
                          `$${(selectedStock.marketCap / 1_000_000).toFixed(2)}M`) : 
                        'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">P/E Ratio</div>
                    <div className="font-medium">{selectedStock.pe?.toFixed(2) || 'N/A'}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Dividend Yield</div>
                    <div className="font-medium">
                      {selectedStock.dividendYield ? 
                        `${selectedStock.dividendYield.toFixed(2)}%` : 
                        'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* AI Analysis */}
              <div>
                <h3 className="text-lg font-medium mb-3">Why This Stock Matches Your Profile</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p>{selectedStock.explanation || "No detailed analysis available for this stock."}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile">Investment Profile</TabsTrigger>
            <TabsTrigger value="recommendations" disabled={recommendations.length === 0}>
              AI Recommendations
            </TabsTrigger>
          </TabsList>
          
          {/* Investment Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Investment Profile</CardTitle>
                <CardDescription>
                  Tell us about your investment preferences to receive personalized stock recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Risk Tolerance */}
                <div className="space-y-3">
                  <Label className="text-base">Risk Tolerance</Label>
                  <RadioGroup 
                    value={riskTolerance} 
                    onValueChange={(value) => setRiskTolerance(value as RiskTolerance)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Low" id="risk-low" />
                      <Label htmlFor="risk-low">Low</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Moderate" id="risk-moderate" />
                      <Label htmlFor="risk-moderate">Moderate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="High" id="risk-high" />
                      <Label htmlFor="risk-high">High</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Primary Goal */}
                <div className="space-y-3">
                  <Label className="text-base">Primary Goal</Label>
                  <RadioGroup 
                    value={primaryGoal} 
                    onValueChange={(value) => setPrimaryGoal(value as PrimaryGoal)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Capital Preservation" id="goal-preservation" />
                      <Label htmlFor="goal-preservation">Capital Preservation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Income" id="goal-income" />
                      <Label htmlFor="goal-income">Income (Dividends)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Growth" id="goal-growth" />
                      <Label htmlFor="goal-growth">Growth</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Speculation" id="goal-speculation" />
                      <Label htmlFor="goal-speculation">Speculation</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Investment Horizon */}
                <div className="space-y-3">
                  <Label className="text-base">Investment Horizon</Label>
                  <RadioGroup 
                    value={investmentHorizon} 
                    onValueChange={(value) => setInvestmentHorizon(value as InvestmentHorizon)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="<1 year" id="horizon-less-than-1" />
                      <Label htmlFor="horizon-less-than-1">&lt;1 year</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1–3 years" id="horizon-1-3" />
                      <Label htmlFor="horizon-1-3">1–3 years</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3–7 years" id="horizon-3-7" />
                      <Label htmlFor="horizon-3-7">3–7 years</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="7+ years" id="horizon-7-plus" />
                      <Label htmlFor="horizon-7-plus">7+ years</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Sector Preferences */}
                <div className="space-y-3">
                  <Label className="text-base">Sector Preferences (select multiple)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sectorOptions.map((sector) => (
                      <div key={sector} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`sector-${sector}`} 
                          checked={sectorPreferences.includes(sector)}
                          onCheckedChange={() => toggleSectorPreference(sector)}
                        />
                        <Label htmlFor={`sector-${sector}`}>{sector}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Geographic Focus */}
                <div className="space-y-3">
                  <Label className="text-base">Geographic Focus (select multiple)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {geographicOptions.map((region) => (
                      <div key={region} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`region-${region}`} 
                          checked={geographicFocus.includes(region)}
                          onCheckedChange={() => toggleGeographicFocus(region)}
                        />
                        <Label htmlFor={`region-${region}`}>{region}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                  Reset
                </Button>
                <Button onClick={handleProfileSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Save Profile & Generate Recommendations"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* AI Recommendations Tab */}
          <TabsContent value="recommendations" className="mt-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating personalized recommendations...</p>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-6">
                {analysisText && (
                  <Alert className="bg-blue-500/10 border-blue-500/50">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <AlertTitle>AI Investment Analysis</AlertTitle>
                    <AlertDescription className="text-sm mt-2">
                      {analysisText}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((stock) => (
                    <Card key={stock.ticker} className="w-full overflow-hidden hover:shadow-md transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center">
                              {stock.ticker}
                              {stock.changePercent !== undefined && (
                                <span 
                                  className={`ml-2 px-2 py-0.5 rounded text-xs ${stock.changePercent >= 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                                >
                                  {formatPercent(stock.changePercent)}
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription>{stock.companyName}</CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {formatCurrency(stock.currentPrice)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-0">
                        {/* Mini Sparkline Chart */}
                        <div className="h-16 mt-2 mb-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stock.chartData || []}>
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={stock.changePercent && stock.changePercent >= 0 ? "#22c55e" : "#ef4444"} 
                                strokeWidth={2} 
                                dot={false} 
                              />
                              <XAxis dataKey="date" hide />
                              <YAxis hide domain={['auto', 'auto']} />
                              <Tooltip 
                                formatter={(value) => [formatCurrency(Number(value)), 'Price']}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                          <div>
                            <span className="text-muted-foreground">P/E Ratio</span>
                            <div className="font-medium">{stock.pe?.toFixed(2) || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Dividend Yield</span>
                            <div className="font-medium">{stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : 'N/A'}</div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end pt-2 pb-3">
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleViewStockDetails(stock.ticker)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-2">
                  No recommendations yet. Fill out your investment profile to get started.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SmartAdvisor;
