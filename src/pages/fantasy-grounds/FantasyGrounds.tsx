import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Calendar, Plus, TrendingUp } from 'lucide-react';

const FantasyGrounds = () => {
  const navigate = useNavigate();

  // Mock competitions data
  const mockCompetitions = [
    {
      id: '1',
      title: 'Monthly Stock Challenge',
      description: 'Compete with other traders in a month-long stock trading competition.',
      participants: 42,
      prize: '$1,000',
      endDate: '2024-12-31',
      status: 'active'
    },
    {
      id: '2',
      title: 'Tech Sector Battle',
      description: 'Focus on technology stocks and see who can outperform the market.',
      participants: 28,
      prize: '$500',
      endDate: '2024-12-15',
      status: 'upcoming'
    }
  ];

  return (
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
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Active Competitions</h2>
            <Button onClick={() => navigate('/fantasy-grounds/create')}>
              <Plus className="mr-2 h-4 w-4" /> Create Competition
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {mockCompetitions.map(competition => (
              <Card key={competition.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/fantasy-grounds/competition/${competition.id}`)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{competition.title}</CardTitle>
                      <CardDescription>{competition.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">{competition.prize} Prize</div>
                      <div className="text-xs text-muted-foreground">{competition.participants} participants</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      Ends {new Date(competition.endDate).toLocaleDateString()}
                    </div>
                    <Button variant="outline" size="sm">
                      Join Competition
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {mockCompetitions.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    No active competitions at the moment.
                  </p>
                  <Button onClick={() => navigate('/fantasy-grounds/create')}>
                    Create Competition
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Leaderboard
              </CardTitle>
              <CardDescription>
                Top performers this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Demo Trader</p>
                      <p className="text-sm text-muted-foreground">+24.5% return</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">$12,450</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Stock Master</p>
                      <p className="text-sm text-muted-foreground">+18.2% return</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">$11,820</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Market Pro</p>
                      <p className="text-sm text-muted-foreground">+15.7% return</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">$10,950</div>
                </div>
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
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>
                Platform overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="text-sm font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Competitions</span>
                  <span className="text-sm font-medium">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Prize Pool</span>
                  <span className="text-sm font-medium">$25,000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FantasyGrounds;
