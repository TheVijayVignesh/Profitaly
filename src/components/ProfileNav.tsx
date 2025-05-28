import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCog } from "lucide-react";

export function ProfileNav() {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  return (
    <div className="mt-auto pt-4 border-t">
      <Link to="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
        <Avatar className="h-8 w-8">
          {currentUser.photoURL ? (
            <AvatarImage src={currentUser.photoURL} alt="Profile" />
          ) : (
            <AvatarFallback>
              {currentUser.displayName?.[0] || currentUser.email?.[0] || "U"}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">
            {currentUser.displayName || "User Profile"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {currentUser.email}
          </p>
        </div>
        <UserCog className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
} 