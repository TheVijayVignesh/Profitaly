import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Profile sections
import InvestmentIntelligence from "@/components/profile/InvestmentIntelligence";
import PortfolioPreferences from "@/components/profile/PortfolioPreferences";
import ActivityHistory from "@/components/profile/ActivityHistory";
import LearningProgress from "@/components/profile/LearningProgress";
import SecuritySettings from "@/components/profile/SecuritySettings";
import NotificationSettings from "@/components/profile/NotificationSettings";
import SocialSettings from "@/components/profile/SocialSettings";

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setProfileData(userDoc.data());
        } else {
          // Create default profile if it doesn't exist
          const defaultProfile = {
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            joinDate: new Date().toISOString(),
            aiProfile: {
              investorType: "Not Set",
              strengths: [],
              weaknesses: [],
              riskAppetite: "Medium"
            },
            preferences: {
              budget: "0-5000",
              markets: ["US"],
              sectors: [],
              style: "Long-term"
            },
            learningStatus: {
              modulesCompleted: [],
              certificates: []
            },
            notifications: {
              advisorUpdates: true,
              priceDrop: true,
              emailAlerts: true,
              fantasyUpdates: true
            }
          };
          
          await setDoc(userRef, defaultProfile);
          setProfileData(defaultProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser, toast]);

  const updateProfile = async (section, data) => {
    if (!currentUser?.uid || !profileData) return;
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { [section]: data });
      
      setProfileData(prev => ({
        ...prev,
        [section]: data
      }));
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="Profile" 
                className="h-16 w-16 rounded-full object-cover" 
              />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {currentUser?.displayName?.[0] || currentUser?.email?.[0] || "U"}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {currentUser?.displayName || "Your Profile"}
            </h1>
            <p className="text-muted-foreground">
              {currentUser?.email}
            </p>
          </div>
        </div>

        <Tabs defaultValue="investment" className="w-full">
          <div className="border-b mb-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="investment">Investment Intelligence</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio Preferences</TabsTrigger>
              <TabsTrigger value="activity">Activity History</TabsTrigger>
              <TabsTrigger value="learning">Learning Progress</TabsTrigger>
              <TabsTrigger value="security">Security & Privacy</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="social">Social & Connect</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="investment">
            <InvestmentIntelligence 
              data={profileData?.aiProfile} 
              updateProfile={(data) => updateProfile("aiProfile", data)} 
            />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioPreferences 
              data={profileData?.preferences} 
              updateProfile={(data) => updateProfile("preferences", data)} 
            />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityHistory 
              userId={currentUser.uid} 
              data={profileData} 
            />
          </TabsContent>

          <TabsContent value="learning">
            <LearningProgress 
              data={profileData?.learningStatus} 
              updateProfile={(data) => updateProfile("learningStatus", data)} 
            />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings 
              data={profileData?.notifications} 
              updateProfile={(data) => updateProfile("notifications", data)} 
            />
          </TabsContent>

          <TabsContent value="social">
            <SocialSettings 
              userId={currentUser.uid} 
              data={profileData} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage; 