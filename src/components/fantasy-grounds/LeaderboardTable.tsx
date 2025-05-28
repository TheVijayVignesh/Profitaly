import React, { useState, useEffect } from 'react';
import { auth } from '@/firebase/config';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Participant } from '@/types/fantasy-grounds';
import { getLeaderboard } from '@/services/fantasy-grounds/competitionService';
import { ArrowUp, ArrowDown, Trophy, Medal } from 'lucide-react';

interface LeaderboardTableProps {
  competitionId: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ competitionId }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const leaderboardData = await getLeaderboard(competitionId);
        setParticipants(leaderboardData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
    
    // Set up interval to refresh leaderboard data every minute
    const intervalId = setInterval(fetchLeaderboard, 60000);
    
    return () => clearInterval(intervalId);
  }, [competitionId]);

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
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            Competition rankings based on portfolio value
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <p className="text-muted-foreground text-center">
            No participants have joined this competition yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>
          Competition rankings based on portfolio value
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default LeaderboardTable;
