import { useState, useEffect } from 'react';
import { Search, BookOpen, User, Calendar, ArrowLeftRight, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BorrowingRecord {
  id: string;
  book_id: string;
  user_id: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: 'borrowed' | 'returned' | 'overdue';
  book?: { title: string; author: string };
  profile?: { full_name: string; email: string; class_name: string | null };
}

export function CirculationPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'issue' | 'return' | 'overdue'>('issue');
  const [isLoading, setIsLoading] = useState(false);
  const [borrowingRecords, setBorrowingRecords] = useState<BorrowingRecord[]>([]);
  
  // Issue form state
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string; email: string } | null>(null);
  const [selectedBook, setSelectedBook] = useState<{ id: string; title: string; author: string } | null>(null);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  });
  const [searchResults, setSearchResults] = useState<{ students: any[]; books: any[] }>({ students: [], books: [] });

  useEffect(() => {
    fetchBorrowingRecords();
  }, [activeTab]);

  const fetchBorrowingRecords = async () => {
    setIsLoading(true);
    let query = supabase
      .from('borrowing_records')
      .select('*, book:books(title, author)')
      .order('borrowed_at', { ascending: false });

    if (activeTab === 'overdue') {
      query = query.eq('status', 'overdue');
    } else if (activeTab === 'return') {
      query = query.in('status', ['borrowed', 'overdue']);
    }

    const { data, error } = await query.limit(50);

    if (!error && data) {
      // Fetch profile data for each record
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, class_name')
        .in('user_id', userIds);

      const recordsWithProfiles = data.map(record => ({
        ...record,
        profile: profiles?.find(p => p.user_id === record.user_id),
      }));

      setBorrowingRecords(recordsWithProfiles);
    }
    setIsLoading(false);
  };

  const searchStudents = async (query: string) => {
    if (query.length < 2) {
      setSearchResults(prev => ({ ...prev, students: [] }));
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(5);
    setSearchResults(prev => ({ ...prev, students: data || [] }));
  };

  const searchBooks = async (query: string) => {
    if (query.length < 2) {
      setSearchResults(prev => ({ ...prev, books: [] }));
      return;
    }
    const { data } = await supabase
      .from('books')
      .select('id, title, author, available_copies')
      .or(`title.ilike.%${query}%,isbn.ilike.%${query}%`)
      .gt('available_copies', 0)
      .limit(5);
    setSearchResults(prev => ({ ...prev, books: data || [] }));
  };

  const handleIssueBook = async () => {
    if (!selectedStudent || !selectedBook || !user) {
      toast({
        title: 'Missing Information',
        description: 'Please select both a student and a book',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Create borrowing record
    const { error: borrowError } = await supabase.from('borrowing_records').insert({
      book_id: selectedBook.id,
      user_id: selectedStudent.id,
      due_date: dueDate,
      issued_by: user.id,
    });

    if (borrowError) {
      toast({
        title: 'Issue Failed',
        description: borrowError.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Update book available copies
    const { data: bookData } = await supabase
      .from('books')
      .select('available_copies')
      .eq('id', selectedBook.id)
      .single();
    
    if (bookData && bookData.available_copies > 0) {
      await supabase
        .from('books')
        .update({ available_copies: bookData.available_copies - 1 })
        .eq('id', selectedBook.id);
    }

    toast({
      title: 'Book Issued',
      description: `"${selectedBook.title}" issued to ${selectedStudent.name}`,
    });

    // Reset form
    setSelectedStudent(null);
    setSelectedBook(null);
    setStudentSearch('');
    setBookSearch('');
    fetchBorrowingRecords();
    setIsLoading(false);
  };

  const handleReturnBook = async (recordId: string, bookId: string) => {
    setIsLoading(true);
    
    const { error } = await supabase
      .from('borrowing_records')
      .update({
        status: 'returned',
        returned_at: new Date().toISOString(),
      })
      .eq('id', recordId);

    if (error) {
      toast({
        title: 'Return Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      // Update book available copies
      const { data: book } = await supabase
        .from('books')
        .select('available_copies')
        .eq('id', bookId)
        .single();
      
      if (book) {
        await supabase
          .from('books')
          .update({ available_copies: book.available_copies + 1 })
          .eq('id', bookId);
      }

      toast({
        title: 'Book Returned',
        description: 'The book has been marked as returned',
      });
      fetchBorrowingRecords();
    }
    setIsLoading(false);
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { id: 'issue', label: 'Issue Book', icon: BookOpen },
          { id: 'return', label: 'Return Book', icon: ArrowLeftRight },
          { id: 'overdue', label: 'Overdue', icon: AlertTriangle },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Issue Book Form */}
      {activeTab === 'issue' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Student Search */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Select Student
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  searchStudents(e.target.value);
                }}
                className="pl-10"
              />
            </div>
            {searchResults.students.length > 0 && !selectedStudent && (
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {searchResults.students.map((student) => (
                  <button
                    key={student.user_id}
                    onClick={() => {
                      setSelectedStudent({
                        id: student.user_id,
                        name: student.full_name || student.email,
                        email: student.email,
                      });
                      setStudentSearch(student.full_name || student.email);
                      setSearchResults(prev => ({ ...prev, students: [] }));
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                  >
                    <p className="font-medium text-foreground">{student.full_name || 'No name'}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </button>
                ))}
              </div>
            )}
            {selectedStudent && (
              <Badge variant="secondary" className="gap-2">
                <Check className="h-3 w-3" />
                {selectedStudent.name}
              </Badge>
            )}
          </div>

          {/* Book Search */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Select Book
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or ISBN..."
                value={bookSearch}
                onChange={(e) => {
                  setBookSearch(e.target.value);
                  searchBooks(e.target.value);
                }}
                className="pl-10"
              />
            </div>
            {searchResults.books.length > 0 && !selectedBook && (
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {searchResults.books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedBook({
                        id: book.id,
                        title: book.title,
                        author: book.author,
                      });
                      setBookSearch(book.title);
                      setSearchResults(prev => ({ ...prev, books: [] }));
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                  >
                    <p className="font-medium text-foreground">{book.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {book.author} • {book.available_copies} available
                    </p>
                  </button>
                ))}
              </div>
            )}
            {selectedBook && (
              <Badge variant="secondary" className="gap-2">
                <Check className="h-3 w-3" />
                {selectedBook.title}
              </Badge>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Issue Button */}
          <div className="flex items-end">
            <Button
              onClick={handleIssueBook}
              disabled={!selectedStudent || !selectedBook || isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BookOpen className="h-4 w-4" />
              )}
              Issue Book
            </Button>
          </div>
        </motion.div>
      )}

      {/* Return / Overdue List */}
      {(activeTab === 'return' || activeTab === 'overdue') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : borrowingRecords.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {activeTab === 'overdue' ? 'No overdue books' : 'No active loans'}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Borrowed</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {borrowingRecords.map((record) => {
                    const daysOverdue = getDaysOverdue(record.due_date);
                    const isOverdue = daysOverdue > 0 && record.status !== 'returned';
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.book?.title || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{record.book?.author}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.profile?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{record.profile?.class_name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(record.borrowed_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(record.due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isOverdue ? 'destructive' : 'secondary'}
                            className={cn(
                              isOverdue && 'animate-pulse'
                            )}
                          >
                            {isOverdue ? `${daysOverdue}d overdue` : record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReturnBook(record.id, record.book_id)}
                            disabled={isLoading}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Return
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
