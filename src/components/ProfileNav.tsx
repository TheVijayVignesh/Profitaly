import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCog } from "lucide-react";

export function ProfileNav() {
  // Mock user data since authentication is removed
  const mockUser = {
    displayName: "Demo User",
    email: "demo@profitaly.com"
  };

  return (
    <div className="mt-auto pt-4 border-t">
      <Link to="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {mockUser.displayName?.[0] || "D"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">
            {mockUser.displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {mockUser.email}
          </p>
        </div>
        <UserCog className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
