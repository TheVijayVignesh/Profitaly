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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, ShieldAlert, Mail, Lock, KeyRound, UserRound, LogOut, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

const SecuritySettings = () => {
  const { currentUser, updateUserProfile, resetPassword, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Dialog states
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  
  // Form states
  const [email, setEmail] = useState(currentUser?.email || "");
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");

  const handleResetPassword = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await resetPassword(email);
      setIsResetPasswordOpen(false);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for instructions to reset your password.",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateProfile = async () => {
    if (!displayName) {
      setError("Display name is required");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await updateUserProfile(displayName);
      setIsUpdateProfileOpen(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
      // Redirect is handled by the RequireAuth component
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <CardTitle>Security & Privacy Settings</CardTitle>
          </div>
          <CardDescription>
            Manage your account security and privacy preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Information Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-3 border rounded-md">
                <UserRound className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{currentUser?.displayName || "Not set"}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => setIsUpdateProfileOpen(true)}
                >
                  Edit
                </Button>
              </div>

              <div className="flex items-center p-3 border rounded-md">
                <Mail className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{currentUser?.email}</p>
                </div>
                {currentUser?.emailVerified ? (
                  <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Verified
                  </span>
                ) : (
                  <span className="ml-auto px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Security Options */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Security Options</h3>
            
            <Card className="border-muted">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base font-medium">Password</CardTitle>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsResetPasswordOpen(true)}
                  >
                    Reset Password
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">
                  Change your password by requesting a password reset email
                </p>
              </CardContent>
            </Card>

            {currentUser?.providerData?.[0]?.providerId === "google.com" && (
              <Card className="border-muted">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
                    <CardTitle className="text-base font-medium">Google Account</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Your account is linked with Google
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Session Management - Can be expanded later */}
            <Card className="border-muted">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base font-medium">Active Sessions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Current Browser</p>
                      <p className="text-xs text-muted-foreground">
                        {navigator.userAgent.split(' ').slice(0, 3).join(' ')}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setIsDeleteAccountOpen(true)}
          >
            Delete Account
          </Button>
        </CardFooter>
      </Card>
    
      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              We'll send you an email with instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={loading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Update Profile Dialog */}
      <Dialog open={isUpdateProfileOpen} onOpenChange={setIsUpdateProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="displayName">Display Name</Label>
              <Input 
                id="displayName" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                disabled={loading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateProfileOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile} disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              All your data including profile, activity history, and preferences will be permanently deleted.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              To confirm, type "DELETE" in the field below:
            </p>
            <Input placeholder="Type DELETE to confirm" />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAccountOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecuritySettings; 