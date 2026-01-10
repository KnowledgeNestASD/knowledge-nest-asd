import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CalendarDays, MapPin, Clock, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  image_url: string | null;
  is_past: boolean;
}

const placeholderEvents: Event[] = [
  {
    id: '1',
    title: 'Annual Book Fair 2024',
    description: 'Join us for our annual book fair featuring hundreds of books from local and international publishers. Special discounts for students and staff. Browse through fiction, non-fiction, educational materials, and more!',
    event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'School Auditorium',
    image_url: null,
    is_past: false,
  },
  {
    id: '2',
    title: 'Author Visit: Sarah Johnson',
    description: 'Meet bestselling author Sarah Johnson as she discusses her latest book "The Hidden Garden" and shares insights about her journey as a writer. Q&A session and book signing included!',
    event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: null,
    location: 'Library Hall',
    image_url: null,
    is_past: false,
  },
  {
    id: '3',
    title: 'World Book Day Celebration',
    description: 'Celebrate World Book Day with fun activities, costume contests (come as your favorite book character!), reading sessions, and special prizes throughout the day.',
    event_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: null,
    location: 'Library & Playground',
    image_url: null,
    is_past: false,
  },
  {
    id: '4',
    title: 'Poetry Reading Workshop',
    description: 'Learn the art of poetry reading and expression. This interactive workshop is perfect for students interested in performing arts and literature.',
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: null,
    location: 'Library Reading Room',
    image_url: null,
    is_past: false,
  },
  {
    id: '5',
    title: 'Book Club Meeting - December',
    description: 'Our monthly book club meeting discussing "Wonder" by R.J. Palacio. All students are welcome to join the discussion!',
    event_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: null,
    location: 'Library Hall',
    image_url: null,
    is_past: true,
  },
  {
    id: '6',
    title: 'Literacy Week 2023',
    description: 'A week-long celebration of reading and writing with various activities, competitions, and guest speakers.',
    event_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 54 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Entire Campus',
    image_url: null,
    is_past: true,
  },
];

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (!error && data && data.length > 0) {
        setEvents(data);
      }
      
      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  const displayEvents = events.length > 0 ? events : placeholderEvents;
  
  const upcomingEvents = displayEvents.filter(e => !e.is_past && new Date(e.event_date) >= new Date());
  const pastEvents = displayEvents.filter(e => e.is_past || new Date(e.event_date) < new Date());

  const filteredEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="h-8 w-8 text-accent-green" />
            <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
              Library Events
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Stay updated on book fairs, author visits, literacy celebrations, and more. 
            Don't miss out on exciting library events!
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Events ({pastEvents.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Events List */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <CalendarDays className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {activeTab === 'upcoming' ? 'No upcoming events' : 'No past events'}
            </h3>
            <p className="text-muted-foreground">
              {activeTab === 'upcoming' 
                ? 'Check back soon for new library events!' 
                : 'Past events will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Date Section */}
                  <div className={`flex-shrink-0 p-6 flex items-center justify-center ${event.is_past ? 'bg-muted' : 'bg-primary'}`}>
                    <div className={`text-center ${event.is_past ? 'text-muted-foreground' : 'text-primary-foreground'}`}>
                      <span className="block text-3xl font-bold">
                        {format(new Date(event.event_date), 'd')}
                      </span>
                      <span className="block text-sm uppercase">
                        {format(new Date(event.event_date), 'MMM')}
                      </span>
                      <span className="block text-xs mt-1">
                        {format(new Date(event.event_date), 'yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-muted-foreground mb-4">
                            {event.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4">
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.event_date), 'h:mm a')}
                            {event.end_date && ` - ${format(new Date(event.end_date), 'MMM d')}`}
                          </Badge>
                          {event.location && (
                            <Badge variant="secondary" className="gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </Badge>
                          )}
                          {event.is_past && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>

                      {!event.is_past && (
                        <Button className="gap-2 flex-shrink-0">
                          <Calendar className="h-4 w-4" />
                          Add to Calendar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Events;
