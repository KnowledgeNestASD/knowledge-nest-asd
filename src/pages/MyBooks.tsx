import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { BookOpen, Heart, Clock, BookMarked, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const MyBooks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <div className="max-w-md mx-auto text-center">
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
          </div>
        </div>
      </Layout>
    );
  }

  // Placeholder data for demo
  const borrowedBooks = [
    { id: '1', title: 'The Hobbit', author: 'J.R.R. Tolkien', dueDate: '2024-02-15', daysLeft: 5 },
    { id: '2', title: 'Percy Jackson', author: 'Rick Riordan', dueDate: '2024-02-10', daysLeft: 0 },
  ];

  const favorites = [
    { id: '3', title: 'Harry Potter', author: 'J.K. Rowling' },
    { id: '4', title: 'Wonder', author: 'R.J. Palacio' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl mb-2">
            My Books
          </h1>
          <p className="text-muted-foreground">
            Manage your borrowed books, favorites, and reading list
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Currently Borrowed */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-accent-orange" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Currently Borrowed
              </h2>
            </div>

            {borrowedBooks.length > 0 ? (
              <div className="space-y-4">
                {borrowedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-card rounded-xl p-4 shadow-sm border border-border/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                      </div>
                      <Badge 
                        variant={book.daysLeft <= 0 ? 'destructive' : book.daysLeft <= 3 ? 'default' : 'secondary'}
                      >
                        {book.daysLeft <= 0 ? 'Overdue' : `${book.daysLeft} days left`}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Due: {new Date(book.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-xl p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No books currently borrowed</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/catalogue')}>
                  Browse Catalogue
                </Button>
              </div>
            )}
          </section>

          {/* Favorites */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-destructive" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                My Favorites
              </h2>
            </div>

            {favorites.length > 0 ? (
              <div className="space-y-4">
                {favorites.map((book) => (
                  <div
                    key={book.id}
                    className="bg-card rounded-xl p-4 shadow-sm border border-border/50 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-foreground">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Heart className="h-4 w-4 fill-destructive text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-xl p-8 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No favorite books yet</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/catalogue')}>
                  Find Books to Love
                </Button>
              </div>
            )}
          </section>
        </div>

        {/* Reading Stats */}
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-accent-gold" />
            Reading Stats
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 text-center">
              <p className="text-3xl font-bold text-primary">12</p>
              <p className="text-sm text-muted-foreground">Books Read This Year</p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 text-center">
              <p className="text-3xl font-bold text-accent-orange">3</p>
              <p className="text-sm text-muted-foreground">Challenges Completed</p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 text-center">
              <p className="text-3xl font-bold text-accent-green">5</p>
              <p className="text-sm text-muted-foreground">Reviews Written</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default MyBooks;
