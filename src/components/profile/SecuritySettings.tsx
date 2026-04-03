import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, User, Mail, Info } from "lucide-react";

const SecuritySettings = () => {
  // Mock user data since authentication is removed
  const mockUser = {
    displayName: "Demo User",
    email: "demo@profitaly.com",
    emailVerified: true
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This is a demo application. Authentication features are disabled.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your demo account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-3 border rounded-md">
              <User className="h-5 w-5 text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{mockUser.displayName}</p>
              </div>
            </div>

            <div className="flex items-center p-3 border rounded-md">
              <Mail className="h-5 w-5 text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{mockUser.email}</p>
              </div>
              {mockUser.emailVerified ? (
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

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-900 mb-2">Demo Account Features</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• All data is stored locally in your browser</li>
              <li>• No real account or authentication required</li>
              <li>• Settings are saved in your browser's local storage</li>
              <li>• All features work without creating an account</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
