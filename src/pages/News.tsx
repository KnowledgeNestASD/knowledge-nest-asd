import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Newspaper, Pin, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
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

const placeholderNews: NewsItem[] = [
  {
    id: '1',
    title: 'New Books Arriving This Week!',
    content: 'We are excited to announce that over 100 new books are arriving this week, including the latest releases in fiction, science, and adventure genres. Come visit the library to discover new titles! Featured authors include J.K. Rowling\'s new release, Rick Riordan\'s latest adventure, and many more beloved writers.',
    category: 'New Arrivals',
    is_pinned: true,
    published_at: new Date().toISOString(),
    image_url: null,
  },
  {
    id: '2',
    title: 'Library Hours Extended for Exam Period',
    content: 'During the upcoming exam period (January 15-30), the library will be open from 7:00 AM to 6:00 PM on weekdays. Make the most of this quiet study time! Our librarians will be available to help you find research materials and study resources.',
    category: 'Notice',
    is_pinned: true,
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: null,
  },
  {
    id: '3',
    title: 'Book Club Meeting This Friday',
    content: 'Join us this Friday at 2:00 PM for our monthly book club meeting. We will be discussing "The Alchemist" by Paulo Coelho. All students are welcome! Snacks and refreshments will be provided.',
    category: 'Upcoming Activities',
    is_pinned: false,
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: null,
  },
  {
    id: '4',
    title: 'Digital Resources Now Available',
    content: 'We have added new digital resources to our collection, including access to National Geographic Kids, Oxford Owl, and Epic! reading platform. Ask a librarian for access details and start exploring today!',
    category: 'New Arrivals',
    is_pinned: false,
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: null,
  },
  {
    id: '5',
    title: 'Reading Challenge Winners Announced',
    content: 'Congratulations to all participants in our November Reading Challenge! Special recognition goes to Ahmed (Grade 8) for reading 15 books, Sara (Grade 6) for the most diverse genres, and the Grade 7A class for collective achievement.',
    category: 'Notice',
    is_pinned: false,
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: null,
  },
  {
    id: '6',
    title: 'Volunteer Opportunities Available',
    content: 'Are you interested in helping at the library? We are looking for student volunteers to assist with book shelving, organizing events, and helping younger students find books. See Ms. Johnson for more information.',
    category: 'Notice',
    is_pinned: false,
    published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: null,
  },
];

const categoryColors: Record<string, string> = {
  'New Arrivals': 'bg-accent-green/10 text-accent-green',
  'Notice': 'bg-accent-orange/10 text-accent-orange',
  'Upcoming Activities': 'bg-primary/10 text-primary',
};

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setNews(data);
      }
      
      setIsLoading(false);
    };

    fetchNews();
  }, []);

  const displayNews = news.length > 0 ? news : placeholderNews;
  const pinnedNews = displayNews.filter(n => n.is_pinned);
  const regularNews = displayNews.filter(n => !n.is_pinned);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Newspaper className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
              Library News & Announcements
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Stay informed about new arrivals, upcoming activities, and important notices from the library.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Pinned News */}
            {pinnedNews.length > 0 && (
              <div className="mb-8">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                  <Pin className="h-5 w-5 text-accent-orange" />
                  Pinned Announcements
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {pinnedNews.map((item) => (
                    <article
                      key={item.id}
                      className="relative bg-card rounded-xl p-6 shadow-sm border-2 border-accent-orange/20 hover:shadow-md transition-all"
                    >
                      <div className="absolute -top-2 -right-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-orange text-white shadow-md">
                          <Pin className="h-4 w-4" />
                        </div>
                      </div>

                      {item.category && (
                        <Badge 
                          className={categoryColors[item.category] || 'bg-muted text-muted-foreground'}
                        >
                          {item.category}
                        </Badge>
                      )}

                      <h3 className="font-display text-xl font-semibold text-foreground mt-3 mb-2">
                        {item.title}
                      </h3>

                      <p className="text-muted-foreground mb-4">
                        {item.content}
                      </p>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(item.published_at), 'MMMM d, yyyy')}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Regular News */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Recent Updates
              </h2>
              <div className="space-y-4">
                {regularNews.map((item) => (
                  <article
                    key={item.id}
                    className="bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {item.category && (
                            <Badge 
                              className={categoryColors[item.category] || 'bg-muted text-muted-foreground'}
                            >
                              {item.category}
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(item.published_at), 'MMM d, yyyy')}
                          </span>
                        </div>

                        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                          {item.title}
                        </h3>

                        <p className="text-muted-foreground">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {displayNews.length === 0 && (
              <div className="text-center py-16">
                <Newspaper className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No news yet</h3>
                <p className="text-muted-foreground">
                  Check back soon for library updates and announcements!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default News;
