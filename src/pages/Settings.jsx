import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import ThemeSettings from "@/components/settings/ThemeSettings";
import { 
  PanelLeft, 
  Palette, 
  Bell, 
  User, 
  Shield, 
  Network, 
  HelpCircle 
} from "lucide-react";

/**
 * User settings page with multiple tabs for different settings categories
 */
export default function Settings() {
  const [activeTab, setActiveTab] = useState("appearance");

  return (
    <div className="container py-8">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your Profitaly experience
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          <TabsTrigger value="appearance" className="flex gap-2 items-center">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="sidebar" className="flex gap-2 items-center">
            <PanelLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Sidebar</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex gap-2 items-center">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex gap-2 items-center">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex gap-2 items-center">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex gap-2 items-center">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Connections</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="flex gap-2 items-center">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Help</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="space-y-4">
          <ThemeSettings />
          {/* Other appearance settings can go here */}
        </TabsContent>
        
        <TabsContent value="sidebar">
          <div className="text-center p-8 text-muted-foreground">
            Sidebar settings coming soon...
          </div>
        </TabsContent>
        
        <TabsContent value="account">
          <div className="text-center p-8 text-muted-foreground">
            Account settings coming soon...
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <div className="text-center p-8 text-muted-foreground">
            Notification preferences coming soon...
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="text-center p-8 text-muted-foreground">
            Security settings coming soon...
          </div>
        </TabsContent>
        
        <TabsContent value="connections">
          <div className="text-center p-8 text-muted-foreground">
            Connection settings coming soon...
          </div>
        </TabsContent>
        
        <TabsContent value="help">
          <div className="text-center p-8 text-muted-foreground">
            Help and documentation coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 