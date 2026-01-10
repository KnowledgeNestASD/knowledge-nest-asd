import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookHeart, Trophy, Lightbulb, HelpCircle, BookOpen } from 'lucide-react';

const actions = [
  {
    title: 'Search Books',
    description: 'Find your next great read',
    icon: Search,
    href: '/catalogue',
    color: 'bg-primary/10 text-primary',
    hoverColor: 'group-hover:bg-primary group-hover:text-primary-foreground',
  },
  {
    title: 'My Books',
    description: 'View borrowed & favorites',
    icon: BookHeart,
    href: '/my-books',
    color: 'bg-accent-orange/10 text-accent-orange',
    hoverColor: 'group-hover:bg-accent-orange group-hover:text-white',
  },
  {
    title: 'Challenges',
    description: 'Join reading challenges',
    icon: Trophy,
    href: '/challenges',
    color: 'bg-accent-gold/10 text-accent-gold',
    hoverColor: 'group-hover:bg-accent-gold group-hover:text-accent-gold-foreground',
  },
  {
    title: 'Suggest a Book',
    description: 'Recommend new books',
    icon: Lightbulb,
    href: '/suggest',
    color: 'bg-accent-green/10 text-accent-green',
    hoverColor: 'group-hover:bg-accent-green group-hover:text-white',
  },
  {
    title: 'Resources',
    description: 'eBooks & newspapers',
    icon: BookOpen,
    href: '/resources',
    color: 'bg-primary/10 text-primary',
    hoverColor: 'group-hover:bg-primary group-hover:text-primary-foreground',
  },
  {
    title: 'Need Help?',
    description: 'Contact the library',
    icon: HelpCircle,
    href: '/contact',
    color: 'bg-muted text-muted-foreground',
    hoverColor: 'group-hover:bg-foreground group-hover:text-background',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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

        <motion.div 
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div key={action.title} variants={itemVariants}>
                <Link
                  to={action.href}
                  className="group flex flex-col items-center p-6 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 text-center h-full"
                >
                  <div className={`rounded-xl p-3 mb-3 ${action.color} ${action.hoverColor} transition-all duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}