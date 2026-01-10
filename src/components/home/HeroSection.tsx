import { Link } from 'react-router-dom';
import { Feather, Search, Trophy, Sparkles, BookOpen, Star, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden hero-pattern min-h-[85vh] flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] h-32 w-32 rounded-full bg-accent-orange/10 blur-3xl animate-float" />
        <div className="absolute bottom-[20%] right-[10%] h-48 w-48 rounded-full bg-primary/10 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[30%] h-24 w-24 rounded-full bg-accent-gold/15 blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[10%] left-[20%] h-36 w-36 rounded-full bg-accent-green/10 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        
        {/* Decorative book icons */}
        <BookOpen className="absolute top-[15%] right-[15%] h-8 w-8 text-primary/10 rotate-12" />
        <Star className="absolute bottom-[30%] left-[10%] h-6 w-6 text-accent-gold/20 animate-pulse" />
        <Feather className="absolute top-[60%] right-[20%] h-10 w-10 text-accent-orange/10 -rotate-12" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Text Content */}
          <div className="space-y-8 text-center lg:text-left animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-orange/10 to-accent-gold/10 px-5 py-2 text-sm font-medium text-accent-orange border border-accent-orange/20 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Welcome to Knowledge Nest
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl xl:text-7xl">
                Where{' '}
                <span className="relative">
                  <span className="gradient-text">Readers</span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent-gold/30" viewBox="0 0 200 8" fill="none">
                    <path d="M1 5.5C40 2 80 2 100 5.5C120 2 160 2 199 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
                <br />
                Flourish
              </h1>
              <p className="mx-auto max-w-xl text-lg md:text-xl text-muted-foreground lg:mx-0 leading-relaxed">
                Discover thousands of books, join exciting reading challenges, and become part of our vibrant community at Ambassador School Dubai Library.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link to="/catalogue">
                <Button size="lg" className="w-full sm:w-auto gap-2 h-14 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <Search className="h-5 w-5" />
                  Explore Books
                </Button>
              </Link>
              <Link to="/challenges">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 h-14 px-8 text-base border-2 hover:bg-accent-gold/10 hover:border-accent-gold hover:text-accent-gold transition-all">
                  <Trophy className="h-5 w-5" />
                  View Challenges
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 lg:gap-8">
              <div className="text-center lg:text-left group">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <p className="font-display text-2xl md:text-3xl font-bold text-primary">5,000+</p>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Books Available</p>
              </div>
              <div className="text-center lg:text-left group">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Users className="h-5 w-5 text-accent-orange" />
                  <p className="font-display text-2xl md:text-3xl font-bold text-accent-orange">500+</p>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Active Readers</p>
              </div>
              <div className="text-center lg:text-left group">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <TrendingUp className="h-5 w-5 text-accent-green" />
                  <p className="font-display text-2xl md:text-3xl font-bold text-accent-green">25+</p>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Active Challenges</p>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative mx-auto w-full max-w-lg">
              {/* Main Nest/Book Visual */}
              <div className="relative">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent-orange/10 to-accent-gold/20 rounded-full blur-3xl scale-110" />
                
                {/* Nest shape */}
                <div className="relative bg-gradient-to-br from-library-tan to-library-beige rounded-[3rem] p-8 shadow-2xl border border-library-tan/50">
                  {/* Book stack inside nest */}
                  <div className="relative h-80 flex items-center justify-center">
                    {/* Back book */}
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-4 w-44 h-60 rounded-lg bg-gradient-to-br from-accent-green to-accent-green/80 shadow-xl transform rotate-6 transition-transform hover:rotate-3">
                      <div className="absolute inset-3 rounded border border-white/20" />
                    </div>
                    {/* Middle book */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-44 h-60 rounded-lg bg-gradient-to-br from-accent-orange to-accent-orange/80 shadow-xl transform -rotate-3 transition-transform hover:rotate-0">
                      <div className="absolute inset-3 rounded border border-white/20" />
                    </div>
                    {/* Front book */}
                    <div className="absolute left-1/2 -translate-x-1/2 translate-y-4 w-44 h-60 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-2xl transform rotate-2 transition-transform hover:rotate-0">
                      <div className="absolute inset-3 rounded border border-white/20 flex flex-col items-center justify-center text-primary-foreground p-4">
                        <Feather className="h-14 w-14 mb-3" />
                        <p className="text-center font-display text-xl font-bold">Knowledge</p>
                        <p className="text-center text-sm opacity-80">Nest</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-gold to-accent-gold/80 text-accent-gold-foreground shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                  <Star className="h-8 w-8" />
                </div>
                <div className="absolute -bottom-2 -left-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-green to-accent-green/80 text-white shadow-lg animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                  <Trophy className="h-7 w-7" />
                </div>
                <div className="absolute top-1/2 -right-8 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-orange to-accent-orange/80 text-white shadow-lg animate-bounce" style={{ animationDuration: '2s', animationDelay: '1s' }}>
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}