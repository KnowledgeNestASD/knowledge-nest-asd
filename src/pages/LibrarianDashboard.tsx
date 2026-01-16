import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { 
  LayoutDashboard, BookOpen, Users, Trophy, Calendar, Newspaper, 
  Plus, ArrowLeftRight, MessageSquare, Lightbulb, 
  FileText, Edit, Trash2, Download, Globe, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/ui/stat-card';
import { AnimatedCard } from '@/components/ui/animated-container';
import { AddEditBookModal } from '@/components/dashboard/AddEditBookModal';
import { CirculationPanel } from '@/components/dashboard/CirculationPanel';
import { ReviewModeration } from '@/components/dashboard/ReviewModeration';
import { ChallengesManagement } from '@/components/dashboard/ChallengesManagement';
import { NewsManagement } from '@/components/dashboard/NewsManagement';
import { EventsManagement } from '@/components/dashboard/EventsManagement';
import { SuggestionsManagement } from '@/components/dashboard/SuggestionsManagement';
import { UserManagement } from '@/components/dashboard/UserManagement';
import { ResourcesManagement } from '@/components/dashboard/ResourcesManagement';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { generatePDF } from '@/lib/pdf-export';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LibrarianDashboard = () => {
  const { user, isLibrarian } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ books: 0, loans: 0, overdue: 0, reviews: 0, users: 0, resources: 0 });
  const [books, setBooks] = useState<any[]>([]);
  const [_isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);

  useEffect(() => {
    if (isLibrarian) fetchDashboardData();
  }, [isLibrarian]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const [booksRes, loansRes, overdueRes, reviewsRes, usersRes, resourcesRes] = await Promise.all([
      supabase.from('books').select('id', { count: 'exact', head: true }),
      supabase.from('borrowing_records').select('id', { count: 'exact', head: true }).eq('status', 'borrowed'),
      supabase.from('borrowing_records').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('online_resources').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      books: booksRes.count || 0,
      loans: loansRes.count || 0,
      overdue: overdueRes.count || 0,
      reviews: reviewsRes.count || 0,
      users: usersRes.count || 0,
      resources: resourcesRes.count || 0,
    });
    setIsLoading(false);
  };

  const fetchBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('*, category:categories(name), genre:genres(name)')
      .order('created_at', { ascending: false })
      .limit(100);
    setBooks(data || []);
  };

  useEffect(() => {
    if (activeTab === 'books') fetchBooks();
  }, [activeTab]);

  const handleDeleteBook = async () => {
    if (!deleteBookId) return;
    const { error } = await supabase.from('books').delete().eq('id', deleteBookId);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete book', variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Book removed successfully' });
      fetchBooks();
    }
    setDeleteBookId(null);
  };

  const exportBooks = () => {
    generatePDF({
      title: 'Book Catalogue Report',
      subtitle: `Total: ${books.length} books`,
      generatedBy: 'Librarian',
      data: books,
      columns: [
        { header: 'Title', key: 'title' },
        { header: 'Author', key: 'author' },
        { header: 'Status', key: 'status' },
        { header: 'Copies', key: 'total_copies' },
        { header: 'Available', key: 'available_copies' },
      ],
    });
  };

  if (!user || !isLibrarian) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <LayoutDashboard className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Access Restricted</h1>
          <p className="text-muted-foreground mb-6">Librarian access required</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </Layout>
    );
  }

  const tabItems = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard },
    { value: 'books', label: 'Books', icon: BookOpen },
    { value: 'circulation', label: 'Circulation', icon: ArrowLeftRight },
    { value: 'reviews', label: 'Reviews', icon: MessageSquare },
    { value: 'challenges', label: 'Challenges', icon: Trophy },
    { value: 'news', label: 'News', icon: Newspaper },
    { value: 'events', label: 'Events', icon: Calendar },
    { value: 'suggestions', label: 'Suggestions', icon: Lightbulb },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'resources', label: 'Resources', icon: Globe },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Librarian Control Panel</h1>
              <p className="text-muted-foreground">Full access to manage library resources</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 mb-8">
          <StatCard title="Total Books" value={stats.books} icon={BookOpen} iconColor="text-primary" iconBg="bg-primary/10" />
          <StatCard title="Active Loans" value={stats.loans} icon={ArrowLeftRight} iconColor="text-accent-orange" iconBg="bg-accent-orange/10" />
          <StatCard title="Overdue" value={stats.overdue} icon={Calendar} iconColor="text-destructive" iconBg="bg-destructive/10" />
          <StatCard title="Pending Reviews" value={stats.reviews} icon={MessageSquare} iconColor="text-accent-gold" iconBg="bg-accent-gold/10" />
          <StatCard title="Total Users" value={stats.users} icon={Users} iconColor="text-accent-green" iconBg="bg-accent-green/10" />
          <StatCard title="Resources" value={stats.resources} icon={Globe} iconColor="text-primary" iconBg="bg-primary/10" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6 overflow-x-auto">
            <TabsList className="inline-flex h-auto gap-1 p-1 bg-muted/50 rounded-xl">
              {tabItems.map((tab) => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-md whitespace-nowrap"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Add Book', desc: 'Add new books to catalogue', icon: Plus, onClick: () => { setEditingBook(null); setBookModalOpen(true); }, color: 'bg-primary/10 text-primary' },
                { title: 'Circulation', desc: 'Issue and return books', icon: ArrowLeftRight, onClick: () => setActiveTab('circulation'), color: 'bg-accent-orange/10 text-accent-orange' },
                { title: 'Reviews', desc: 'Moderate pending reviews', icon: MessageSquare, onClick: () => setActiveTab('reviews'), color: 'bg-accent-gold/10 text-accent-gold' },
                { title: 'Challenges', desc: 'Create reading challenges', icon: Trophy, onClick: () => setActiveTab('challenges'), color: 'bg-accent-green/10 text-accent-green' },
                { title: 'Manage Users', desc: 'Assign roles to users', icon: Shield, onClick: () => setActiveTab('users'), color: 'bg-primary/10 text-primary' },
                { title: 'News & Updates', desc: 'Create library news', icon: Newspaper, onClick: () => setActiveTab('news'), color: 'bg-accent-orange/10 text-accent-orange' },
                { title: 'Events', desc: 'Manage library events', icon: Calendar, onClick: () => setActiveTab('events'), color: 'bg-accent-gold/10 text-accent-gold' },
                { title: 'Suggestions', desc: 'Review book suggestions', icon: Lightbulb, onClick: () => setActiveTab('suggestions'), color: 'bg-accent-green/10 text-accent-green' },
                { title: 'Export Report', desc: 'Download library report', icon: FileText, onClick: exportBooks, color: 'bg-muted text-foreground' },
              ].map((item, i) => (
                <AnimatedCard key={item.title} delay={i * 0.05} className="bg-card rounded-xl p-5 shadow-sm border cursor-pointer hover:shadow-md hover:border-primary/30 transition-all" onClick={item.onClick}>
                  <div className={`inline-flex p-3 rounded-xl ${item.color} mb-3`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </AnimatedCard>
              ))}
            </div>
          </TabsContent>

          {/* Books */}
          <TabsContent value="books">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Book Management</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportBooks}><Download className="h-4 w-4 mr-1" />Export</Button>
                <Button size="sm" onClick={() => { setEditingBook(null); setBookModalOpen(true); }}><Plus className="h-4 w-4 mr-1" />Add Book</Button>
              </div>
            </div>
            <div className="border rounded-lg overflow-auto bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Copies</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.slice(0, 20).map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell><Badge variant="secondary">{book.status}</Badge></TableCell>
                      <TableCell>{book.available_copies}/{book.total_copies}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingBook(book); setBookModalOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteBookId(book.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Circulation */}
          <TabsContent value="circulation">
            <CirculationPanel />
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews">
            <ReviewModeration />
          </TabsContent>

          {/* Challenges - Full access for librarians */}
          <TabsContent value="challenges">
            <ChallengesManagement showOnlyMyChallenge={false} restrictToClass={false} />
          </TabsContent>

          {/* News */}
          <TabsContent value="news">
            <NewsManagement />
          </TabsContent>

          {/* Events */}
          <TabsContent value="events">
            <EventsManagement />
          </TabsContent>

          {/* Suggestions */}
          <TabsContent value="suggestions">
            <SuggestionsManagement />
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          {/* Resources */}
          <TabsContent value="resources">
            <ResourcesManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AddEditBookModal isOpen={bookModalOpen} onClose={() => setBookModalOpen(false)} book={editingBook} onSuccess={fetchBooks} />
      
      <AlertDialog open={!!deleteBookId} onOpenChange={() => setDeleteBookId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBook} className="bg-destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default LibrarianDashboard;
