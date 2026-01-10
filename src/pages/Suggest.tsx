import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Lightbulb, Send, Book, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Suggest = () => {
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent-gold/20 mb-4">
              <Lightbulb className="h-8 w-8 text-accent-gold" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Suggest a Book
            </h1>
            <p className="text-muted-foreground">
              Help us grow our collection! Suggest books you'd like to see in the library.
            </p>
          </div>

          {/* Form */}
          <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 lg:p-8">
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
                  placeholder="Tell us why you think this would be a great addition to our library..."
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
          </div>

          {/* Tips */}
          <div className="mt-8 bg-muted/50 rounded-xl p-6">
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Suggest;
