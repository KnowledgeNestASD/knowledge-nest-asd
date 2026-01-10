import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FeaturedBookProps {
  book?: {
    id: string;
    title: string;
    author: string;
    description: string | null;
    cover_image_url: string | null;
    genre?: { name: string } | null;
  } | null;
}

export function FeaturedBook({ book }: FeaturedBookProps) {
  // Show placeholder if no featured book
  if (!book) {
    return (
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            className="featured-book-card p-8 lg:p-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-accent-gold" />
              <span className="font-semibold text-accent-gold">Featured Book of the Month</span>
            </div>
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                No featured book selected. Check back soon!
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div 
          className="featured-book-card p-8 lg:p-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="flex items-center gap-2 mb-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Star className="h-5 w-5 text-accent-gold fill-accent-gold" />
            <span className="font-semibold text-accent-gold">Featured Book of the Month</span>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[250px_1fr] lg:items-center">
            {/* Book Cover */}
            <motion.div 
              className="mx-auto lg:mx-0"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: 'spring' }}
              whileHover={{ scale: 1.05 }}
            >
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="book-cover w-48 h-72 object-cover"
                />
              ) : (
                <div className="book-cover w-48 h-72 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <div className="text-center text-primary-foreground p-4">
                    <BookOpen className="mx-auto h-12 w-12 mb-2" />
                    <p className="font-display font-bold text-sm line-clamp-2">{book.title}</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Book Details */}
            <motion.div 
              className="space-y-4 text-center lg:text-left"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              {book.genre && (
                <Badge variant="secondary" className="bg-accent-orange/10 text-accent-orange border-0">
                  {book.genre.name}
                </Badge>
              )}
              
              <h2 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
                {book.title}
              </h2>
              
              <p className="text-lg text-muted-foreground">
                by <span className="font-medium text-foreground">{book.author}</span>
              </p>

              {book.description && (
                <p className="text-muted-foreground line-clamp-3 max-w-2xl">
                  {book.description}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start pt-2">
                <Link to={`/book/${book.id}`}>
                  <Button className="gap-2 shadow-lg shadow-primary/20">
                    View Book
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/catalogue">
                  <Button variant="outline">
                    Browse More Books
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}