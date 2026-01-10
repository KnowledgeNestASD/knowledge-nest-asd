import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedBook } from '@/components/home/FeaturedBook';
import { ChallengesPreview } from '@/components/home/ChallengesPreview';
import { NewsPreview } from '@/components/home/NewsPreview';
import { EventsPreview } from '@/components/home/EventsPreview';
import { QuickActions } from '@/components/home/QuickActions';
import { ReaderSpotlight } from '@/components/home/ReaderSpotlight';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [featuredBook, setFeaturedBook] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      
      // Fetch featured book
      const { data: featuredData } = await supabase
        .from('books')
        .select('*, genre:genres(name)')
        .eq('is_featured', true)
        .maybeSingle();
      
      if (featuredData) {
        setFeaturedBook(featuredData);
      }

      // Fetch active challenges
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*')
        .eq('status', 'active')
        .order('end_date', { ascending: true })
        .limit(3);
      
      if (challengesData) {
        setChallenges(challengesData);
      }

      // Fetch latest news
      const { data: newsData } = await supabase
        .from('news')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (newsData) {
        setNews(newsData);
      }

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('is_past', false)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(3);
      
      if (eventsData) {
        setEvents(eventsData);
      }

      setIsLoading(false);
    };

    fetchHomeData();
  }, []);

  return (
    <Layout>
      <HeroSection />
      <QuickActions />
      <FeaturedBook book={featuredBook} />
      <ChallengesPreview challenges={challenges} isLoading={isLoading} />
      <NewsPreview news={news} isLoading={isLoading} />
      <EventsPreview events={events} isLoading={isLoading} />
      <ReaderSpotlight />
    </Layout>
  );
};

export default Index;
