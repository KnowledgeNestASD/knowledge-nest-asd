import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight, Calendar, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string | null;
  is_pinned: boolean;
  published_at: string;
  image_url: string | null;
}

interface NewsPreviewProps {
  news?: NewsItem[];
  isLoading?: boolean;
}

// Placeholder news for demo
const placeholderNews: NewsItem[] = [
  {
    id: '1',
    title: 'New Books Arriving This Week!',
    content: 'We are excited to announce that over 100 new books are arriving this week, including the latest releases in fiction, science, and adventure genres.',
    category: 'New Arrivals',
    is_pinned: true,
    published_at: new Date().toISOString(),
    image_url: null,
  },
  {
    id: '2',
    title: 'Library Hours Extended for Exam Period',
    content: 'During the upcoming exam period, the library will be open from 7:00 AM to 6:00 PM on weekdays. Make the most of this quiet study time!',
    category: 'Notice',
    is_pinned: false,
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: null,
  },
  {
    id: '3',
    title: 'Book Club Meeting This Friday',
    content: 'Join us this Friday for our monthly book club meeting. We will be discussing "The Alchemist" by Paulo Coelho. All students are welcome!',
    category: 'Upcoming Activities',
    is_pinned: false,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: null,
  },
];

const categoryColors: Record<string, string> = {
  'New Arrivals': 'bg-accent-green/10 text-accent-green',
  'Notice': 'bg-accent-orange/10 text-accent-orange',
  'Upcoming Activities': 'bg-primary/10 text-primary',
};

export function NewsPreview({ news, isLoading }: NewsPreviewProps) {
  const displayNews = news?.length ? news : placeholderNews;

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
                Library News
              </h2>
            </div>
            <p className="text-muted-foreground">
              Stay updated with the latest from our library
            </p>
          </div>
          <Link to="/news">
            <Button variant="outline" className="gap-2">
              View All News
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* News Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayNews.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="group relative bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border/50"
              >
                {/* Pinned Indicator */}
                {item.is_pinned && (
                  <div className="absolute -top-2 -right-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-orange text-white shadow-md">
                      <Pin className="h-4 w-4" />
                    </div>
                  </div>
                )}

                {/* Category Badge */}
                {item.category && (
                  <Badge 
                    variant="secondary" 
                    className={categoryColors[item.category] || 'bg-muted text-muted-foreground'}
                  >
                    {item.category}
                  </Badge>
                )}

                {/* Title */}
                <h3 className="font-display text-lg font-semibold text-foreground mt-3 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                {/* Content Preview */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {item.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(item.published_at), 'MMM d, yyyy')}
                  </div>
                  <Link to={`/news`}>
                    <Button size="sm" variant="ghost" className="gap-1 text-primary">
                      Read more
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
