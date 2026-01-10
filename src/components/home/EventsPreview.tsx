import { Link } from 'react-router-dom';
import { CalendarDays, ArrowRight, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
}

interface EventsPreviewProps {
  events?: Event[];
  isLoading?: boolean;
}

// Placeholder events for demo
const placeholderEvents: Event[] = [
  {
    id: '1',
    title: 'Annual Book Fair 2024',
    description: 'Join us for our annual book fair featuring hundreds of books from local and international publishers. Special discounts for students!',
    event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'School Auditorium',
    image_url: null,
  },
  {
    id: '2',
    title: 'Author Visit: Sarah Johnson',
    description: 'Meet bestselling author Sarah Johnson as she discusses her latest book and her journey as a writer.',
    event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Library Hall',
    image_url: null,
  },
  {
    id: '3',
    title: 'World Book Day Celebration',
    description: 'Celebrate World Book Day with fun activities, costume contests, and reading sessions throughout the day.',
    event_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Library & Playground',
    image_url: null,
  },
];

export function EventsPreview({ events, isLoading }: EventsPreviewProps) {
  const displayEvents = events?.length ? events : placeholderEvents;

  return (
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-6 w-6 text-accent-green" />
              <h2 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
                Upcoming Events
              </h2>
            </div>
            <p className="text-muted-foreground">
              Don't miss out on exciting library events
            </p>
          </div>
          <Link to="/events">
            <Button variant="outline" className="gap-2">
              View All Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayEvents.slice(0, 3).map((event) => (
              <article
                key={event.id}
                className="group flex flex-col sm:flex-row gap-4 bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-border/50"
              >
                {/* Date Badge */}
                <div className="flex-shrink-0">
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <span className="text-2xl font-bold">
                      {format(new Date(event.event_date), 'd')}
                    </span>
                    <span className="text-xs uppercase">
                      {format(new Date(event.event_date), 'MMM')}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.event_date), 'h:mm a')}
                    </Badge>
                    {event.location && (
                      <Badge variant="secondary" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0 self-center">
                  <Link to="/events">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Details
                      <ArrowRight className="h-4 w-4" />
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
