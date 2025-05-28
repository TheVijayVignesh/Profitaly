import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { availableMarkets, walletPresets, useTrialRoomSetup } from "@/hooks/useTrialRoomSetup";
import { ArrowRight, Coins, Globe, Wallet } from "lucide-react";

interface SetupFormProps {
  onSetupComplete: () => void;
}

const SetupForm = ({ onSetupComplete }: SetupFormProps) => {
  const {
    selectedMarket,
    setSelectedMarket,
    walletAmount,
    setWalletAmount,
    isLoading,
    hasExistingRoom,
    existingRoomData,
    createTrialRoom,
    getCurrencySymbol,
    getCurrencyName
  } = useTrialRoomSetup();

  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  // Get the current currency based on selected market
  const currency = availableMarkets.find(m => m.id === selectedMarket)?.currency || "usd";
  const currencySymbol = getCurrencySymbol(selectedMarket);

  // Handle market selection
  const handleMarketChange = (value) => {
    setSelectedMarket(value);
    // Reset to default wallet amount when market changes
    setWalletAmount(walletPresets[availableMarkets.find(m => m.id === value)?.currency || "usd"][0]);
    setUseCustomAmount(false);
  };

  // Handle preset wallet selection
  const handleWalletPresetChange = (value) => {
    if (value === "custom") {
      setUseCustomAmount(true);
      setCustomAmount(walletAmount.toString());
    } else {
      setUseCustomAmount(false);
      setWalletAmount(parseInt(value));
    }
  };

  // Handle custom amount change
  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(value);
    if (value) {
      setWalletAmount(parseInt(value));
    }
  };

  // Handle setup submission
  const handleSetup = async () => {
    const result = await createTrialRoom();
    if (result) {
      onSetupComplete();
    }
  };

  // Show existing room data if available
  if (isLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  // Show current trial room if it exists
  if (hasExistingRoom && existingRoomData) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Your Trial Room Is Ready</CardTitle>
          <CardDescription>
            You already have an active trading room with virtual funds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-md p-4 space-y-3">
            <div className="flex items-center">
              <Globe className="mr-2 h-5 w-5 text-muted-foreground" />
              <Label>Market:</Label>
              <span className="ml-2 font-medium">{availableMarkets.find(m => m.id === existingRoomData.market)?.name}</span>
            </div>
            <div className="flex items-center">
              <Wallet className="mr-2 h-5 w-5 text-muted-foreground" />
              <Label>Total Wallet:</Label>
              <span className="ml-2 font-medium">{currencySymbol}{existingRoomData.wallet.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <Coins className="mr-2 h-5 w-5 text-muted-foreground" />
              <Label>Available Cash:</Label>
              <span className="ml-2 font-medium">{currencySymbol}{existingRoomData.cash_left.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onSetupComplete}>
            Continue to Trial Room <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Setup Your Trading Room</CardTitle>
        <CardDescription>
          Create a virtual trading environment with dummy money to practice investing without risk.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="market">Select a Market</Label>
            <Select value={selectedMarket} onValueChange={handleMarketChange}>
              <SelectTrigger id="market">
                <SelectValue placeholder="Select a market" />
              </SelectTrigger>
              <SelectContent>
                {availableMarkets.map((market) => (
                  <SelectItem key={market.id} value={market.id}>
                    {market.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              You will see stocks available in this market for trading
            </p>
          </div>

          <div>
            <Label>Virtual Wallet Amount</Label>
            <RadioGroup
              value={useCustomAmount ? "custom" : walletAmount.toString()}
              onValueChange={handleWalletPresetChange}
              className="grid grid-cols-2 gap-4 mt-2"
            >
              {walletPresets[currency].map((amount) => (
                <div key={amount} className="flex items-center space-x-2">
                  <RadioGroupItem value={amount.toString()} id={`wallet-${amount}`} />
                  <Label htmlFor={`wallet-${amount}`} className="cursor-pointer">
                    {currencySymbol}{amount.toLocaleString()}
                  </Label>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="wallet-custom" />
                <Label htmlFor="wallet-custom" className="cursor-pointer">
                  Custom Amount
                </Label>
              </div>
            </RadioGroup>

            {useCustomAmount && (
              <div className="mt-4">
                <Label htmlFor="custom-amount">Enter Amount ({getCurrencyName(selectedMarket)})</Label>
                <div className="flex items-center mt-1">
                  <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input">
                    {currencySymbol}
                  </span>
                  <Input
                    id="custom-amount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="rounded-l-none"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSetup} disabled={isLoading}>
          {isLoading ? "Setting Up..." : "Start Trial Room"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SetupForm; 