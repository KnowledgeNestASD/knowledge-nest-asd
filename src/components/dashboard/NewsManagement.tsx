import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Pin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string | null;
  is_pinned: boolean;
  published_at: string;
  image_url: string | null;
}

const categories = ['New Arrivals', 'Notice', 'Upcoming Activities', 'General'];

export function NewsManagement() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('General');
  const [isPinned, setIsPinned] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false });

    if (!error && data) {
      setNews(data);
    }
    setIsLoading(false);
  };

  const openModal = (item?: NewsItem) => {
    if (item) {
      setEditingNews(item);
      setTitle(item.title);
      setContent(item.content);
      setCategory(item.category || 'General');
      setIsPinned(item.is_pinned);
    } else {
      setEditingNews(null);
      setTitle('');
      setContent('');
      setCategory('General');
      setIsPinned(false);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);

    const newsData = {
      title: title.trim(),
      content: content.trim(),
      category,
      is_pinned: isPinned,
      created_by: user?.id,
    };

    if (editingNews) {
      const { error } = await supabase
        .from('news')
        .update(newsData)
        .eq('id', editingNews.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update news', variant: 'destructive' });
      } else {
        toast({ title: 'Updated', description: 'News article updated successfully' });
        setModalOpen(false);
        fetchNews();
      }
    } else {
      const { error } = await supabase.from('news').insert(newsData);

      if (error) {
        toast({ title: 'Error', description: 'Failed to create news', variant: 'destructive' });
      } else {
        toast({ title: 'Created', description: 'News article published successfully' });
        setModalOpen(false);
        fetchNews();
      }
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('news').delete().eq('id', deleteId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete news', variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'News article removed' });
      fetchNews();
    }
    setDeleteId(null);
  };

  const togglePin = async (id: string, currentlyPinned: boolean) => {
    const { error } = await supabase
      .from('news')
      .update({ is_pinned: !currentlyPinned })
      .eq('id', id);

    if (!error) {
      fetchNews();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">News & Announcements</h2>
        <Button size="sm" onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-1" />
          Add News
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No news articles yet. Create your first announcement!
        </div>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Pinned</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {item.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.category || 'General'}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(item.published_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.is_pinned}
                      onCheckedChange={() => togglePin(item.id, item.is_pinned)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openModal(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingNews ? 'Edit News' : 'Create News'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the announcement content..."
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pin to Top</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch checked={isPinned} onCheckedChange={setIsPinned} />
                  <span className="text-sm text-muted-foreground">
                    {isPinned ? 'Pinned' : 'Not pinned'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : (editingNews ? 'Update' : 'Publish')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete News?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The news article will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}