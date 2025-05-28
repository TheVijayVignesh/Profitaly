import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { FantasyGroundsProvider } from '@/context/FantasyGroundsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, Calendar, Plus, TrendingUp } from 'lucide-react';
import CompetitionCard from '@/components/fantasy-grounds/CompetitionCard';
import AIAdvisorChatbot from '@/components/fantasy-grounds/AIAdvisorChatbot';
import { Competition } from '@/types/fantasy-grounds';
import { getLeaderboard } from '@/services/fantasy-grounds/competitionService';

const FantasyGrounds: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [topParticipants, setTopParticipants] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch top participants from recent competitions
  useEffect(() => {
    const fetchTopParticipants = async () => {
      if (competitions.length > 0) {
        try {
          const recentCompetition = competitions[0];
          const leaderboard = await getLeaderboard(recentCompetition.id);
          setTopParticipants(leaderboard.slice(0, 5));
        } catch (error) {
          console.error('Error fetching top participants:', error);
        }
      }
    };

    fetchTopParticipants();
  }, [competitions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }

  return (
    <FantasyGroundsProvider>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Fantasy Grounds</h1>
          <p className="text-muted-foreground">
            Compete in virtual stock market competitions with other investors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
                <Button 
                  className="ml-4 whitespace-nowrap" 
                  onClick={() => navigate('/fantasy-grounds/create')}
                >
                  <Plus className="mr-2 h-4 w-4" /> Create
                </Button>
              </div>
              
              <TabsContent value="active" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 gap-4">
                  {competitions.filter(comp => {
                    const now = new Date();
                    return comp.startTime <= now && comp.endTime >= now;
                  }).map(competition => (
                    <CompetitionCard 
                      key={competition.id} 
                      competition={competition} 
                      status="active" 
                      onClick={() => navigate(`/fantasy-grounds/competition/${competition.id}`)}
                    />
                  ))}
                  {competitions.filter(comp => {
                    const now = new Date();
                    return comp.startTime <= now && comp.endTime >= now;
                  }).length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center mb-4">
                          There are no active competitions at the moment.
                        </p>
                        <Button onClick={() => navigate('/fantasy-grounds/create')}>
                          Create Competition
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 gap-4">
                  {competitions.filter(comp => {
                    const now = new Date();
                    return comp.startTime > now;
                  }).map(competition => (
                    <CompetitionCard 
                      key={competition.id} 
                      competition={competition} 
                      status="upcoming" 
                      onClick={() => navigate(`/fantasy-grounds/competition/${competition.id}`)}
                    />
                  ))}
                  {competitions.filter(comp => {
                    const now = new Date();
                    return comp.startTime > now;
                  }).length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center mb-4">
                          There are no upcoming competitions.
                        </p>
                        <Button onClick={() => navigate('/fantasy-grounds/create')}>
                          Create Competition
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="past" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 gap-4">
                  {competitions.filter(comp => {
                    const now = new Date();
                    return comp.endTime < now;
                  }).map(competition => (
                    <CompetitionCard 
                      key={competition.id} 
                      competition={competition} 
                      status="past" 
                      onClick={() => navigate(`/fantasy-grounds/competition/${competition.id}`)}
                    />
                  ))}
                  {competitions.filter(comp => {
                    const now = new Date();
                    return comp.endTime < now;
                  }).length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                          You haven't participated in any competitions yet.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Highest performing investors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topParticipants.length > 0 ? (
                    topParticipants.map((participant, index) => (
                      <div key={participant.userId} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                              {index + 1}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">{participant.displayName}</p>
                            <p className="text-sm text-muted-foreground">
                              ${participant.portfolioValue.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${participant.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {participant.roi >= 0 ? '+' : ''}{participant.roi.toFixed(2)}%
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Users className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-center">
                        No participants yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/fantasy-grounds/leaderboard')}
                >
                  View Full Leaderboard
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Join</CardTitle>
                <CardDescription>
                  Join a competition with one click
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competitions.filter(comp => {
                    const now = new Date();
                    return comp.startTime <= now && comp.endTime >= now;
                  }).slice(0, 3).map(competition => (
                    <Button 
                      key={competition.id} 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate(`/fantasy-grounds/competition/${competition.id}`)}
                    >
                      <div className="truncate">{competition.title}</div>
                    </Button>
                  ))}
                  {competitions.filter(comp => {
                    const now = new Date();
                    return comp.startTime <= now && comp.endTime >= now;
                  }).length === 0 && (
                    <div className="text-center text-muted-foreground py-2">
                      No active competitions
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/fantasy-grounds/join')}
                >
                  Browse All Competitions
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* AI Advisor Chatbot */}
        <AIAdvisorChatbot />
      </div>
    </FantasyGroundsProvider>
  );
};

export default FantasyGrounds;
