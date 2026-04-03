import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Medal, ArrowUp, ArrowDown } from 'lucide-react';
import { Competition, Participant } from '@/types/fantasy-grounds';
import { getCompetition, getLeaderboard } from '@/services/fantasy-grounds/competitionService';

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [topCompetitions, setTopCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch competition and leaderboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        if (id) {
          // Fetch specific competition
          const competitionData = await getCompetition(id);
          setCompetition(competitionData);
          
          // Fetch leaderboard for this competition
          const leaderboardData = await getLeaderboard(id);
          setParticipants(leaderboardData);
        } else {
          // Fetch top competitions (most participants)
          const competitionsQuery = query(
            collection(db, 'competitions'),
            where('isActive', '==', true),
            orderBy('participants', 'desc'),
            limit(5)
          );
          
          const competitionsSnapshot = await getDocs(competitionsQuery);
          const competitionsData = competitionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startTime: doc.data().startTime.toDate(),
            endTime: doc.data().endTime.toDate(),
            createdAt: doc.data().createdAt.toDate(),
          })) as Competition[];
          
          setTopCompetitions(competitionsData);
          
          // If there are competitions, fetch leaderboard for the first one
          if (competitionsData.length > 0) {
            setCompetition(competitionsData[0]);
            const leaderboardData = await getLeaderboard(competitionsData[0].id);
            setParticipants(leaderboardData);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <Trophy className="h-3 w-3 mr-1" /> 1st
        </Badge>
      );
    } else if (rank === 2) {
      return (
        <Badge className="bg-gray-400 hover:bg-gray-500">
          <Medal className="h-3 w-3 mr-1" /> 2nd
        </Badge>
      );
    } else if (rank === 3) {
      return (
        <Badge className="bg-amber-700 hover:bg-amber-800">
          <Medal className="h-3 w-3 mr-1" /> 3rd
        </Badge>
      );
    }
    return <Badge variant="outline">{rank}th</Badge>;
  };

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
    <div className="container py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/fantasy-grounds')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Leaderboard */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {competition ? competition.title : 'Global Leaderboard'}
              </CardTitle>
              <CardDescription>
                {competition 
                  ? `Ranking of participants in ${competition.title}`
                  : 'Top performing investors across all competitions'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {participants.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Rank</TableHead>
                      <TableHead>Investor</TableHead>
                      <TableHead className="text-right">Portfolio Value</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant, index) => {
                      const isCurrentUser = auth.currentUser && auth.currentUser.uid === participant.userId;
                      
                      return (
                        <TableRow 
                          key={participant.userId}
                          className={isCurrentUser ? 'bg-primary/5' : ''}
                        >
                          <TableCell className="font-medium">
                            {getRankBadge(index + 1)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                {participant.photoURL ? (
                                  <AvatarImage src={participant.photoURL} />
                                ) : null}
                                <AvatarFallback>
                                  {getInitials(participant.displayName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {participant.displayName}
                                  {isCurrentUser && (
                                    <Badge variant="outline" className="ml-2">You</Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Joined {participant.joinedAt.toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${participant.portfolioValue.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-medium flex items-center justify-end ${participant.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {participant.roi >= 0 ? (
                                <ArrowUp className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDown className="h-3 w-3 mr-1" />
                              )}
                              {Math.abs(participant.roi).toFixed(2)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground text-center mb-4">
                    No participants have joined this competition yet.
                  </p>
                  {competition && (
                    <Button onClick={() => navigate(`/fantasy-grounds/competition/${competition.id}`)}>
                      Join Competition
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Competitions */}
          <Card>
            <CardHeader>
              <CardTitle>Top Competitions</CardTitle>
              <CardDescription>
                Most popular competitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCompetitions.length > 0 ? (
                  topCompetitions.map((comp) => (
                    <div 
                      key={comp.id} 
                      className={`p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                        competition && competition.id === comp.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => navigate(`/fantasy-grounds/leaderboard/${comp.id}`)}
                    >
                      <div className="font-medium">{comp.title}</div>
                      <div className="text-sm text-muted-foreground flex justify-between mt-1">
                        <span>{comp.marketRegion}</span>
                        <span>{comp.participants.length} participants</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-2">
                    No active competitions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Competition Details */}
          {competition && (
            <Card>
              <CardHeader>
                <CardTitle>Competition Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Market</span>
                    <span className="font-medium">{competition.marketRegion}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">{competition.startTime.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">End Date</span>
                    <span className="font-medium">{competition.endTime.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Initial Balance</span>
                    <span className="font-medium">${competition.initialBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Participants</span>
                    <span className="font-medium">{competition.participants.length}</span>
                  </div>
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/fantasy-grounds/competition/${competition.id}`)}
                >
                  View Competition
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
