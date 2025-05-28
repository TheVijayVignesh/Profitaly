import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import InvestmentProfileForm from "./InvestmentProfileForm";
import StockRecommendationCard from "./StockRecommendationCard";
import StockDetailView from "./StockDetailView";
import { smartAdvisorService } from "./smartAdvisorService";
import { 
  InvestmentProfile, 
  StockRecommendation, 
  AIRecommendationResponse 
} from "./types";

/**
 * Smart Advisor Feature Component
 * Provides investment profile management and AI-powered stock recommendations
 */
const SmartAdvisorFeature = () => {
  const { toast } = useToast();
  
  // State for investment profile
  const [investmentProfile, setInvestmentProfile] = useState<InvestmentProfile | null>(null);
  
  // State for recommendations
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>([]);
  const [analysisText, setAnalysisText] = useState<string>("");
  
  // UI state
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockRecommendation | null>(null);
  
  /**
   * Handle form submission and generate recommendations
   * @param profile User's investment profile
   */
  const handleProfileSubmit = async (profile: InvestmentProfile) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Save profile to state
      setInvestmentProfile(profile);
      
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
        <StockDetailView 
          stock={selectedStock} 
          onBack={handleBackToRecommendations} 
        />
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
            
            <InvestmentProfileForm 
              onSubmit={handleProfileSubmit} 
              isLoading={isLoading}
              initialProfile={investmentProfile || undefined}
            />
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
                    <StockRecommendationCard 
                      key={stock.ticker}
                      stock={stock}
                      onViewDetails={handleViewStockDetails}
                    />
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

export default SmartAdvisorFeature;
