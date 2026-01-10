import { Award, Star, BookOpen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ReaderSpotlightProps {
  reader?: {
    full_name: string | null;
    avatar_url: string | null;
    class_name: string | null;
    books_read: number;
    spotlight_type: string;
  } | null;
}

export function ReaderSpotlight({ reader }: ReaderSpotlightProps) {
  // Placeholder reader for demo
  const displayReader = reader || {
    full_name: 'Ahmed Al-Rashid',
    avatar_url: null,
    class_name: 'Grade 8A',
    books_read: 24,
    spotlight_type: 'Reader of the Month',
  };

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-gold/20 via-accent-orange/10 to-primary/10 p-8 lg:p-12">
          {/* Decorative stars */}
          <Star className="absolute top-4 left-4 h-6 w-6 text-accent-gold/30" />
          <Star className="absolute top-8 right-12 h-4 w-4 text-accent-gold/40" />
          <Star className="absolute bottom-6 left-20 h-5 w-5 text-accent-gold/25" />

          <div className="flex flex-col items-center text-center">
            {/* Trophy */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-gold text-accent-gold-foreground shadow-lg badge-glow">
              <Award className="h-8 w-8" />
            </div>

            {/* Title */}
            <h2 className="font-display text-2xl font-bold text-foreground mb-2 lg:text-3xl">
              {displayReader.spotlight_type}
            </h2>
            <p className="text-muted-foreground mb-6">
              Congratulations to our star reader!
            </p>

            {/* Reader Info */}
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 border-4 border-accent-gold shadow-lg mb-4">
                <AvatarImage src={displayReader.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {displayReader.full_name?.[0]?.toUpperCase() || 'R'}
                </AvatarFallback>
              </Avatar>

              <h3 className="font-display text-xl font-bold text-foreground">
                {displayReader.full_name || 'Star Reader'}
              </h3>
              {displayReader.class_name && (
                <p className="text-muted-foreground">{displayReader.class_name}</p>
              )}

              <div className="mt-4 flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">
                  {displayReader.books_read} books read
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
