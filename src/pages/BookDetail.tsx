import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { 
  BookOpen, Heart, Star, ArrowLeft, Share2, BookMarked, 
  Calendar, Building, Hash, FileText, Edit, Trash2, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLibrarian } = useAuth();
  const { toast } = useToast();
  const [book, setBook] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInReadingList, setIsInReadingList] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const fetchBookDetails = async () => {
    setIsLoading(true);
    
    // Fetch book
    const { data: bookData, error } = await supabase
      .from('books')
      .select('*, category:categories(name), genre:genres(name, id)')
      .eq('id', id)
      .single();

    if (error || !bookData) {
      navigate('/catalogue');
      return;
    }

    setBook(bookData);

    // Fetch reviews
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, profile:profiles(full_name, avatar_url)')
      .eq('book_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10);

    if (reviewsData) setReviews(reviewsData);

    // Fetch related books (same genre)
    if (bookData.genre_id) {
      const { data: relatedData } = await supabase
        .from('books')
        .select('id, title, author, cover_image_url')
        .eq('genre_id', bookData.genre_id)
        .neq('id', id)
        .limit(4);

      if (relatedData) setRelatedBooks(relatedData);
    }

    // Check if user has favorited/added to list
    if (user) {
      const [favRes, listRes] = await Promise.all([
        supabase.from('favorites').select('id').eq('user_id', user.id).eq('book_id', id).maybeSingle(),
        supabase.from('reading_list').select('id').eq('user_id', user.id).eq('book_id', id).maybeSingle(),
      ]);
      setIsFavorite(!!favRes.data);
      setIsInReadingList(!!listRes.data);
    }

    setIsLoading(false);
  };

  const toggleFavorite = async () => {
    if (!user || !book) return;
    
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('book_id', book.id);
      toast({ title: 'Removed from favorites' });
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, book_id: book.id });
      toast({ title: 'Added to favorites' });
    }
    setIsFavorite(!isFavorite);
  };

  const toggleReadingList = async () => {
    if (!user || !book) return;
    
    if (isInReadingList) {
      await supabase.from('reading_list').delete().eq('user_id', user.id).eq('book_id', book.id);
      toast({ title: 'Removed from reading list' });
    } else {
      await supabase.from('reading_list').insert({ user_id: user.id, book_id: book.id });
      toast({ title: 'Added to reading list' });
    }
    setIsInReadingList(!isInReadingList);
  };

  const submitReview = async () => {
    if (!user || !book || reviewRating === 0) return;
    
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      book_id: book.id,
      rating: reviewRating,
      review_text: reviewText || null,
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    } else {
      toast({ title: 'Review Submitted', description: 'Your review is pending approval' });
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewText('');
    }
    setSubmittingReview(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-accent-green/10 text-accent-green';
      case 'issued': return 'bg-accent-orange/10 text-accent-orange';
      case 'reserved': return 'bg-accent-gold/10 text-accent-gold';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="grid lg:grid-cols-[300px_1fr] gap-8">
              <div className="h-[450px] bg-muted rounded-xl" />
              <div className="space-y-4">
                <div className="h-10 w-3/4 bg-muted rounded" />
                <div className="h-6 w-1/2 bg-muted rounded" />
                <div className="h-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!book) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Catalogue
          </Button>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Book Cover */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="sticky top-24">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full rounded-xl shadow-xl object-cover aspect-[2/3]"
                />
              ) : (
                <div className="w-full aspect-[2/3] rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
                  <div className="text-center text-primary-foreground p-6">
                    <BookOpen className="mx-auto h-16 w-16 mb-4" />
                    <p className="font-display text-xl font-bold">{book.title}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button 
                  variant={isFavorite ? 'default' : 'outline'} 
                  onClick={toggleFavorite}
                  disabled={!user}
                  className="gap-2"
                >
                  <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
                <Button 
                  variant={isInReadingList ? 'default' : 'outline'} 
                  onClick={toggleReadingList}
                  disabled={!user}
                  className="gap-2"
                >
                  <BookMarked className="h-4 w-4" />
                  {isInReadingList ? 'In List' : 'Add to List'}
                </Button>
              </div>

              {isLibrarian && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Edit className="h-4 w-4" />Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 text-destructive">
                    <Trash2 className="h-4 w-4" />Delete
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Book Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {book.genre && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {book.genre.name}
                    </Badge>
                  )}
                  <Badge className={getStatusColor(book.status)}>
                    {book.status}
                  </Badge>
                </div>
                
                <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl mb-2">
                  {book.title}
                </h1>
                
                <p className="text-xl text-muted-foreground">
                  by <span className="font-medium text-foreground">{book.author}</span>
                </p>

                {avgRating && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={cn(
                            'h-5 w-5',
                            star <= Math.round(Number(avgRating)) 
                              ? 'text-accent-gold fill-accent-gold' 
                              : 'text-muted-foreground/30'
                          )} 
                        />
                      ))}
                    </div>
                    <span className="font-medium">{avgRating}</span>
                    <span className="text-muted-foreground">({reviews.length} reviews)</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Description */}
              {book.description && (
                <div>
                  <h2 className="font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">{book.description}</p>
                </div>
              )}

              {/* Book Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {book.publication_year && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Published</p>
                    <p className="font-medium">{book.publication_year}</p>
                  </div>
                )}
                {book.publisher && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <Building className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Publisher</p>
                    <p className="font-medium truncate">{book.publisher}</p>
                  </div>
                )}
                {book.isbn && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <Hash className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">ISBN</p>
                    <p className="font-medium text-sm">{book.isbn}</p>
                  </div>
                )}
                {book.page_count && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <FileText className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Pages</p>
                    <p className="font-medium">{book.page_count}</p>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="bg-card rounded-xl p-4 border">
                <h3 className="font-semibold mb-2">Availability</h3>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {book.available_copies} of {book.total_copies} copies available
                  </span>
                  <Badge className={getStatusColor(book.status)}>
                    {book.available_copies > 0 ? 'Available' : 'All Borrowed'}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Reviews Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-semibold">Reviews</h2>
                  {user && !showReviewForm && (
                    <Button variant="outline" size="sm" onClick={() => setShowReviewForm(true)}>
                      Write Review
                    </Button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-muted/50 rounded-xl p-4 mb-4"
                  >
                    <h3 className="font-medium mb-3">Write Your Review</h3>
                    <div className="mb-3">
                      <label className="text-sm text-muted-foreground mb-2 block">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star 
                              className={cn(
                                'h-6 w-6',
                                star <= reviewRating 
                                  ? 'text-accent-gold fill-accent-gold' 
                                  : 'text-muted-foreground/30'
                              )} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      placeholder="Share your thoughts about this book..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="mb-3"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={submitReview} disabled={reviewRating === 0 || submittingReview}>
                        <Check className="h-4 w-4 mr-1" />Submit
                      </Button>
                      <Button variant="ghost" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                              {review.profile?.full_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{review.profile?.full_name || 'Anonymous'}</p>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={cn(
                                      'h-3 w-3',
                                      star <= review.rating 
                                        ? 'text-accent-gold fill-accent-gold' 
                                        : 'text-muted-foreground/30'
                                    )} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        {review.review_text && (
                          <p className="text-sm text-muted-foreground">{review.review_text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </div>

              {/* Related Books */}
              {relatedBooks.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h2 className="font-display text-xl font-semibold mb-4">Similar Books</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {relatedBooks.map((related) => (
                        <Link key={related.id} to={`/book/${related.id}`} className="group">
                          {related.cover_image_url ? (
                            <img
                              src={related.cover_image_url}
                              alt={related.title}
                              className="w-full aspect-[2/3] object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                            />
                          ) : (
                            <div className="w-full aspect-[2/3] rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                              <BookOpen className="h-8 w-8 text-primary-foreground" />
                            </div>
                          )}
                          <p className="text-sm font-medium mt-2 line-clamp-1 group-hover:text-primary transition-colors">
                            {related.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{related.author}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default BookDetail;
