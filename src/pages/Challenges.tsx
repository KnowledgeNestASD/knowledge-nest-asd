import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Trophy, Target, BookOpen, Users, Clock, ArrowRight, Check, Loader2 } from 'lucide-react';
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

interface Participation {
  challenge_id: string;
  progress: number;
  completed: boolean;
}

const challengeTypeConfig: Record<string, { icon: typeof Trophy; label: string; color: string; bgColor: string }> = {
  book_count: { icon: Target, label: 'Book Count', color: 'text-accent-orange', bgColor: 'bg-accent-orange/10' },
  genre_exploration: { icon: BookOpen, label: 'Genre Explorer', color: 'text-primary', bgColor: 'bg-primary/10' },
  time_based: { icon: Clock, label: 'Time Challenge', color: 'text-accent-gold', bgColor: 'bg-accent-gold/10' },
  class_competition: { icon: Users, label: 'Class Competition', color: 'text-accent-green', bgColor: 'bg-accent-green/10' },
  house_competition: { icon: Trophy, label: 'House Competition', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const Challenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [participations, setParticipations] = useState<Map<string, Participation>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({ total: 0, participants: 0, booksRead: 0 });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenges();
    if (user) {
      fetchParticipations();
    }
  }, [user]);

  const fetchChallenges = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('status', 'active')
      .order('end_date', { ascending: true });

    if (!error && data) {
      setChallenges(data);
      setStats(prev => ({ ...prev, total: data.length }));
    }
    
    // Fetch participant count
    const { count: participantCount } = await supabase
      .from('challenge_participants')
      .select('user_id', { count: 'exact', head: true });
    
    setStats(prev => ({ ...prev, participants: participantCount || 0 }));
    
    setIsLoading(false);
  };

  const fetchParticipations = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('challenge_participants')
      .select('challenge_id, progress, completed')
      .eq('user_id', user.id);
    
    if (data) {
      const map = new Map<string, Participation>();
      data.forEach(p => map.set(p.challenge_id, p));
      setParticipations(map);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to join reading challenges.',
        variant: 'destructive',
      });
      return;
    }

    setJoiningId(challengeId);
    
    const { error } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        user_id: user.id,
        progress: 0,
        completed: false,
      });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: 'Already joined',
          description: 'You have already joined this challenge.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to join challenge. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      setParticipations(prev => {
        const next = new Map(prev);
        next.set(challengeId, { challenge_id: challengeId, progress: 0, completed: false });
        return next;
      });
      toast({
        title: 'Challenge joined!',
        description: 'You have successfully joined this reading challenge. Start reading to make progress!',
      });
    }
    
    setJoiningId(null);
  };

  const filteredChallenges = activeTab === 'all' 
    ? challenges 
    : challenges.filter(c => c.challenge_type === activeTab);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -4, transition: { duration: 0.2 } }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
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
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-orange/10">
                <Target className="h-5 w-5 text-accent-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
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
                <p className="text-2xl font-bold text-foreground">{participations.size}</p>
                <p className="text-sm text-muted-foreground">My Challenges</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-green/10">
                <Users className="h-5 w-5 text-accent-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.participants}+</p>
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
                <p className="text-2xl font-bold text-foreground">
                  {Array.from(participations.values()).filter(p => p.completed).length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
            <TabsTrigger value="book_count" className="text-sm">Book Count</TabsTrigger>
            <TabsTrigger value="genre_exploration" className="text-sm">Genre</TabsTrigger>
            <TabsTrigger value="time_based" className="text-sm">Time-Based</TabsTrigger>
            <TabsTrigger value="class_competition" className="text-sm">Class</TabsTrigger>
            <TabsTrigger value="house_competition" className="text-sm">House</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Challenges Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-xl bg-card animate-pulse" />
              ))}
            </motion.div>
          ) : filteredChallenges.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <Trophy className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No challenges found</h3>
              <p className="text-muted-foreground">
                Check back soon for new reading challenges!
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredChallenges.map((challenge, index) => {
                const config = challengeTypeConfig[challenge.challenge_type] || challengeTypeConfig.book_count;
                const Icon = config.icon;
                const daysRemaining = getDaysRemaining(challenge.end_date);
                const participation = participations.get(challenge.id);
                const isJoined = !!participation;
                const progress = participation?.progress || 0;
                const progressPercent = challenge.target_count 
                  ? Math.min(100, (progress / challenge.target_count) * 100) 
                  : 0;

                return (
                  <motion.div
                    key={challenge.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={cn(
                      "bg-card rounded-xl shadow-sm border overflow-hidden",
                      isJoined ? "border-primary/30" : "border-border/50"
                    )}
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
                        <div className="flex items-center gap-2">
                          {isJoined && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-0 gap-1">
                              <Check className="h-3 w-3" />
                              Joined
                            </Badge>
                          )}
                          {challenge.badge_icon && (
                            <span className="text-2xl">{challenge.badge_icon}</span>
                          )}
                        </div>
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

                      {/* Progress */}
                      {challenge.target_count && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress} / {challenge.target_count}</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
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
                          <Badge variant="secondary" className="text-xs bg-accent-gold/10 text-accent-gold border-0">
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
                        {!isJoined ? (
                          <Button 
                            size="sm" 
                            className="gap-1"
                            disabled={joiningId === challenge.id}
                            onClick={() => handleJoinChallenge(challenge.id)}
                          >
                            {joiningId === challenge.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                Join
                                <ArrowRight className="h-3 w-3" />
                              </>
                            )}
                          </Button>
                        ) : participation?.completed ? (
                          <Badge className="bg-accent-green text-accent-green-foreground">
                            ✓ Completed!
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {Math.round(progressPercent)}% Complete
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Challenges;