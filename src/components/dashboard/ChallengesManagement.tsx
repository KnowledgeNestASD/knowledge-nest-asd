import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChallengeForm } from './ChallengeForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Plus, Edit, Trash2, Users, Target, Loader2, Trophy } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animated-container';
import { format } from 'date-fns';

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_count: number | null;
  target_class: string | null;
  target_house: string | null;
  badge_name: string | null;
  badge_icon: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string | null;
  challenge_participants: { count: number }[];
}

interface ChallengesManagementProps {
  showOnlyMyChallenge?: boolean; // For teachers - only show their challenges
  restrictToClass?: boolean; // For teachers - restrict creation to class challenges
}

export function ChallengesManagement({ showOnlyMyChallenge = false, restrictToClass = false }: ChallengesManagementProps) {
  const { user, isLibrarian, profile } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setIsLoading(true);
    
    let query = supabase
      .from('challenges')
      .select('*, challenge_participants(count)')
      .order('created_at', { ascending: false });

    // Teachers only see their own challenges
    if (showOnlyMyChallenge && user) {
      query = query.eq('created_by', user.id);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch challenges', variant: 'destructive' });
    } else {
      setChallenges(data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete challenge', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Challenge deleted' });
      fetchChallenges();
    }
    setDeleteId(null);
  };

  const openModal = (challenge?: Challenge) => {
    setEditingChallenge(challenge || null);
    setIsModalOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default' as const;
      case 'completed': return 'secondary' as const;
      case 'cancelled': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  const canEdit = (challenge: Challenge) => {
    if (isLibrarian) return true;
    return challenge.created_by === user?.id;
  };

  const stats = {
    total: challenges.length,
    active: challenges.filter(c => c.status === 'active').length,
    totalParticipants: challenges.reduce((sum, c) => sum + (c.challenge_participants?.[0]?.count || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <AnimatedCard delay={0} className="bg-card rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-accent-gold" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Challenges</p>
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={0.1} className="bg-card rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-accent-green" />
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={0.2} className="bg-card rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.totalParticipants}</p>
              <p className="text-xs text-muted-foreground">Total Participants</p>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">
          {showOnlyMyChallenge ? 'My Challenges' : 'All Challenges'}
        </h2>
        <Button size="sm" onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-1" />
          Create Challenge
        </Button>
      </div>

      {/* Challenges Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium mb-2">No challenges yet</p>
          <Button onClick={() => openModal()}>Create Your First Challenge</Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Challenge</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {challenges.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{challenge.badge_icon || '🏆'}</span>
                      <span className="font-medium">{challenge.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{challenge.challenge_type.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    {challenge.target_class && <span className="text-sm">Class: {challenge.target_class}</span>}
                    {challenge.target_house && <span className="text-sm">House: {challenge.target_house}</span>}
                    {challenge.target_count && <span className="text-sm">{challenge.target_count} books</span>}
                  </TableCell>
                  <TableCell>{challenge.challenge_participants?.[0]?.count || 0}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(challenge.status)}>
                      {challenge.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(challenge.start_date), 'MMM d')} - {format(new Date(challenge.end_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    {canEdit(challenge) && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openModal(challenge)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(challenge.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Challenge Form Modal */}
      <ChallengeForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        challenge={editingChallenge}
        onSuccess={fetchChallenges}
        restrictToClass={restrictToClass}
        defaultClass={restrictToClass ? profile?.class_name : undefined}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also remove all participant data. This action cannot be undone.
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
