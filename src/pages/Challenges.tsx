import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Trophy, Target, BookOpen, Users, Clock, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_count: number | null;
  start_date: string;
  end_date: string;
  status: string;
  badge_name: string | null;
  badge_icon: string | null;
  target_class: string | null;
  target_house: string | null;
}

const challengeTypeConfig: Record<string, { icon: typeof Trophy; label: string; color: string; bgColor: string }> = {
  book_count: { icon: Target, label: 'Book Count', color: 'text-accent-orange', bgColor: 'bg-accent-orange/10' },
  genre_exploration: { icon: BookOpen, label: 'Genre Explorer', color: 'text-primary', bgColor: 'bg-primary/10' },
  time_based: { icon: Clock, label: 'Time Challenge', color: 'text-accent-gold', bgColor: 'bg-accent-gold/10' },
  class_competition: { icon: Users, label: 'Class Competition', color: 'text-accent-green', bgColor: 'bg-accent-green/10' },
  house_competition: { icon: Trophy, label: 'House Competition', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

const placeholderChallenges: Challenge[] = [
  {
    id: '1',
    title: 'January Reading Marathon',
    description: 'Read 10 books this month to earn the Marathon Reader badge! This challenge is open to all students.',
    challenge_type: 'book_count',
    target_count: 10,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    badge_name: 'Marathon Reader',
    badge_icon: '🏃',
    target_class: null,
    target_house: null,
  },
  {
    id: '2',
    title: 'Genre Explorer',
    description: 'Read books from 5 different genres to become a true explorer! Branch out and discover new worlds.',
    challenge_type: 'genre_exploration',
    target_count: 5,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    badge_name: 'Genre Explorer',
    badge_icon: '🗺️',
    target_class: null,
    target_house: null,
  },
  {
    id: '3',
    title: 'House Reading Competition',
    description: 'Which house will read the most books this term? Earn points for your house with every book you complete!',
    challenge_type: 'house_competition',
    target_count: 100,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    badge_name: 'House Champion',
    badge_icon: '🏆',
    target_class: null,
    target_house: null,
  },
  {
    id: '4',
    title: 'Science Fiction Sprint',
    description: 'Read 3 science fiction books in the next two weeks. Explore the future through literature!',
    challenge_type: 'time_based',
    target_count: 3,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    badge_name: 'Sci-Fi Reader',
    badge_icon: '🚀',
    target_class: null,
    target_house: null,
  },
  {
    id: '5',
    title: 'Grade 8 Reading Race',
    description: 'A special challenge for Grade 8 students. Who will be the top reader this month?',
    challenge_type: 'class_competition',
    target_count: 50,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    badge_name: 'Grade Champion',
    badge_icon: '🎯',
    target_class: 'Grade 8',
    target_house: null,
  },
];

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const Challenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('status', 'active')
        .order('end_date', { ascending: true });

      if (!error && data && data.length > 0) {
        setChallenges(data);
      }
      
      setIsLoading(false);
    };

    fetchChallenges();
  }, []);

  const displayChallenges = challenges.length > 0 ? challenges : placeholderChallenges;

  const filteredChallenges = activeTab === 'all' 
    ? displayChallenges 
    : displayChallenges.filter(c => c.challenge_type === activeTab);

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to join reading challenges.',
        variant: 'destructive',
      });
      return;
    }

    // For now, just show a toast - we'll implement full participation later
    toast({
      title: 'Challenge joined!',
      description: 'You have successfully joined this reading challenge. Start reading to make progress!',
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-accent-gold" />
            <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
              Reading Challenges
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Join exciting reading challenges, track your progress, and earn badges! 
            Complete challenges to become a star reader.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-orange/10">
                <Target className="h-5 w-5 text-accent-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{displayChallenges.length}</p>
                <p className="text-sm text-muted-foreground">Active Challenges</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-gold/10">
                <Trophy className="h-5 w-5 text-accent-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-sm text-muted-foreground">Badges to Earn</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-green/10">
                <Users className="h-5 w-5 text-accent-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">120+</p>
                <p className="text-sm text-muted-foreground">Participants</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">350+</p>
                <p className="text-sm text-muted-foreground">Books Read</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="book_count">Book Count</TabsTrigger>
            <TabsTrigger value="genre_exploration">Genre</TabsTrigger>
            <TabsTrigger value="time_based">Time-Based</TabsTrigger>
            <TabsTrigger value="class_competition">Class</TabsTrigger>
            <TabsTrigger value="house_competition">House</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Challenges Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredChallenges.map((challenge) => {
              const config = challengeTypeConfig[challenge.challenge_type] || challengeTypeConfig.book_count;
              const Icon = config.icon;
              const daysRemaining = getDaysRemaining(challenge.end_date);

              return (
                <div
                  key={challenge.id}
                  className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Header */}
                  <div className={cn('p-4', config.bgColor)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('h-5 w-5', config.color)} />
                        <span className={cn('text-sm font-medium', config.color)}>
                          {config.label}
                        </span>
                      </div>
                      {challenge.badge_icon && (
                        <span className="text-2xl">{challenge.badge_icon}</span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {challenge.description}
                    </p>

                    {/* Target */}
                    {challenge.target_count && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">0 / {challenge.target_count}</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {challenge.target_class && (
                        <Badge variant="secondary" className="text-xs">
                          {challenge.target_class}
                        </Badge>
                      )}
                      {challenge.target_house && (
                        <Badge variant="secondary" className="text-xs">
                          {challenge.target_house}
                        </Badge>
                      )}
                      {challenge.badge_name && (
                        <Badge variant="secondary" className="text-xs bg-accent-gold/10 text-accent-gold">
                          🏅 {challenge.badge_name}
                        </Badge>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{daysRemaining} days left</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="gap-1"
                        onClick={() => handleJoinChallenge(challenge.id)}
                      >
                        Join
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredChallenges.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Trophy className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No challenges found</h3>
            <p className="text-muted-foreground">
              Check back soon for new reading challenges!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Challenges;
