import { Link } from 'react-router-dom';
import { Search, BookHeart, Trophy, Lightbulb, HelpCircle, BookOpen } from 'lucide-react';

const actions = [
  {
    title: 'Search Books',
    description: 'Find your next great read',
    icon: Search,
    href: '/catalogue',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'My Books',
    description: 'View borrowed & favorites',
    icon: BookHeart,
    href: '/my-books',
    color: 'bg-accent-orange/10 text-accent-orange',
  },
  {
    title: 'Challenges',
    description: 'Join reading challenges',
    icon: Trophy,
    href: '/challenges',
    color: 'bg-accent-gold/10 text-accent-gold',
  },
  {
    title: 'Suggest a Book',
    description: 'Recommend new books',
    icon: Lightbulb,
    href: '/suggest',
    color: 'bg-accent-green/10 text-accent-green',
  },
  {
    title: 'Resources',
    description: 'eBooks & newspapers',
    icon: BookOpen,
    href: '/resources',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Need Help?',
    description: 'Contact the library',
    icon: HelpCircle,
    href: '/contact',
    color: 'bg-muted text-muted-foreground',
  },
];

export function QuickActions() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground lg:text-3xl mb-2">
            Quick Actions
          </h2>
          <p className="text-muted-foreground">
            What would you like to do today?
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.href}
                className="group flex flex-col items-center p-6 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-center"
              >
                <div className={`rounded-xl p-3 mb-3 ${action.color} transition-transform group-hover:scale-110`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
