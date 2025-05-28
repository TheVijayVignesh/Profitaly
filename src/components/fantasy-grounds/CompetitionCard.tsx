import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Competition } from '@/types/fantasy-grounds';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Globe, 
  Users, 
  ArrowRight 
} from 'lucide-react';

interface CompetitionCardProps {
  competition: Competition;
  status: 'active' | 'upcoming' | 'past';
  onClick: () => void;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ 
  competition, 
  status, 
  onClick 
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Upcoming</Badge>;
      case 'past':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Completed</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTimeRemaining = () => {
    const now = new Date();
    
    if (status === 'upcoming') {
      const diffMs = competition.startTime.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        return `Starts in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
      } else {
        return `Starts in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
      }
    } else if (status === 'active') {
      const diffMs = competition.endTime.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        return `Ends in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
      } else {
        return `Ends in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
      }
    } else {
      return 'Completed';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{competition.title}</CardTitle>
            <CardDescription>
              {competition.description || `${competition.marketRegion} Market Competition`}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> Start Date
            </span>
            <span className="font-medium">
              {formatDate(competition.startTime)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(competition.startTime)}
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> End Date
            </span>
            <span className="font-medium">
              {formatDate(competition.endTime)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(competition.endTime)}
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground flex items-center">
              <DollarSign className="h-4 w-4 mr-1" /> Initial Balance
            </span>
            <span className="font-medium">
              ${competition.initialBalance.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground flex items-center">
              <Globe className="h-4 w-4 mr-1" /> Market
            </span>
            <span className="font-medium">
              {competition.marketRegion}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {competition.participants.length} {competition.participants.length === 1 ? 'participant' : 'participants'}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{getTimeRemaining()}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onClick}
          variant={status === 'active' ? 'default' : 'outline'}
        >
          {status === 'active' 
            ? 'Enter Competition' 
            : status === 'upcoming' 
              ? 'View Details' 
              : 'View Results'
          }
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompetitionCard;
