import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Search, Grid, List, BookOpen, Heart, Plus, BookMarked } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_image_url: string | null;
  status: string;
  available_copies: number;
  publication_year: number | null;
  category: { name: string } | null;
  genre: { name: string } | null;
}

const Catalogue = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [readingList, setReadingList] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch user's favorites and reading list
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const [favsRes, readingRes] = await Promise.all([
          supabase.from('favorites').select('book_id').eq('user_id', user.id),
          supabase.from('reading_list').select('book_id').eq('user_id', user.id),
        ]);
        
        if (favsRes.data) {
          setFavorites(new Set(favsRes.data.map(f => f.book_id)));
        }
        if (readingRes.data) {
          setReadingList(new Set(readingRes.data.map(r => r.book_id)));
        }
      };
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    const fetchFilters = async () => {
      const [categoriesRes, genresRes] = await Promise.all([
        supabase.from('categories').select('id, name').order('name'),
        supabase.from('genres').select('id, name').order('name'),
      ]);
      
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (genresRes.data) setGenres(genresRes.data);
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      
      let query = supabase
        .from('books')
        .select('*, category:categories(name), genre:genres(name)')
        .order('title');

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (selectedGenre !== 'all') {
        query = query.eq('genre_id', selectedGenre);
      }

      const { data, error } = await query;

      if (!error && data) {
        setBooks(data);
      }
      
      setIsLoading(false);
    };

    const debounce = setTimeout(fetchBooks, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedCategory, selectedGenre]);

  const toggleFavorite = async (bookId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add books to favorites.',
        variant: 'destructive',
      });
      return;
    }

    const isFavorite = favorites.has(bookId);
    
    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId);
      
      if (!error) {
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(bookId);
          return next;
        });
        toast({ title: 'Removed from favorites' });
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, book_id: bookId });
      
      if (!error) {
        setFavorites(prev => new Set([...prev, bookId]));
        toast({ title: 'Added to favorites!' });
      }
    }
  };

  const toggleReadingList = async (bookId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add books to your reading list.',
        variant: 'destructive',
      });
      return;
    }

    const inList = readingList.has(bookId);
    
    if (inList) {
      const { error } = await supabase
        .from('reading_list')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId);
      
      if (!error) {
        setReadingList(prev => {
          const next = new Set(prev);
          next.delete(bookId);
          return next;
        });
        toast({ title: 'Removed from reading list' });
      }
    } else {
      const { error } = await supabase
        .from('reading_list')
        .insert({ user_id: user.id, book_id: bookId });
      
      if (!error) {
        setReadingList(prev => new Set([...prev, bookId]));
        toast({ title: 'Added to reading list!' });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-accent-green/10 text-accent-green border-accent-green/20';
      case 'issued':
        return 'bg-accent-orange/10 text-accent-orange border-accent-orange/20';
      case 'reserved':
        return 'bg-accent-gold/10 text-accent-gold border-accent-gold/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

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
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl mb-2">
            Book Catalogue
          </h1>
          <p className="text-muted-foreground">
            Explore our collection of {books.length} books
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px] bg-card">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-[150px] bg-card">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="hidden sm:flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Books Display */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'grid gap-6',
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                  : 'grid-cols-1'
              )}
            >
              {[...Array(12)].map((_, i) => (
                <div key={i} className={cn(
                  'animate-pulse bg-card rounded-xl',
                  viewMode === 'grid' ? 'h-72' : 'h-32'
                )} />
              ))}
            </motion.div>
          ) : books.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No books found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            >
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/book/${book.id}`)}
                >
                  {/* Book Cover */}
                  <div className="relative mb-3">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="book-cover w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="book-cover w-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center rounded-lg">
                        <div className="text-center text-primary-foreground p-3">
                          <BookOpen className="mx-auto h-8 w-8 mb-1" />
                          <p className="text-xs font-medium line-clamp-2">{book.title}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <Badge 
                      className={cn('absolute top-2 right-2 text-xs border', getStatusColor(book.status))}
                    >
                      {book.available_copies > 0 ? `${book.available_copies} left` : book.status}
                    </Badge>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-foreground/70 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg flex items-center justify-center gap-2">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-9 w-9"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(book.id);
                        }}
                      >
                        <Heart className={cn("h-4 w-4", favorites.has(book.id) && "fill-destructive text-destructive")} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-9 w-9"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReadingList(book.id);
                        }}
                      >
                        <BookMarked className={cn("h-4 w-4", readingList.has(book.id) && "fill-primary text-primary")} />
                      </Button>
                      <Button size="sm" variant="secondary">
                        View
                      </Button>
                    </div>
                  </div>

                  {/* Book Info */}
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {book.author}
                  </p>
                  {book.genre && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {book.genre.name}
                    </Badge>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/book/${book.id}`)}
                  className="group flex gap-4 bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-border/50"
                >
                  {/* Cover */}
                  <div className="flex-shrink-0">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-20 h-28 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-28 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                      </div>
                      <Badge className={cn('flex-shrink-0 border', getStatusColor(book.status))}>
                        {book.available_copies > 0 ? `${book.available_copies} available` : book.status}
                      </Badge>
                    </div>
                    
                    {book.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {book.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      {book.genre && (
                        <Badge variant="secondary" className="text-xs">
                          {book.genre.name}
                        </Badge>
                      )}
                      {book.publication_year && (
                        <span className="text-xs text-muted-foreground">
                          {book.publication_year}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="hidden sm:flex flex-col gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(book.id);
                      }}
                    >
                      <Heart className={cn("h-4 w-4", favorites.has(book.id) && "fill-destructive text-destructive")} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReadingList(book.id);
                      }}
                    >
                      <BookMarked className={cn("h-4 w-4", readingList.has(book.id) && "fill-primary text-primary")} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Catalogue;