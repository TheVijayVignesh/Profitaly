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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Download, 
  ExternalLink, 
  ArrowRight 
} from "lucide-react";

// Mock data for courses
const mockCourses = [
  { 
    id: 1, 
    title: "Introduction to Stock Market", 
    progress: 100, 
    completed: true, 
    modules: 5,
    completedModules: 5,
    certificateAvailable: true,
    date: "2023-02-15"
  },
  { 
    id: 2, 
    title: "Technical Analysis Fundamentals", 
    progress: 65, 
    completed: false, 
    modules: 8,
    completedModules: 5,
    certificateAvailable: false,
    date: "2023-03-10"
  },
  { 
    id: 3, 
    title: "Value Investing Principles", 
    progress: 30, 
    completed: false, 
    modules: 6,
    completedModules: 2,
    certificateAvailable: false,
    date: "2023-04-05"
  },
];

// Mock data for badges
const mockBadges = [
  { id: 1, name: "First Investment", icon: "🏆", earned: true, date: "2023-02-10" },
  { id: 2, name: "Portfolio Master", icon: "🎯", earned: true, date: "2023-03-01" },
  { id: 3, name: "Risk Manager", icon: "🛡️", earned: false, date: null },
  { id: 4, name: "Dividend Expert", icon: "💰", earned: false, date: null },
];

// Mock recommended courses
const recommendedCourses = [
  { id: 4, title: "Advanced Options Trading", description: "Learn advanced options strategies for various market conditions" },
  { id: 5, title: "Crypto Fundamentals", description: "Understanding blockchain technology and cryptocurrency investments" },
];

const LearningProgress = ({ data, updateProfile }) => {
  const [activeTab, setActiveTab] = useState("courses");
  
  // Calculate overall progress
  const overallProgress = mockCourses.reduce((acc, course) => {
    return acc + (course.progress / mockCourses.length);
  }, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle>Learning Progress Tracker</CardTitle>
          </div>
          <CardDescription>
            Track your learning journey and educational achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Overall Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">{Math.round(overallProgress)}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="grid grid-cols-3 w-full text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Courses Enrolled</p>
                    <p className="text-xl font-bold">{mockCourses.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-xl font-bold">{mockCourses.filter(c => c.completed).length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Certificates</p>
                    <p className="text-xl font-bold">{mockCourses.filter(c => c.certificateAvailable).length}</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Badges Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  {mockBadges.filter(badge => badge.earned).map((badge) => (
                    <div key={badge.id} className="flex flex-col items-center">
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <span className="text-xs">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Course List */}
          <div>
            <h3 className="text-lg font-medium mb-4">Your Courses</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={course.progress} className="h-2 w-24" />
                        <span className="text-xs">{course.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{course.completedModules}/{course.modules}</TableCell>
                    <TableCell>
                      {course.completed ? (
                        <Badge className="bg-green-500">Completed</Badge>
                      ) : (
                        <Badge variant="outline">In Progress</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {course.certificateAvailable ? (
                        <Button variant="outline" size="sm">
                          <Award className="h-4 w-4 mr-1" />
                          Certificate
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Recommended Courses */}
          <div>
            <h3 className="text-lg font-medium mb-4">Recommended for You</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedCourses.map((course) => (
                <Card key={course.id} className="bg-muted/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Enroll <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Badges Collection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle>Badges Collection</CardTitle>
          </div>
          <CardDescription>
            Earn badges by completing learning modules and investment milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {mockBadges.map((badge) => (
              <Card
                key={badge.id}
                className={`flex flex-col items-center justify-center py-4 
                  ${badge.earned ? "" : "bg-muted/30 opacity-70"}`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-medium text-center">{badge.name}</p>
                {badge.earned ? (
                  <p className="text-xs text-muted-foreground">
                    Earned on {new Date(badge.date).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not yet earned</p>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningProgress; 