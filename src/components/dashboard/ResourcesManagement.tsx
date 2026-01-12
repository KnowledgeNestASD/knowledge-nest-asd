import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Plus, Edit, Trash2, ExternalLink, Loader2, Globe, FileText, Video, Book } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animated-container';

interface OnlineResource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  resource_type: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

const resourceTypes = [
  { value: 'database', label: 'Database', icon: FileText },
  { value: 'ebook', label: 'E-Book Platform', icon: Book },
  { value: 'video', label: 'Video Resource', icon: Video },
  { value: 'website', label: 'Website', icon: Globe },
];

export function ResourcesManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<OnlineResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<OnlineResource | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    resource_type: 'website',
    image_url: '',
    is_active: true,
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('online_resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch resources', variant: 'destructive' });
    } else {
      setResources(data || []);
    }
    setIsLoading(false);
  };

  const openModal = (resource?: OnlineResource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        title: resource.title,
        description: resource.description || '',
        url: resource.url,
        resource_type: resource.resource_type,
        image_url: resource.image_url || '',
        is_active: resource.is_active,
      });
    } else {
      setEditingResource(null);
      setFormData({
        title: '',
        description: '',
        url: '',
        resource_type: 'website',
        image_url: '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      toast({ title: 'Error', description: 'Title and URL are required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    const payload = {
      ...formData,
      description: formData.description || null,
      image_url: formData.image_url || null,
      created_by: user?.id,
    };

    let error;
    if (editingResource) {
      const result = await supabase
        .from('online_resources')
        .update(payload)
        .eq('id', editingResource.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('online_resources')
        .insert(payload);
      error = result.error;
    }

    if (error) {
      toast({ title: 'Error', description: 'Failed to save resource', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: editingResource ? 'Resource updated' : 'Resource created' });
      setIsModalOpen(false);
      fetchResources();
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('online_resources')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete resource', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Resource deleted' });
      fetchResources();
    }
    setDeleteId(null);
  };

  const toggleActive = async (resource: OnlineResource) => {
    const { error } = await supabase
      .from('online_resources')
      .update({ is_active: !resource.is_active })
      .eq('id', resource.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } else {
      fetchResources();
    }
  };

  const getTypeIcon = (type: string) => {
    const resourceType = resourceTypes.find(t => t.value === type);
    return resourceType?.icon || Globe;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Online Resources</h2>
        <Button size="sm" onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-1" />
          Add Resource
        </Button>
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium mb-2">No resources yet</p>
          <Button onClick={() => openModal()}>Add Your First Resource</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource, i) => {
            const TypeIcon = getTypeIcon(resource.resource_type);
            return (
              <AnimatedCard key={resource.id} delay={i * 0.1} className="bg-card rounded-xl p-5 shadow-sm border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TypeIcon className="h-5 w-5 text-primary" />
                    <Badge variant={resource.is_active ? 'default' : 'secondary'}>
                      {resource.is_active ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
                
                <h3 className="font-semibold mb-1">{resource.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {resource.description || 'No description'}
                </p>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openModal(resource)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(resource.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingResource ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
            <DialogDescription>
              {editingResource ? 'Update the resource details.' : 'Add a new online resource for students.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Resource title"
              />
            </div>
            
            <div>
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.resource_type} onValueChange={(val) => setFormData({ ...formData, resource_type: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {resourceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Visible to students</Label>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingResource ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
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
