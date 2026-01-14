import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { 
  BookOpen, Heart, Clock, Trophy, Star, Target, Award, 
  ArrowRight, TrendingUp, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/ui/stat-card';
import { AnimatedCard, AnimatedList, AnimatedListItem } from '@/components/ui/animated-container';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const StudentDashboard = () => {
  const { user, profile, isTeacher, isLibrarian } = useAuth();
  const navigate = useNavigate();

  // Role-based redirect: Teachers and Librarians should not see the student dashboard
  useEffect(() => {
    if (isLibrarian) {
      navigate('/dashboard', { replace: true });
    } else if (isTeacher) {
      navigate('/teacher-dashboard', { replace: true });
    }
  }, [isLibrarian, isTeacher, navigate]);
  const [stats, setStats] = useState({ borrowed: 0, favorites: 0, challenges: 0, badges: 0 });
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);

    const [borrowedRes, favoritesRes, challengesRes, badgesRes] = await Promise.all([
      supabase.from('borrowing_records').select('*, book:books(title, author, cover_image_url)').eq('user_id', user.id).in('status', ['borrowed', 'overdue']).limit(5),
      supabase.from('favorites').select('id').eq('user_id', user.id),
      supabase.from('challenge_participants').select('*, challenge:challenges(*)').eq('user_id', user.id).eq('completed', false).limit(1),
      supabase.from('user_badges').select('id').eq('user_id', user.id),
    ]);

    setStats({
      borrowed: borrowedRes.data?.length || 0,
      favorites: favoritesRes.data?.length || 0,
      challenges: challengesRes.data?.length || 0,
      badges: badgesRes.data?.length || 0,
    });

    setBorrowedBooks(borrowedRes.data || []);
    if (challengesRes.data?.[0]) setActiveChallenge(challengesRes.data[0]);
    setIsLoading(false);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground mb-6">Sign in to view your reading progress</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </Layout>
    );
  }

  const getDaysLeft = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Reader'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">Track your reading journey</p>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Borrowed" value={stats.borrowed} icon={BookOpen} iconColor="text-primary" iconBg="bg-primary/10" delay={0} />
          <StatCard title="Favorites" value={stats.favorites} icon={Heart} iconColor="text-destructive" iconBg="bg-destructive/10" delay={0.1} />
          <StatCard title="Challenges" value={stats.challenges} icon={Trophy} iconColor="text-accent-gold" iconBg="bg-accent-gold/10" delay={0.2} />
          <StatCard title="Badges" value={stats.badges} icon={Award} iconColor="text-accent-green" iconBg="bg-accent-green/10" delay={0.3} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Borrowed Books */}
          <AnimatedCard delay={0.2} className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent-orange" /> Borrowed Books
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/my-books')}>View All</Button>
            </div>
            {borrowedBooks.length > 0 ? (
              <AnimatedList className="space-y-3">
                {borrowedBooks.map((record) => {
                  const daysLeft = getDaysLeft(record.due_date);
                  return (
                    <AnimatedListItem key={record.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{record.book?.title}</p>
                        <p className="text-xs text-muted-foreground">{record.book?.author}</p>
                      </div>
                      <Badge variant={daysLeft <= 0 ? 'destructive' : daysLeft <= 3 ? 'default' : 'secondary'}>
                        {daysLeft <= 0 ? 'Overdue' : `${daysLeft}d left`}
                      </Badge>
                    </AnimatedListItem>
                  );
                })}
              </AnimatedList>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No books borrowed</p>
                <Button variant="link" onClick={() => navigate('/catalogue')}>Browse Catalogue</Button>
              </div>
            )}
          </AnimatedCard>

          {/* Active Challenge */}
          <AnimatedCard delay={0.3} className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-accent-gold" /> Active Challenge
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/challenges')}>All Challenges</Button>
            </div>
            {activeChallenge ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{activeChallenge.challenge?.badge_icon || '🏆'}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{activeChallenge.challenge?.title}</h3>
                    <p className="text-sm text-muted-foreground">{activeChallenge.challenge?.description}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span className="font-medium">{activeChallenge.progress} / {activeChallenge.challenge?.target_count || 10}</span>
                  </div>
                  <Progress value={(activeChallenge.progress / (activeChallenge.challenge?.target_count || 10)) * 100} className="h-2" />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No active challenges</p>
                <Button variant="link" onClick={() => navigate('/challenges')}>Join a Challenge</Button>
              </div>
            )}
          </AnimatedCard>
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Browse Books', icon: BookOpen, href: '/catalogue', color: 'text-primary' },
            { label: 'My Library', icon: Heart, href: '/my-books', color: 'text-destructive' },
            { label: 'Challenges', icon: Trophy, href: '/challenges', color: 'text-accent-gold' },
          ].map((action) => (
            <Button key={action.label} variant="outline" className="h-auto py-4 justify-start gap-3" onClick={() => navigate(action.href)}>
              <action.icon className={cn('h-5 w-5', action.color)} />
              <span>{action.label}</span>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          ))}
        </motion.div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
