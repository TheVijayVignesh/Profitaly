import { useState } from "react";
import { useFantasy } from "../hooks/useFantasyContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Check, Loader2 } from "lucide-react";

const JoinLeague = ({ onSuccess }) => {
  const { joinLeague, createLeague, leaveLeague, leagueData, loading } = useFantasy();
  const [joinTab, setJoinTab] = useState("join");
  const [leagueId, setLeagueId] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [market, setMarket] = useState("NSE");
  const [walletSize, setWalletSize] = useState("100000");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already in a league, show information about current league
  if (leagueData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Current League</CardTitle>
          <CardDescription>
            You are currently participating in a league
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">League Name</h3>
                <p>{leagueData.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">League Type</h3>
                <p>{leagueData.isPrivate ? "Private" : "Public"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Market</h3>
                <p>{leagueData.market}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Wallet Size</h3>
                <p>{leagueData.walletSize.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Participants</h3>
                <p>{leagueData.users?.length || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="destructive" 
            onClick={async () => {
              if (window.confirm("Are you sure you want to leave this league? Your portfolio will be reset.")) {
                setIsSubmitting(true);
                try {
                  await leaveLeague();
                  setSuccess("You have left the league");
                } catch (error) {
                  setError(error.message);
                } finally {
                  setIsSubmitting(false);
                }
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Leaving...
              </>
            ) : (
              "Leave League"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const handleJoinLeague = async (e) => {
    e.preventDefault();
    if (!leagueId) {
      setError("Please enter a league ID");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await joinLeague(leagueId, { 
        walletSize: parseInt(walletSize), 
        market 
      });
      setSuccess("Successfully joined league!");
      if (onSuccess) onSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLeague = async (e) => {
    e.preventDefault();
    if (!leagueName) {
      setError("Please enter a league name");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const newLeagueId = await createLeague(leagueName, isPrivate, {
        walletSize: parseInt(walletSize),
        market
      });
      setSuccess(`Successfully created league with ID: ${newLeagueId}`);
      if (onSuccess) onSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>League Entry</CardTitle>
        <CardDescription>
          Join an existing league or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 bg-success/20 text-success border-success">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <Tabs value={joinTab} onValueChange={setJoinTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="join">Join League</TabsTrigger>
            <TabsTrigger value="create">Create League</TabsTrigger>
          </TabsList>
          
          <TabsContent value="join">
            <form onSubmit={handleJoinLeague} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leagueId">League ID</Label>
                <Input
                  id="leagueId"
                  placeholder="Enter the league ID"
                  value={leagueId}
                  onChange={(e) => setLeagueId(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="market">Market</Label>
                <Select value={market} onValueChange={setMarket}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NSE">NSE (India)</SelectItem>
                    <SelectItem value="NYSE">NYSE (US)</SelectItem>
                    <SelectItem value="NASDAQ">NASDAQ (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="walletSize">Wallet Size</Label>
                <Select value={walletSize} onValueChange={setWalletSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select wallet size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10000">₹10,000</SelectItem>
                    <SelectItem value="50000">₹50,000</SelectItem>
                    <SelectItem value="100000">₹1,00,000</SelectItem>
                    <SelectItem value="1000000">₹10,00,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join League"
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="create">
            <form onSubmit={handleCreateLeague} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leagueName">League Name</Label>
                <Input
                  id="leagueName"
                  placeholder="Enter a name for your league"
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leagueType">League Type</Label>
                <RadioGroup 
                  value={isPrivate ? "private" : "public"} 
                  onValueChange={(value) => setIsPrivate(value === "private")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public">Public</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private">Private</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="market">Market</Label>
                <Select value={market} onValueChange={setMarket}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NSE">NSE (India)</SelectItem>
                    <SelectItem value="NYSE">NYSE (US)</SelectItem>
                    <SelectItem value="NASDAQ">NASDAQ (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="walletSize">Wallet Size</Label>
                <Select value={walletSize} onValueChange={setWalletSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select wallet size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10000">₹10,000</SelectItem>
                    <SelectItem value="50000">₹50,000</SelectItem>
                    <SelectItem value="100000">₹1,00,000</SelectItem>
                    <SelectItem value="1000000">₹10,00,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create League"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JoinLeague; 