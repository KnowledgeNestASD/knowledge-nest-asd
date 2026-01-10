import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { BookOpen, Heart, Clock, BookMarked, ArrowRight, Trash2, Star, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface BorrowedBook {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    cover_image_url: string | null;
  };
  borrowed_at: string;
  due_date: string;
  status: string;
}

interface FavoriteBook {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    cover_image_url: string | null;
    genre: { name: string } | null;
  };
}

interface ReadingListItem {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    cover_image_url: string | null;
    status: string;
  };
}

interface ChallengeProgress {
  id: string;
  progress: number;
  completed: boolean;
  challenge: {
    id: string;
    title: string;
    target_count: number | null;
    end_date: string;
    badge_name: string | null;
    badge_icon: string | null;
  };
}

interface UserBadge {
  id: string;
  badge_name: string;
  badge_icon: string | null;
  earned_at: string;
}

const MyBooks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const [readingList, setReadingList] = useState<ReadingListItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeProgress[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ booksRead: 0, challengesCompleted: 0, reviewsWritten: 0 });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    setIsLoading(true);

    // Fetch all user data in parallel
    const [borrowedRes, favsRes, readingRes, challengesRes, badgesRes, reviewsRes, completedBorrowsRes] = await Promise.all([
      supabase
        .from('borrowing_records')
        .select('id, borrowed_at, due_date, status, book:books(id, title, author, cover_image_url)')
        .eq('user_id', user.id)
        .eq('status', 'borrowed')
        .order('due_date', { ascending: true }),
      supabase
        .from('favorites')
        .select('id, book:books(id, title, author, cover_image_url, genre:genres(name))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('reading_list')
        .select('id, book:books(id, title, author, cover_image_url, status)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('challenge_participants')
        .select('id, progress, completed, challenge:challenges(id, title, target_count, end_date, badge_name, badge_icon)')
        .eq('user_id', user.id),
      supabase
        .from('user_badges')
        .select('id, badge_name, badge_icon, earned_at')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false }),
      supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'approved'),
      supabase
        .from('borrowing_records')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'returned'),
    ]);

    if (borrowedRes.data) setBorrowedBooks(borrowedRes.data as any);
    if (favsRes.data) setFavorites(favsRes.data as any);
    if (readingRes.data) setReadingList(readingRes.data as any);
    if (challengesRes.data) setChallenges(challengesRes.data as any);
    if (badgesRes.data) setBadges(badgesRes.data);
    
    setStats({
      booksRead: completedBorrowsRes.data?.length || 0,
      challengesCompleted: challengesRes.data?.filter((c: any) => c.completed).length || 0,
      reviewsWritten: reviewsRes.data?.length || 0,
    });

    setIsLoading(false);
  };

  const removeFavorite = async (favoriteId: string) => {
    const { error } = await supabase.from('favorites').delete().eq('id', favoriteId);
    if (!error) {
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({ title: 'Removed from favorites' });
    }
  };

  const removeFromReadingList = async (itemId: string) => {
    const { error } = await supabase.from('reading_list').delete().eq('id', itemId);
    if (!error) {
      setReadingList(prev => prev.filter(r => r.id !== itemId));
      toast({ title: 'Removed from reading list' });
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    return differenceInDays(new Date(dueDate), new Date());
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <BookOpen className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              My Books
            </h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your borrowed books, favorites, and reading history.
            </p>
            <Button onClick={() => navigate('/login')}>
              Sign In to Continue
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl mb-2">
            My Library
          </h1>
          <p className="text-muted-foreground">
            Manage your borrowed books, favorites, and reading journey
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-3 mb-8"
        >
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <p className="text-3xl font-bold text-primary">{stats.booksRead}</p>
            </div>
            <p className="text-sm text-muted-foreground">Books Read</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-accent-gold" />
              <p className="text-3xl font-bold text-accent-gold">{stats.challengesCompleted}</p>
            </div>
            <p className="text-sm text-muted-foreground">Challenges Completed</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-5 w-5 text-accent-orange" />
              <p className="text-3xl font-bold text-accent-orange">{stats.reviewsWritten}</p>
            </div>
            <p className="text-sm text-muted-foreground">Reviews Written</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="borrowed" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="borrowed" className="gap-2">
              <Clock className="h-4 w-4" />
              Borrowed ({borrowedBooks.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="reading-list" className="gap-2">
              <BookMarked className="h-4 w-4" />
              Reading List ({readingList.length})
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Trophy className="h-4 w-4" />
              Challenges ({challenges.length})
            </TabsTrigger>
          </TabsList>

          {/* Currently Borrowed */}
          <TabsContent value="borrowed">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />)}
              </div>
            ) : borrowedBooks.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {borrowedBooks.map((item, index) => {
                  const daysLeft = getDaysRemaining(item.due_date);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-xl p-4 shadow-sm border border-border/50 flex gap-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/book/${item.book.id}`)}
                    >
                      {item.book.cover_image_url ? (
                        <img src={item.book.cover_image_url} alt={item.book.title} className="w-16 h-24 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.book.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.book.author}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Due: {format(new Date(item.due_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge 
                        variant={daysLeft < 0 ? 'destructive' : daysLeft <= 3 ? 'default' : 'secondary'}
                        className="self-start"
                      >
                        {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due Today' : `${daysLeft} days left`}
                      </Badge>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="bg-muted/50 rounded-xl p-8 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No books currently borrowed</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/catalogue')}>
                  Browse Catalogue
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Favorites */}
          <TabsContent value="favorites">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />)}
              </div>
            ) : favorites.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {favorites.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl p-4 shadow-sm border border-border/50 flex gap-4"
                  >
                    <div 
                      className="cursor-pointer flex-1 flex gap-3"
                      onClick={() => navigate(`/book/${item.book.id}`)}
                    >
                      {item.book.cover_image_url ? (
                        <img src={item.book.cover_image_url} alt={item.book.title} className="w-14 h-20 object-cover rounded-lg" />
                      ) : (
                        <div className="w-14 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm line-clamp-2">{item.book.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.book.author}</p>
                        {item.book.genre && (
                          <Badge variant="secondary" className="mt-1 text-xs">{item.book.genre.name}</Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="self-start text-destructive hover:text-destructive"
                      onClick={() => removeFavorite(item.id)}
                    >
                      <Heart className="h-4 w-4 fill-destructive" />
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="bg-muted/50 rounded-xl p-8 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No favorite books yet</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/catalogue')}>
                  Find Books to Love
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Reading List */}
          <TabsContent value="reading-list">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}
              </div>
            ) : readingList.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {readingList.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl p-4 shadow-sm border border-border/50 flex items-center gap-4"
                  >
                    <div 
                      className="cursor-pointer flex-1 flex items-center gap-3"
                      onClick={() => navigate(`/book/${item.book.id}`)}
                    >
                      {item.book.cover_image_url ? (
                        <img src={item.book.cover_image_url} alt={item.book.title} className="w-12 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-16 bg-gradient-to-br from-primary to-primary/80 rounded flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{item.book.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.book.author}</p>
                      </div>
                    </div>
                    <Badge variant={item.book.status === 'available' ? 'default' : 'secondary'} className="text-xs">
                      {item.book.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeFromReadingList(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="bg-muted/50 rounded-xl p-8 text-center">
                <BookMarked className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Your reading list is empty</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/catalogue')}>
                  Add Books to Read
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Challenges */}
          <TabsContent value="challenges">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map(i => <div key={i} className="h-40 bg-card rounded-xl animate-pulse" />)}
              </div>
            ) : challenges.length > 0 ? (
              <div className="space-y-6">
                {/* Active Challenges */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Active Challenges</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {challenges.filter(c => !c.completed).map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-xl p-5 shadow-sm border border-border/50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-foreground">{item.challenge.title}</h4>
                          {item.challenge.badge_icon && (
                            <span className="text-2xl">{item.challenge.badge_icon}</span>
                          )}
                        </div>
                        {item.challenge.target_count && (
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{item.progress} / {item.challenge.target_count}</span>
                            </div>
                            <Progress value={(item.progress / item.challenge.target_count) * 100} className="h-2" />
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Ends: {format(new Date(item.challenge.end_date), 'MMM d, yyyy')}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Earned Badges */}
                {badges.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Earned Badges</h3>
                    <div className="flex flex-wrap gap-3">
                      {badges.map(badge => (
                        <div
                          key={badge.id}
                          className="flex items-center gap-2 bg-accent-gold/10 rounded-full px-4 py-2 border border-accent-gold/20"
                        >
                          {badge.badge_icon && <span className="text-lg">{badge.badge_icon}</span>}
                          <span className="text-sm font-medium text-accent-gold">{badge.badge_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-xl p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No challenges joined yet</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/challenges')}>
                  Browse Challenges
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyBooks;