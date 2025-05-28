import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  Checkbox
} from "@/components/ui/checkbox";
import {
  Button
} from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SECTORS = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Consumer Goods",
  "Energy",
  "Utilities",
  "Real Estate",
  "Materials",
  "Industrials",
  "Communication Services"
];

const RISK_TOLERANCE = [
  "Conservative",
  "Balanced",
  "Aggressive"
];

const INVESTMENT_GOALS = [
  "Retirement",
  "Education",
  "Home Purchase",
  "Wealth Building",
  "Income Generation",
  "Capital Preservation"
];

const INVESTMENT_HORIZONS = [
  "Short-term (< 1 year)",
  "Medium-term (1-5 years)",
  "Long-term (5+ years)"
];

const MARKETS = [
  "US Stocks",
  "European Markets",
  "Asian Markets",
  "Emerging Markets",
  "Global"
];

const EXCLUDED_INDUSTRIES = [
  "Tobacco",
  "Gambling",
  "Weapons/Defense",
  "Fossil Fuels",
  "Adult Entertainment"
];

// Interface for investment preferences
interface InvestmentPreferences {
  riskTolerance: string;
  investmentGoals: string[];
  investmentHorizon: string;
  preferredSectors: string[];
  preferredMarkets: string[];
  monthlyInvestment: string;
  preferredDividendYield: string;
  excludedIndustries: string[];
  esgFocus: boolean;
}

interface PortfolioPreferencesProps {
  data: any;
  updateProfile: (data: any) => Promise<void>;
}

const PortfolioPreferences = ({ data, updateProfile }: PortfolioPreferencesProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<InvestmentPreferences>({
    riskTolerance: data?.riskTolerance || "Balanced",
    investmentGoals: data?.investmentGoals || [],
    investmentHorizon: data?.investmentHorizon || "Medium-term (1-5 years)",
    preferredSectors: data?.preferredSectors || [],
    preferredMarkets: data?.preferredMarkets || ["US Stocks"],
    monthlyInvestment: data?.monthlyInvestment || "$100-$500",
    preferredDividendYield: data?.preferredDividendYield || "No preference",
    excludedIndustries: data?.excludedIndustries || [],
    esgFocus: data?.esgFocus || false
  });

  // Handle checkbox change for arrays
  const handleCheckboxChange = (category: keyof InvestmentPreferences, value: string) => {
    if (Array.isArray(preferences[category])) {
      const currentValues = preferences[category] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      setPreferences(prev => ({
        ...prev,
        [category]: newValues
      }));
    }
  };

  // Save preferences to Firebase
  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await updateProfile(preferences);
      toast({
        title: "Success",
        description: "Your investment preferences have been saved.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Preferences</CardTitle>
        <CardDescription>Customize your investment preferences to get personalized recommendations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Tolerance */}
        <div className="space-y-2">
          <Label>Risk Tolerance</Label>
          <RadioGroup
            value={preferences.riskTolerance}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, riskTolerance: value }))}
            className="flex flex-col space-y-1"
          >
            {RISK_TOLERANCE.map(risk => (
              <div key={risk} className="flex items-center space-x-2">
                <RadioGroupItem value={risk} id={`risk-${risk}`} />
                <Label htmlFor={`risk-${risk}`}>{risk} {risk === "Conservative" ? "- Prioritize capital preservation" : 
                  risk === "Balanced" ? "- Mix of growth and stability" : 
                  "- Focus on growth potential"}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Investment Goals */}
        <div className="space-y-2">
          <Label>Investment Goals (Select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {INVESTMENT_GOALS.map(goal => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox 
                  id={`goal-${goal}`} 
                  checked={preferences.investmentGoals.includes(goal)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleCheckboxChange('investmentGoals', goal);
                    } else {
                      handleCheckboxChange('investmentGoals', goal);
                    }
                  }}
                />
                <Label htmlFor={`goal-${goal}`}>{goal}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Horizon */}
        <div className="space-y-2">
          <Label>Investment Horizon</Label>
          <RadioGroup
            value={preferences.investmentHorizon}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, investmentHorizon: value }))}
            className="flex flex-col space-y-1"
          >
            {INVESTMENT_HORIZONS.map(horizon => (
              <div key={horizon} className="flex items-center space-x-2">
                <RadioGroupItem value={horizon} id={`horizon-${horizon}`} />
                <Label htmlFor={`horizon-${horizon}`}>{horizon}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Preferred Sectors */}
        <div className="space-y-2">
          <Label>Preferred Sectors (Select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SECTORS.map(sector => (
              <div key={sector} className="flex items-center space-x-2">
                <Checkbox 
                  id={`sector-${sector}`} 
                  checked={preferences.preferredSectors.includes(sector)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleCheckboxChange('preferredSectors', sector);
                    } else {
                      handleCheckboxChange('preferredSectors', sector);
                    }
                  }}
                />
                <Label htmlFor={`sector-${sector}`}>{sector}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Preferred Markets */}
        <div className="space-y-2">
          <Label>Preferred Markets (Select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {MARKETS.map(market => (
              <div key={market} className="flex items-center space-x-2">
                <Checkbox 
                  id={`market-${market}`} 
                  checked={preferences.preferredMarkets.includes(market)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleCheckboxChange('preferredMarkets', market);
                    } else {
                      handleCheckboxChange('preferredMarkets', market);
                    }
                  }}
                />
                <Label htmlFor={`market-${market}`}>{market}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Investment */}
        <div className="space-y-2">
          <Label>Monthly Investment Amount</Label>
          <RadioGroup
            value={preferences.monthlyInvestment}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, monthlyInvestment: value }))}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="$0-$100" id="investment-0-100" />
              <Label htmlFor="investment-0-100">$0-$100</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="$100-$500" id="investment-100-500" />
              <Label htmlFor="investment-100-500">$100-$500</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="$500-$1000" id="investment-500-1000" />
              <Label htmlFor="investment-500-1000">$500-$1000</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="$1000+" id="investment-1000-plus" />
              <Label htmlFor="investment-1000-plus">$1000+</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Preferred Dividend Yield */}
        <div className="space-y-2">
          <Label>Preferred Dividend Yield</Label>
          <RadioGroup
            value={preferences.preferredDividendYield}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, preferredDividendYield: value }))}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No preference" id="dividend-none" />
              <Label htmlFor="dividend-none">No preference</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1-3%" id="dividend-1-3" />
              <Label htmlFor="dividend-1-3">1-3%</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3-5%" id="dividend-3-5" />
              <Label htmlFor="dividend-3-5">3-5%</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5%+" id="dividend-5-plus" />
              <Label htmlFor="dividend-5-plus">5%+</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Excluded Industries */}
        <div className="space-y-2">
          <Label>Industries You Want to Exclude (if any)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {EXCLUDED_INDUSTRIES.map(industry => (
              <div key={industry} className="flex items-center space-x-2">
                <Checkbox 
                  id={`industry-${industry}`} 
                  checked={preferences.excludedIndustries.includes(industry)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleCheckboxChange('excludedIndustries', industry);
                    } else {
                      handleCheckboxChange('excludedIndustries', industry);
                    }
                  }}
                />
                <Label htmlFor={`industry-${industry}`}>{industry}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* ESG Focus */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="esg-focus" 
              checked={preferences.esgFocus}
              onCheckedChange={(checked) => {
                setPreferences(prev => ({ ...prev, esgFocus: checked === true }));
              }}
            />
            <Label htmlFor="esg-focus">Focus on ESG (Environmental, Social, Governance) investments</Label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSavePreferences} 
          disabled={saving} 
          className="w-full md:w-auto"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PortfolioPreferences;
