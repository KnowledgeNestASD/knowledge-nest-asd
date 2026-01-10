import { Link } from 'react-router-dom';
import { BookOpen, Search, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden hero-pattern">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 h-20 w-20 rounded-full bg-accent-orange/10 blur-2xl animate-float" />
        <div className="absolute bottom-20 right-20 h-32 w-32 rounded-full bg-primary/10 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-40 right-40 h-16 w-16 rounded-full bg-accent-gold/15 blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Text Content */}
          <div className="space-y-6 text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-orange/10 px-4 py-1.5 text-sm font-medium text-accent-orange">
              <Sparkles className="h-4 w-4" />
              Welcome to Our Library
            </div>
            
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Discover the Joy of{' '}
              <span className="gradient-text">Reading</span>
            </h1>
            
            <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
              Explore thousands of books, join exciting reading challenges, and become part of our vibrant reading community at Ambassador School Dubai Library.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link to="/catalogue">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <Search className="h-5 w-5" />
                  Explore Books
                </Button>
              </Link>
              <Link to="/challenges">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  <Trophy className="h-5 w-5" />
                  View Challenges
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-6 lg:justify-start">
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-primary">5,000+</p>
                <p className="text-sm text-muted-foreground">Books Available</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-accent-orange">500+</p>
                <p className="text-sm text-muted-foreground">Active Readers</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-accent-green">25+</p>
                <p className="text-sm text-muted-foreground">Reading Challenges</p>
              </div>
            </div>
          </div>

          {/* Hero Image / Book Stack Illustration */}
          <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative mx-auto w-full max-w-md">
              {/* Stack of books illustration */}
              <div className="relative">
                {/* Back book */}
                <div className="absolute left-8 top-8 h-72 w-48 rounded-lg bg-accent-green shadow-2xl transform rotate-6" />
                {/* Middle book */}
                <div className="absolute left-4 top-4 h-72 w-48 rounded-lg bg-accent-orange shadow-2xl transform -rotate-3" />
                {/* Front book */}
                <div className="relative h-72 w-48 rounded-lg bg-primary shadow-2xl transform rotate-2 mx-auto">
                  <div className="absolute inset-4 rounded border-2 border-primary-foreground/20">
                    <div className="flex h-full flex-col items-center justify-center text-primary-foreground p-4">
                      <BookOpen className="h-12 w-12 mb-2" />
                      <p className="text-center font-display text-lg font-bold">Ambassador</p>
                      <p className="text-center text-sm">Library</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent-gold text-accent-gold-foreground shadow-lg badge-glow">
                <div className="text-center">
                  <Trophy className="mx-auto h-6 w-6" />
                  <p className="text-xs font-bold">Read</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
