import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Target, BookOpen, Users, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_count: number | null;
  end_date: string;
  badge_name: string | null;
  badge_icon: string | null;
}

interface ChallengesPreviewProps {
  challenges?: Challenge[];
  isLoading?: boolean;
}

const challengeTypeConfig: Record<string, { icon: typeof Trophy; color: string; bgColor: string }> = {
  book_count: { icon: Target, color: 'text-accent-orange', bgColor: 'bg-accent-orange/10' },
  genre_exploration: { icon: BookOpen, color: 'text-primary', bgColor: 'bg-primary/10' },
  time_based: { icon: Clock, color: 'text-accent-gold', bgColor: 'bg-accent-gold/10' },
  class_competition: { icon: Users, color: 'text-accent-green', bgColor: 'bg-accent-green/10' },
  house_competition: { icon: Trophy, color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

// Placeholder challenges for demo
const placeholderChallenges: Challenge[] = [
  {
    id: '1',
    title: 'January Reading Marathon',
    description: 'Read 10 books this month to earn the Marathon Reader badge!',
    challenge_type: 'book_count',
    target_count: 10,
    end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    badge_name: 'Marathon Reader',
    badge_icon: '🏃',
  },
  {
    id: '2',
    title: 'Genre Explorer',
    description: 'Read books from 5 different genres to become a true explorer!',
    challenge_type: 'genre_exploration',
    target_count: 5,
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    badge_name: 'Genre Explorer',
    badge_icon: '🗺️',
  },
  {
    id: '3',
    title: 'House Reading Competition',
    description: 'Which house will read the most books this term?',
    challenge_type: 'house_competition',
    target_count: 100,
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    badge_name: 'House Champion',
    badge_icon: '🏆',
  },
];

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ChallengesPreview({ challenges, isLoading }: ChallengesPreviewProps) {
  const displayChallenges = challenges?.length ? challenges : placeholderChallenges;
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const handleJoin = async (challengeId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to join reading challenges.',
        variant: 'destructive',
      });
      navigate('/login');
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
          title: 'Already joined!',
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
      toast({
        title: 'Challenge joined!',
        description: 'You have successfully joined this reading challenge!',
      });
    }
    
    setJoiningId(null);
  };

  return (
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-accent-gold" />
              <h2 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
                Reading Challenges
              </h2>
            </div>
            <p className="text-muted-foreground">
              Join exciting challenges and earn badges!
            </p>
          </div>
          <Link to="/challenges">
            <Button variant="outline" className="gap-2">
              View All Challenges
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Challenges Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {displayChallenges.slice(0, 3).map((challenge) => {
              const config = challengeTypeConfig[challenge.challenge_type] || challengeTypeConfig.book_count;
              const Icon = config.icon;
              const daysRemaining = getDaysRemaining(challenge.end_date);

              return (
                <motion.div
                  key={challenge.id}
                  variants={cardVariants}
                  whileHover={{ y: -4 }}
                  className="challenge-card bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-border/50"
                >
                  {/* Badge Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn('rounded-lg p-3', config.bgColor)}>
                      <Icon className={cn('h-6 w-6', config.color)} />
                    </div>
                    {challenge.badge_icon && (
                      <motion.span 
                        className="text-2xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        {challenge.badge_icon}
                      </motion.span>
                    )}
                  </div>

                  {/* Challenge Info */}
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {challenge.description}
                  </p>

                  {/* Target */}
                  {challenge.target_count && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Target</span>
                        <span className="font-medium">{challenge.target_count} books</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {daysRemaining} days left
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="gap-1"
                      disabled={joiningId === challenge.id}
                      onClick={() => handleJoin(challenge.id)}
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
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}