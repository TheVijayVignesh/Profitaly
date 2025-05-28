import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, RefreshCw } from "lucide-react";
import { 
  InvestmentProfile, 
  RiskTolerance, 
  PrimaryGoal, 
  InvestmentHorizon, 
  SectorPreference, 
  GeographicFocus 
} from "./types";

interface InvestmentProfileFormProps {
  onSubmit: (profile: InvestmentProfile) => void;
  isLoading?: boolean;
  initialProfile?: Partial<InvestmentProfile>;
}

const InvestmentProfileForm = ({ 
  onSubmit, 
  isLoading = false, 
  initialProfile 
}: InvestmentProfileFormProps) => {
  // Form state
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>(
    initialProfile?.riskTolerance || 'Moderate'
  );
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>(
    initialProfile?.primaryGoal || 'Growth'
  );
  const [investmentHorizon, setInvestmentHorizon] = useState<InvestmentHorizon>(
    initialProfile?.investmentHorizon || '3–7 years'
  );
  const [sectorPreferences, setSectorPreferences] = useState<SectorPreference[]>(
    initialProfile?.sectorPreferences || []
  );
  const [geographicFocus, setGeographicFocus] = useState<GeographicFocus[]>(
    initialProfile?.geographicFocus || []
  );

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

  // Submit form data
  const handleSubmit = () => {
    onSubmit({
      riskTolerance,
      primaryGoal,
      investmentHorizon,
      sectorPreferences,
      geographicFocus
    });
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
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
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
  );
};

export default InvestmentProfileForm;
