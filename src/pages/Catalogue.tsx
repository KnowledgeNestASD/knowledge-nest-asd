import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Search, Filter, Grid, List, BookOpen, Heart, Star } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_image_url: string | null;
  status: string;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-accent-green/10 text-accent-green';
      case 'issued':
        return 'bg-accent-orange/10 text-accent-orange';
      case 'reserved':
        return 'bg-accent-gold/10 text-accent-gold';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Placeholder books for demo when database is empty
  const placeholderBooks: Book[] = [
    {
      id: '1',
      title: 'The Adventures of Tom Sawyer',
      author: 'Mark Twain',
      description: 'A classic tale of adventure and mischief.',
      cover_image_url: null,
      status: 'available',
      publication_year: 1876,
      category: { name: 'Fiction' },
      genre: { name: 'Adventure' },
    },
    {
      id: '2',
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      description: 'Exploring the universe and its mysteries.',
      cover_image_url: null,
      status: 'issued',
      publication_year: 1988,
      category: { name: 'Non-Fiction' },
      genre: { name: 'Science' },
    },
    {
      id: '3',
      title: 'Harry Potter and the Sorcerer\'s Stone',
      author: 'J.K. Rowling',
      description: 'The magical journey begins.',
      cover_image_url: null,
      status: 'available',
      publication_year: 1997,
      category: { name: 'Fiction' },
      genre: { name: 'Fantasy' },
    },
    {
      id: '4',
      title: 'The Diary of a Young Girl',
      author: 'Anne Frank',
      description: 'A powerful account of hope and resilience.',
      cover_image_url: null,
      status: 'available',
      publication_year: 1947,
      category: { name: 'Non-Fiction' },
      genre: { name: 'Biography' },
    },
    {
      id: '5',
      title: 'Charlotte\'s Web',
      author: 'E.B. White',
      description: 'A heartwarming story of friendship.',
      cover_image_url: null,
      status: 'reserved',
      publication_year: 1952,
      category: { name: 'Fiction' },
      genre: { name: 'Children' },
    },
    {
      id: '6',
      title: 'The Little Prince',
      author: 'Antoine de Saint-Exupéry',
      description: 'A philosophical tale for all ages.',
      cover_image_url: null,
      status: 'available',
      publication_year: 1943,
      category: { name: 'Fiction' },
      genre: { name: 'Children' },
    },
  ];

  const displayBooks = books.length > 0 ? books : placeholderBooks;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl mb-2">
            Book Catalogue
          </h1>
          <p className="text-muted-foreground">
            Explore our collection of {displayBooks.length} books
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
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
        </div>

        {/* Books Display */}
        {isLoading ? (
          <div className={cn(
            'grid gap-6',
            viewMode === 'grid' 
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
              : 'grid-cols-1'
          )}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className={cn(
                'animate-pulse bg-card rounded-xl',
                viewMode === 'grid' ? 'h-72' : 'h-32'
              )} />
            ))}
          </div>
        ) : displayBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No books found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {displayBooks.map((book) => (
              <div
                key={book.id}
                className="group cursor-pointer"
              >
                {/* Book Cover */}
                <div className="relative mb-3">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="book-cover w-full object-cover"
                    />
                  ) : (
                    <div className="book-cover w-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <div className="text-center text-primary-foreground p-3">
                        <BookOpen className="mx-auto h-8 w-8 mb-1" />
                        <p className="text-xs font-medium line-clamp-2">{book.title}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <Badge 
                    className={cn('absolute top-2 right-2 text-xs', getStatusColor(book.status))}
                  >
                    {book.status}
                  </Badge>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Heart className="h-4 w-4" />
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
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayBooks.map((book) => (
              <div
                key={book.id}
                className="group flex gap-4 bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
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
                    <Badge className={cn('flex-shrink-0', getStatusColor(book.status))}>
                      {book.status}
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
                  <Button size="icon" variant="ghost">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Catalogue;
