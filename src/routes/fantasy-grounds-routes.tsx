import { RouteObject } from 'react-router-dom';
import FantasyGrounds from '@/pages/fantasy-grounds/FantasyGrounds';
import CompetitionView from '@/pages/fantasy-grounds/CompetitionView';
import CreateCompetition from '@/pages/fantasy-grounds/CreateCompetition';
import JoinCompetition from '@/pages/fantasy-grounds/JoinCompetition';
import Leaderboard from '@/pages/fantasy-grounds/Leaderboard';

export const fantasyGroundsRoutes: RouteObject[] = [
  {
    path: '/fantasy-grounds',
    element: <FantasyGrounds />
  },
  {
    path: '/fantasy-grounds/competition/:id',
    element: <CompetitionView />
  },
  {
    path: '/fantasy-grounds/create',
    element: <CreateCompetition />
  },
  {
    path: '/fantasy-grounds/join',
    element: <JoinCompetition />
  },
  {
    path: '/fantasy-grounds/leaderboard',
    element: <Leaderboard />
  },
  {
    path: '/fantasy-grounds/leaderboard/:id',
    element: <Leaderboard />
  }
];
