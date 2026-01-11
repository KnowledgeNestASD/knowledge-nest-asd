import { useState, useEffect } from 'react';
import { Loader2, Check, X, MessageSquare, Clock, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface Suggestion {
  id: string;
  book_title: string;
  author: string | null;
  reason: string | null;
  status: 'pending' | 'reviewed' | 'approved' | 'acquired' | 'rejected';
  notes: string | null;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; email: string } | null;
}

const statusConfig = {
  pending: { color: 'bg-accent-gold/10 text-accent-gold', label: 'Pending' },
  reviewed: { color: 'bg-primary/10 text-primary', label: 'Reviewed' },
  approved: { color: 'bg-accent-green/10 text-accent-green', label: 'Approved' },
  acquired: { color: 'bg-accent-green/10 text-accent-green', label: 'Acquired' },
  rejected: { color: 'bg-destructive/10 text-destructive', label: 'Rejected' },
};

export function SuggestionsManagement() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('suggestions')
      .select('*, profiles!suggestions_user_id_fkey(full_name, email)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSuggestions(data as any);
    }
    setIsLoading(false);
  };

  const openReviewModal = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setNewStatus(suggestion.status);
    setNotes(suggestion.notes || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedSuggestion || !newStatus) return;

    setIsSaving(true);

    const { error } = await supabase
      .from('suggestions')
      .update({
        status: newStatus as any,
        notes: notes.trim() || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq('id', selectedSuggestion.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update suggestion', variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: 'Suggestion status updated' });
      setSelectedSuggestion(null);
      fetchSuggestions();
    }

    setIsSaving(false);
  };

  const filteredSuggestions = filter === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.status === filter);

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold">Book Suggestions</h2>
          {pendingCount > 0 && (
            <Badge className="bg-accent-gold/10 text-accent-gold">
              {pendingCount} pending
            </Badge>
          )}
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="acquired">Acquired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Book className="h-12 w-12 mx-auto mb-2 opacity-50" />
          No suggestions found.
        </div>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Suggested By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuggestions.map((suggestion) => (
                <TableRow key={suggestion.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{suggestion.book_title}</p>
                      {suggestion.author && (
                        <p className="text-sm text-muted-foreground">by {suggestion.author}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {suggestion.profiles?.full_name || suggestion.profiles?.email || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(suggestion.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[suggestion.status].color}>
                      {statusConfig[suggestion.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openReviewModal(suggestion)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Review Modal */}
      <Dialog open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Suggestion</DialogTitle>
          </DialogHeader>
          
          {selectedSuggestion && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold">{selectedSuggestion.book_title}</h3>
                {selectedSuggestion.author && (
                  <p className="text-sm text-muted-foreground">by {selectedSuggestion.author}</p>
                )}
                {selectedSuggestion.reason && (
                  <p className="text-sm mt-2 pt-2 border-t border-border">
                    <span className="font-medium">Reason:</span> {selectedSuggestion.reason}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Update Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="acquired">Acquired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes for Student (optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note explaining the decision..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedSuggestion(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatus} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Update'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}