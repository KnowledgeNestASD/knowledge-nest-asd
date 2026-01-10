import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedBook } from '@/components/home/FeaturedBook';
import { ChallengesPreview } from '@/components/home/ChallengesPreview';
import { NewsPreview } from '@/components/home/NewsPreview';
import { EventsPreview } from '@/components/home/EventsPreview';
import { QuickActions } from '@/components/home/QuickActions';
import { ReaderSpotlight } from '@/components/home/ReaderSpotlight';
import { QuillAIChatbot } from '@/components/QuillAIChatbot';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [featuredBook, setFeaturedBook] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [readerSpotlight, setReaderSpotlight] = useState<any>(null);
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

      // Fetch reader spotlight
      const { data: spotlightData } = await supabase
        .from('reader_spotlights')
        .select('*, user_id')
        .gte('featured_until', new Date().toISOString())
        .lte('featured_from', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (spotlightData) {
        // Fetch profile separately
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, class_name')
          .eq('user_id', spotlightData.user_id)
          .maybeSingle();
        
        setReaderSpotlight({
          full_name: profileData?.full_name,
          avatar_url: profileData?.avatar_url,
          class_name: profileData?.class_name,
          books_read: spotlightData.books_read,
          spotlight_type: spotlightData.spotlight_type,
        });
      }

      setIsLoading(false);
    };

    fetchHomeData();
  }, []);

  return (
    <Layout>
      <HeroSection />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <QuickActions />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <FeaturedBook book={featuredBook} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <ChallengesPreview challenges={challenges} isLoading={isLoading} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <NewsPreview news={news} isLoading={isLoading} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <EventsPreview events={events} isLoading={isLoading} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <ReaderSpotlight reader={readerSpotlight} />
      </motion.div>
      
      <QuillAIChatbot />
    </Layout>
  );
};

export default Index;