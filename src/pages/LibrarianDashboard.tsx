import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { 
  LayoutDashboard, BookOpen, Users, Trophy, Calendar, Newspaper, 
  Settings, Plus, ArrowLeftRight, MessageSquare, Lightbulb, 
  FileText, ChevronRight, Loader2, Edit, Trash2, Download, Globe, Shield
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
import { generatePDF, generateCSV } from '@/lib/pdf-export';
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
  const [stats, setStats] = useState({ books: 0, loans: 0, overdue: 0, reviews: 0 });
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);

  useEffect(() => {
    if (isLibrarian) fetchDashboardData();
  }, [isLibrarian]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const [booksRes, loansRes, overdueRes, reviewsRes] = await Promise.all([
      supabase.from('books').select('id', { count: 'exact', head: true }),
      supabase.from('borrowing_records').select('id', { count: 'exact', head: true }).eq('status', 'borrowed'),
      supabase.from('borrowing_records').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    setStats({
      books: booksRes.count || 0,
      loans: loansRes.count || 0,
      overdue: overdueRes.count || 0,
      reviews: reviewsRes.count || 0,
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold">Control Panel</h1>
          </div>
          <p className="text-muted-foreground mt-1">Manage library resources</p>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Total Books" value={stats.books} icon={BookOpen} iconColor="text-primary" iconBg="bg-primary/10" />
          <StatCard title="Active Loans" value={stats.loans} icon={ArrowLeftRight} iconColor="text-accent-orange" iconBg="bg-accent-orange/10" />
          <StatCard title="Overdue" value={stats.overdue} icon={Calendar} iconColor="text-destructive" iconBg="bg-destructive/10" />
          <StatCard title="Pending Reviews" value={stats.reviews} icon={MessageSquare} iconColor="text-accent-gold" iconBg="bg-accent-gold/10" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="circulation">Circulation</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Add Book', desc: 'Add new books to catalogue', icon: Plus, onClick: () => { setEditingBook(null); setBookModalOpen(true); } },
                { title: 'Circulation', desc: 'Issue and return books', icon: ArrowLeftRight, onClick: () => setActiveTab('circulation') },
                { title: 'Reviews', desc: 'Moderate pending reviews', icon: MessageSquare, onClick: () => setActiveTab('reviews') },
                { title: 'Challenges', desc: 'Create reading challenges', icon: Trophy, onClick: () => setActiveTab('challenges') },
                { title: 'Manage Users', desc: 'Assign roles to users', icon: Shield, onClick: () => setActiveTab('users') },
                { title: 'Export Report', desc: 'Download library report', icon: FileText, onClick: exportBooks },
              ].map((item, i) => (
                <AnimatedCard key={item.title} delay={i * 0.1} className="bg-card rounded-xl p-5 shadow-sm border cursor-pointer hover:shadow-md" onClick={item.onClick}>
                  <item.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </AnimatedCard>
              ))}
            </div>
          </TabsContent>

          {/* Books */}
          <TabsContent value="books">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Book Management</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportBooks}><Download className="h-4 w-4 mr-1" />Export</Button>
                <Button size="sm" onClick={() => { setEditingBook(null); setBookModalOpen(true); }}><Plus className="h-4 w-4 mr-1" />Add Book</Button>
              </div>
            </div>
            <div className="border rounded-lg overflow-auto">
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

          {/* Challenges */}
          <TabsContent value="challenges">
            <ChallengesManagement />
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
