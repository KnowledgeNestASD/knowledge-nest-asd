import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, BookOpen, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  author: z.string().min(1, 'Author is required').max(100),
  isbn: z.string().max(13).optional(),
  description: z.string().max(500).optional(),
  category_id: z.string().optional(),
  genre_id: z.string().optional(),
  publisher: z.string().max(100).optional(),
  publication_year: z.number().min(1000).max(new Date().getFullYear()).optional(),
  page_count: z.number().min(1).optional(),
  total_copies: z.number().min(1).default(1),
  cover_image_url: z.string().url().optional().or(z.literal('')),
});

type BookFormData = z.infer<typeof bookSchema>;

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  description?: string | null;
  category_id?: string | null;
  genre_id?: string | null;
  publisher?: string | null;
  publication_year?: number | null;
  page_count?: number | null;
  total_copies: number;
  cover_image_url?: string | null;
}

interface AddEditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book?: Book | null;
  onSuccess: () => void;
}

export function AddEditBookModal({ isOpen, onClose, book, onSuccess }: AddEditBookModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingISBN, setIsFetchingISBN] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      total_copies: 1,
    },
  });

  const isbnValue = watch('isbn');

  useEffect(() => {
    const fetchFilters = async () => {
      const [catRes, genRes] = await Promise.all([
        supabase.from('categories').select('id, name').order('name'),
        supabase.from('genres').select('id, name').order('name'),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (genRes.data) setGenres(genRes.data);
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    if (book) {
      reset({
        title: book.title,
        author: book.author,
        isbn: book.isbn || '',
        description: book.description || '',
        category_id: book.category_id || undefined,
        genre_id: book.genre_id || undefined,
        publisher: book.publisher || '',
        publication_year: book.publication_year || undefined,
        page_count: book.page_count || undefined,
        total_copies: book.total_copies,
        cover_image_url: book.cover_image_url || '',
      });
    } else {
      reset({
        title: '',
        author: '',
        isbn: '',
        description: '',
        total_copies: 1,
        cover_image_url: '',
      });
    }
  }, [book, reset]);

  const fetchByISBN = async () => {
    if (!isbnValue || isbnValue.length < 10) {
      toast({
        title: 'Invalid ISBN',
        description: 'Please enter a valid ISBN (10 or 13 digits)',
        variant: 'destructive',
      });
      return;
    }

    setIsFetchingISBN(true);
    try {
      const response = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbnValue}&format=json&jscmd=data`
      );
      const data = await response.json();
      const bookData = data[`ISBN:${isbnValue}`];

      if (bookData) {
        setValue('title', bookData.title || '');
        setValue('author', bookData.authors?.[0]?.name || '');
        setValue('publisher', bookData.publishers?.[0]?.name || '');
        setValue('publication_year', bookData.publish_date ? parseInt(bookData.publish_date) : undefined);
        setValue('page_count', bookData.number_of_pages || undefined);
        if (bookData.cover?.large) {
          setValue('cover_image_url', bookData.cover.large);
        } else if (bookData.cover?.medium) {
          setValue('cover_image_url', bookData.cover.medium);
        }
        toast({
          title: 'Book Found',
          description: 'Details auto-filled from Open Library',
        });
      } else {
        toast({
          title: 'Not Found',
          description: 'No book found with this ISBN',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Fetch Failed',
        description: 'Unable to fetch book details',
        variant: 'destructive',
      });
    }
    setIsFetchingISBN(false);
  };

  const onSubmit = async (data: BookFormData) => {
    if (!user) return;
    setIsLoading(true);

    const bookData = {
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      description: data.description || null,
      category_id: data.category_id || null,
      genre_id: data.genre_id || null,
      publisher: data.publisher || null,
      publication_year: data.publication_year || null,
      page_count: data.page_count || null,
      total_copies: data.total_copies,
      available_copies: book ? undefined : data.total_copies,
      cover_image_url: data.cover_image_url || null,
      added_by: book ? undefined : user.id,
    };

    let error;
    if (book) {
      const { error: updateError } = await supabase
        .from('books')
        .update(bookData)
        .eq('id', book.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('books')
        .insert(bookData);
      error = insertError;
    }

    if (error) {
      toast({
        title: 'Error',
        description: `Failed to ${book ? 'update' : 'add'} book: ${error.message}`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `Book ${book ? 'updated' : 'added'} successfully`,
      });
      onSuccess();
      onClose();
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {book ? 'Edit Book' : 'Add Book'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ISBN Lookup */}
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <div className="flex gap-2">
              <Input
                id="isbn"
                {...register('isbn')}
                placeholder="Enter ISBN to auto-fill"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={fetchByISBN}
                disabled={isFetchingISBN}
              >
                {isFetchingISBN ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Title & Author */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Book title"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                {...register('author')}
                placeholder="Author name"
              />
              {errors.author && (
                <p className="text-xs text-destructive">{errors.author.message}</p>
              )}
            </div>
          </div>

          {/* Category & Genre */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                onValueChange={(value) => setValue('category_id', value)}
                defaultValue={book?.category_id || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Genre</Label>
              <Select
                onValueChange={(value) => setValue('genre_id', value)}
                defaultValue={book?.genre_id || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Publisher & Year */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                {...register('publisher')}
                placeholder="Publisher name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publication_year">Year</Label>
              <Input
                id="publication_year"
                type="number"
                {...register('publication_year', { valueAsNumber: true })}
                placeholder="Publication year"
              />
            </div>
          </div>

          {/* Pages & Copies */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="page_count">Pages</Label>
              <Input
                id="page_count"
                type="number"
                {...register('page_count', { valueAsNumber: true })}
                placeholder="Number of pages"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_copies">Total Copies *</Label>
              <Input
                id="total_copies"
                type="number"
                {...register('total_copies', { valueAsNumber: true })}
                min={1}
              />
            </div>
          </div>

          {/* Cover URL */}
          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Cover Image URL</Label>
            <Input
              id="cover_image_url"
              {...register('cover_image_url')}
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Book description (max 500 characters)"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : book ? (
                'Update Book'
              ) : (
                'Add Book'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
