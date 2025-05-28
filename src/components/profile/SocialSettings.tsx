import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Switch
} from "@/components/ui/switch";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  MessageSquare, 
  Shield, 
  Check, 
  X,
  Globe,
  Lock
} from "lucide-react";

// Mock data for friends
const mockFriends = [
  { id: 1, name: "Jane Cooper", avatar: "https://i.pravatar.cc/150?img=1", status: "online" },
  { id: 2, name: "Wade Warren", avatar: "https://i.pravatar.cc/150?img=2", status: "offline" },
  { id: 3, name: "Esther Howard", avatar: "https://i.pravatar.cc/150?img=3", status: "online" },
];

// Mock data for requests
const mockRequests = [
  { id: 1, name: "Darlene Robertson", avatar: "https://i.pravatar.cc/150?img=4" },
  { id: 2, name: "Brooklyn Simmons", avatar: "https://i.pravatar.cc/150?img=5" },
];

// Mock data for blocked users
const mockBlocked = [
  { id: 1, name: "Cameron Williamson", avatar: "https://i.pravatar.cc/150?img=6" },
];

// Mock data for groups
const mockGroups = [
  { id: 1, name: "Tech Investors Circle", members: 42, joined: "2023-03-15" },
  { id: 2, name: "Value Investing Club", members: 27, joined: "2023-02-20" },
];

const SocialSettings = ({ userId, data }) => {
  const [activeTab, setActiveTab] = useState("friends");
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    activitySharing: true,
    allowFriendRequests: true,
    showOnlineStatus: true,
  });
  
  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
    // In a real app, you would call updateProfile here
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Social & Connect Settings</CardTitle>
          </div>
          <CardDescription>
            Manage your connections and social preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="blocked">Blocked</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
            </TabsList>
            
            <TabsContent value="friends">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Your Friends</h3>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Find Friends
                  </Button>
                </div>
                
                {mockFriends.length > 0 ? (
                  <div className="space-y-3">
                    {mockFriends.map(friend => (
                      <div key={friend.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={friend.avatar} alt={friend.name} />
                            <AvatarFallback>{friend.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{friend.name}</p>
                            <div className="flex items-center">
                              <div className={`h-2 w-2 rounded-full mr-1 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <p className="text-xs text-muted-foreground capitalize">{friend.status}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>You don't have any friends yet.</p>
                    <Button variant="outline" size="sm" className="mt-4">Find Friends</Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="requests">
              {mockRequests.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium mb-3">Friend Requests</h3>
                  {mockRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.avatar} alt={request.name} />
                          <AvatarFallback>{request.name[0]}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{request.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button size="sm" variant="outline">
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No pending friend requests.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="blocked">
              {mockBlocked.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium mb-3">Blocked Users</h3>
                  {mockBlocked.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{user.name}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Shield className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>You haven't blocked any users.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="groups">
              {mockGroups.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Your Groups</h3>
                    <Button variant="outline" size="sm">
                      Discover Groups
                    </Button>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group Name</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Joined On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockGroups.map(group => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell>{group.members}</TableCell>
                          <TableCell>{new Date(group.joined).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost">
                                Open
                              </Button>
                              <Button size="sm" variant="ghost">
                                Leave
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>You haven't joined any groups yet.</p>
                  <Button variant="outline" size="sm" className="mt-4">Discover Groups</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>Privacy & Chat Settings</CardTitle>
          </div>
          <CardDescription>
            Control how others can interact with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Profile Visibility</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Allow others to see your profile and investments
                </div>
              </div>
              <Switch 
                checked={privacySettings.profileVisibility}
                onCheckedChange={(checked) => handlePrivacyChange('profileVisibility', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Activity Sharing</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Share your activity with friends
                </div>
              </div>
              <Switch 
                checked={privacySettings.activitySharing}
                onCheckedChange={(checked) => handlePrivacyChange('activitySharing', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Friend Requests</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Allow others to send you friend requests
                </div>
              </div>
              <Switch 
                checked={privacySettings.allowFriendRequests}
                onCheckedChange={(checked) => handlePrivacyChange('allowFriendRequests', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Online Status</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Show when you're online
                </div>
              </div>
              <Switch 
                checked={privacySettings.showOnlineStatus}
                onCheckedChange={(checked) => handlePrivacyChange('showOnlineStatus', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialSettings; 