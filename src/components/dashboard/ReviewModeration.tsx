import { useState, useEffect } from 'react';
import { MessageSquare, Check, X, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  book_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  book?: { title: string; author: string };
  profile?: { full_name: string; class_name: string | null };
}

export function ReviewModeration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setIsLoading(true);
    
    let query = supabase
      .from('reviews')
      .select('*, book:books(title, author)')
      .order('created_at', { ascending: false });

    if (filter === 'pending') {
      query = query.eq('status', 'pending');
    }

    const { data, error } = await query.limit(50);

    if (!error && data) {
      // Fetch profile data
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, class_name')
        .in('user_id', userIds);

      const reviewsWithProfiles = data.map(review => ({
        ...review,
        profile: profiles?.find(p => p.user_id === review.user_id),
      }));

      setReviews(reviewsWithProfiles);
    }
    setIsLoading(false);
  };

  const handleModerate = async (reviewId: string, action: 'approved' | 'rejected') => {
    if (!user) return;

    const { error } = await supabase
      .from('reviews')
      .update({
        status: action,
        moderated_by: user.id,
        moderated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} review`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: action === 'approved' ? 'Review Approved' : 'Review Rejected',
        description: `The review has been ${action}`,
      });
      setReviews(reviews.filter(r => r.id !== reviewId));
    }
  };

  const handleBulkApprove = async () => {
    if (!user) return;
    
    const pendingIds = reviews.filter(r => r.status === 'pending').map(r => r.id);
    if (pendingIds.length === 0) return;

    const { error } = await supabase
      .from('reviews')
      .update({
        status: 'approved',
        moderated_by: user.id,
        moderated_at: new Date().toISOString(),
      })
      .in('id', pendingIds);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve reviews',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Reviews Approved',
        description: `${pendingIds.length} reviews have been approved`,
      });
      fetchReviews();
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'h-4 w-4',
              star <= rating
                ? 'fill-accent-gold text-accent-gold'
                : 'text-muted-foreground/30'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Reviews
          </Button>
        </div>
        {filter === 'pending' && reviews.length > 0 && (
          <Button size="sm" onClick={handleBulkApprove} className="gap-2">
            <Check className="h-4 w-4" />
            Approve All ({reviews.length})
          </Button>
        )}
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            {filter === 'pending' ? 'No pending reviews' : 'No reviews found'}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl p-5 shadow-sm border border-border/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Book Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {review.book?.title || 'Unknown Book'}
                      </h3>
                      <Badge
                        variant={
                          review.status === 'approved'
                            ? 'default'
                            : review.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {review.status}
                      </Badge>
                    </div>
                    
                    {/* Rating */}
                    <div className="mb-3">
                      {renderStars(review.rating)}
                    </div>

                    {/* Review Text */}
                    {review.review_text && (
                      <p className="text-muted-foreground text-sm mb-3">
                        "{review.review_text}"
                      </p>
                    )}

                    {/* Reviewer Info */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">
                        {review.profile?.full_name || 'Anonymous'}
                      </span>
                      {review.profile?.class_name && (
                        <>
                          <span>•</span>
                          <span>{review.profile.class_name}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {review.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 text-accent-green hover:bg-accent-green/10 hover:text-accent-green"
                        onClick={() => handleModerate(review.id, 'approved')}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleModerate(review.id, 'rejected')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
