import { motion } from 'framer-motion';
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
        <motion.div 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-gold/20 via-accent-orange/10 to-primary/10 p-8 lg:p-12"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative stars */}
          <motion.div
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Star className="absolute top-4 left-4 h-6 w-6 text-accent-gold/30" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: 20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Star className="absolute top-8 right-12 h-4 w-4 text-accent-gold/40" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Star className="absolute bottom-6 left-20 h-5 w-5 text-accent-gold/25" />
          </motion.div>

          <div className="flex flex-col items-center text-center">
            {/* Trophy */}
            <motion.div 
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-gold text-accent-gold-foreground shadow-lg"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Award className="h-8 w-8" />
            </motion.div>

            {/* Title */}
            <motion.h2 
              className="font-display text-2xl font-bold text-foreground mb-2 lg:text-3xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {displayReader.spotlight_type}
            </motion.h2>
            <motion.p 
              className="text-muted-foreground mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Congratulations to our star reader!
            </motion.p>

            {/* Reader Info */}
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Avatar className="h-24 w-24 border-4 border-accent-gold shadow-lg mb-4">
                  <AvatarImage src={displayReader.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {displayReader.full_name?.[0]?.toUpperCase() || 'R'}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              <h3 className="font-display text-xl font-bold text-foreground">
                {displayReader.full_name || 'Star Reader'}
              </h3>
              {displayReader.class_name && (
                <p className="text-muted-foreground">{displayReader.class_name}</p>
              )}

              <motion.div 
                className="mt-4 flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, type: 'spring' }}
              >
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">
                  {displayReader.books_read} books read
                </span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}