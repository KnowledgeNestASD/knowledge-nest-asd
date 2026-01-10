import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { LayoutDashboard, BookOpen, Users, Trophy, Calendar, Newspaper, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user, isLibrarian, isTeacher } = useAuth();
  const navigate = useNavigate();

  if (!user || (!isLibrarian && !isTeacher)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <LayoutDashboard className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Dashboard Access Required
            </h1>
            <p className="text-muted-foreground mb-6">
              This area is restricted to librarians and teachers.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const dashboardCards = [
    {
      title: 'Manage Books',
      description: 'Add, edit, or remove books from the catalogue',
      icon: BookOpen,
      color: 'bg-primary/10 text-primary',
      action: 'Manage',
    },
    {
      title: 'Users & Roles',
      description: 'View users and manage role assignments',
      icon: Users,
      color: 'bg-accent-green/10 text-accent-green',
      action: 'View',
      librarianOnly: true,
    },
    {
      title: 'Reading Challenges',
      description: 'Create and manage reading challenges',
      icon: Trophy,
      color: 'bg-accent-gold/10 text-accent-gold',
      action: 'Manage',
    },
    {
      title: 'Events',
      description: 'Schedule and manage library events',
      icon: Calendar,
      color: 'bg-accent-orange/10 text-accent-orange',
      action: 'Manage',
      librarianOnly: true,
    },
    {
      title: 'News & Announcements',
      description: 'Publish library news and updates',
      icon: Newspaper,
      color: 'bg-primary/10 text-primary',
      action: 'Publish',
      librarianOnly: true,
    },
    {
      title: 'Settings',
      description: 'Configure library settings and preferences',
      icon: Settings,
      color: 'bg-muted text-muted-foreground',
      action: 'Configure',
      librarianOnly: true,
    },
  ];

  const filteredCards = dashboardCards.filter(
    card => !card.librarianOnly || isLibrarian
  );

  // Quick stats (placeholder data)
  const stats = [
    { label: 'Total Books', value: '5,234', change: '+12 this week' },
    { label: 'Active Loans', value: '156', change: '23 overdue' },
    { label: 'Active Challenges', value: '5', change: '120 participants' },
    { label: 'Pending Reviews', value: '8', change: 'Awaiting moderation' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
              {isLibrarian ? 'Librarian Dashboard' : 'Teacher Dashboard'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage library resources and monitor activity
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all"
              >
                <div className={`inline-flex p-3 rounded-xl ${card.color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {card.description}
                </p>
                <Button variant="outline" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  {card.action}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 bg-muted/50 rounded-xl p-6 text-center">
          <p className="text-muted-foreground">
            Full dashboard functionality coming soon! This includes book management, 
            circulation tracking, review moderation, and more.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
