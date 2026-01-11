import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Lightbulb, Send, Book, User, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface Suggestion {
  id: string;
  book_title: string;
  author: string | null;
  reason: string | null;
  status: 'pending' | 'reviewed' | 'approved' | 'acquired' | 'rejected';
  notes: string | null;
  created_at: string;
}

const statusConfig = {
  pending: { icon: Clock, color: 'bg-accent-gold/10 text-accent-gold', label: 'Pending Review' },
  reviewed: { icon: AlertCircle, color: 'bg-primary/10 text-primary', label: 'Under Review' },
  approved: { icon: CheckCircle2, color: 'bg-accent-green/10 text-accent-green', label: 'Approved' },
  acquired: { icon: CheckCircle2, color: 'bg-accent-green/10 text-accent-green', label: 'Acquired!' },
  rejected: { icon: XCircle, color: 'bg-destructive/10 text-destructive', label: 'Not Available' },
};

const Suggest = () => {
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mySuggestions, setMySuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchMySuggestions();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchMySuggestions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMySuggestions(data as Suggestion[]);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to suggest a book.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('suggestions').insert({
      user_id: user.id,
      book_title: bookTitle,
      author: author || null,
      reason: reason || null,
    });

    if (error) {
      toast({
        title: 'Submission failed',
        description: 'Unable to submit your suggestion. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Suggestion submitted!',
        description: 'Thank you for your book recommendation. Our librarians will review it.',
      });
      setBookTitle('');
      setAuthor('');
      setReason('');
      fetchMySuggestions();
    }

    setIsSubmitting(false);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <Lightbulb className="h-16 w-16 mx-auto text-accent-gold mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Suggest a Book
            </h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to suggest books for our library collection.
            </p>
            <Button onClick={() => navigate('/login')}>
              Sign In to Continue
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent-gold/20 mb-4">
              <Lightbulb className="h-8 w-8 text-accent-gold" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Suggest a Book
            </h1>
            <p className="text-muted-foreground">
              Help us grow our collection! Suggest books you'd like to see in the library.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 lg:p-8"
            >
              <h2 className="font-semibold text-lg mb-4">New Suggestion</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="book-title" className="flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    Book Title *
                  </Label>
                  <Input
                    id="book-title"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="Enter the book title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Author (optional)
                  </Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter the author's name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">
                    Why should we add this book? (optional)
                  </Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tell us why you think this would be a great addition..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Suggestion
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* My Suggestions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="font-semibold text-lg">My Suggestions ({mySuggestions.length})</h2>
              
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-xl bg-card animate-pulse" />
                  ))}
                </div>
              ) : mySuggestions.length === 0 ? (
                <div className="bg-muted/50 rounded-xl p-6 text-center">
                  <Lightbulb className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">
                    You haven't submitted any suggestions yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  <AnimatePresence>
                    {mySuggestions.map((suggestion, index) => {
                      const status = statusConfig[suggestion.status];
                      const StatusIcon = status.icon;
                      return (
                        <motion.div
                          key={suggestion.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-card rounded-xl p-4 border border-border/50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-foreground truncate">
                                {suggestion.book_title}
                              </h3>
                              {suggestion.author && (
                                <p className="text-sm text-muted-foreground">
                                  by {suggestion.author}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(suggestion.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Badge className={`${status.color} gap-1 shrink-0`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                          {suggestion.notes && (
                            <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                              <span className="font-medium">Librarian note:</span> {suggestion.notes}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>

          {/* Tips */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-muted/50 rounded-xl p-6"
          >
            <h3 className="font-semibold text-foreground mb-3">Tips for Great Suggestions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent-green">✓</span>
                <span>Check our catalogue first to make sure we don't already have the book</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-green">✓</span>
                <span>Suggest books that would benefit multiple students</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-green">✓</span>
                <span>Include the author's name if you know it</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-green">✓</span>
                <span>Explain why the book would be valuable for our school community</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Suggest;