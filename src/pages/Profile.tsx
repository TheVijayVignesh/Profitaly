import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Calendar,
  Settings,
  Bell,
  Shield,
  BookOpen,
  TrendingUp,
  DollarSign,
  Target,
  Activity
} from "lucide-react";

const ProfilePage = () => {
  const { toast } = useToast();

  // Mock profile data
  const [profileData, setProfileData] = useState({
    name: "Demo User",
    email: "demo@profitaly.com",
    bio: "Financial enthusiast exploring the world of investing",
    investorType: "Beginner Investor",
    riskTolerance: "Moderate",
    investmentGoals: ["Long-term growth", "Portfolio diversification"],
    joinDate: new Date().toISOString(),
    preferences: {
      budget: "0-5000",
      markets: ["US"],
      sectors: ["Technology", "Healthcare"],
      notifications: {
        priceAlerts: true,
        marketNews: true,
        weeklyReports: false
      }
    }
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Mock save - just show success message
    toast({
      title: "Profile Updated",
      description: "Your profile preferences have been saved.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset any unsaved changes if needed
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="investing">Investing Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your basic profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Member since {new Date(profileData.joinDate).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Investment Profile
              </CardTitle>
              <CardDescription>
                Your investment preferences and goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Investor Type</Label>
                    <p className="text-sm text-muted-foreground mt-1">{profileData.investorType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Risk Tolerance</Label>
                    <p className="text-sm text-muted-foreground mt-1">{profileData.riskTolerance}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Investment Goals</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profileData.investmentGoals.map((goal, index) => (
                        <Badge key={index} variant="secondary">{goal}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Budget Range</Label>
                    <p className="text-sm text-muted-foreground mt-1">${profileData.preferences.budget}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Preferred Markets</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profileData.preferences.markets.map((market, index) => (
                    <Badge key={index} variant="outline">{market}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Preferred Sectors</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profileData.preferences.sectors.map((sector, index) => (
                    <Badge key={index} variant="outline">{sector}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences & Notifications
              </CardTitle>
              <CardDescription>
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Price Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when stocks hit your target prices
                    </p>
                  </div>
                  <Switch
                    checked={profileData.preferences.notifications.priceAlerts}
                    onCheckedChange={(checked) =>
                      setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences,
                          notifications: {
                            ...profileData.preferences.notifications,
                            priceAlerts: checked
                          }
                        }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Market News</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily market updates and news
                    </p>
                  </div>
                  <Switch
                    checked={profileData.preferences.notifications.marketNews}
                    onCheckedChange={(checked) =>
                      setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences,
                          notifications: {
                            ...profileData.preferences.notifications,
                            marketNews: checked
                          }
                        }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Get weekly portfolio performance summaries
                    </p>
                  </div>
                  <Switch
                    checked={profileData.preferences.notifications.weeklyReports}
                    onCheckedChange={(checked) =>
                      setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences,
                          notifications: {
                            ...profileData.preferences.notifications,
                            weeklyReports: checked
                          }
                        }
                      })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSave}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your recent actions and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed Stock Analysis Tutorial</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Simulated trade in AAPL</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Target className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Set up investment goals</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
