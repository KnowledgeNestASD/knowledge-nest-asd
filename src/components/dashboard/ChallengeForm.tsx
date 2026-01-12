import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const challengeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(50),
  description: z.string().max(200).optional(),
  challenge_type: z.enum(['book_count', 'genre_exploration', 'time_based', 'class_competition', 'house_competition']),
  target_count: z.number().min(1).optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  target_class: z.string().optional(),
  target_house: z.string().optional(),
  badge_name: z.string().max(30).optional(),
  badge_icon: z.string().max(4).optional(),
});

type ChallengeFormData = z.infer<typeof challengeSchema>;

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_count: number | null;
  start_date: string;
  end_date: string;
  target_class: string | null;
  target_house: string | null;
  badge_name: string | null;
  badge_icon: string | null;
}

interface ChallengeFormProps {
  isOpen: boolean;
  onClose: () => void;
  challenge?: Challenge | null;
  onSuccess: () => void;
  restrictToClass?: boolean; // For teachers - restrict to class challenges only
  defaultClass?: string | null; // Pre-fill class for teachers
}

const badgeEmojis = ['🏆', '📚', '🌟', '🎯', '🚀', '💎', '🔥', '⭐', '🏅', '🎖️', '👑', '🦁'];

export function ChallengeForm({ isOpen, onClose, challenge, onSuccess, restrictToClass = false, defaultClass }: ChallengeFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      challenge_type: 'book_count',
      target_count: 10,
      badge_icon: '🏆',
    },
  });

  const challengeType = watch('challenge_type');
  const selectedIcon = watch('badge_icon');

  useEffect(() => {
    if (challenge) {
      reset({
        title: challenge.title,
        description: challenge.description || '',
        challenge_type: challenge.challenge_type as any,
        target_count: challenge.target_count || 10,
        start_date: challenge.start_date.split('T')[0],
        end_date: challenge.end_date.split('T')[0],
        target_class: challenge.target_class || '',
        target_house: challenge.target_house || '',
        badge_name: challenge.badge_name || '',
        badge_icon: challenge.badge_icon || '🏆',
      });
    } else {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      reset({
        title: '',
        description: '',
        challenge_type: restrictToClass ? 'class_competition' : 'book_count',
        target_count: 10,
        start_date: today.toISOString().split('T')[0],
        end_date: nextMonth.toISOString().split('T')[0],
        target_class: defaultClass || '',
        badge_icon: '🏆',
      });
    }
  }, [challenge, reset, restrictToClass, defaultClass]);

  const onSubmit = async (data: ChallengeFormData) => {
    if (!user) return;
    setIsLoading(true);

    const challengeData = {
      title: data.title,
      description: data.description || null,
      challenge_type: data.challenge_type,
      target_count: data.target_count || null,
      start_date: data.start_date,
      end_date: data.end_date,
      target_class: data.target_class || null,
      target_house: data.target_house || null,
      badge_name: data.badge_name || null,
      badge_icon: data.badge_icon || null,
      created_by: challenge ? undefined : user.id,
    };

    let error;
    if (challenge) {
      const { error: updateError } = await supabase
        .from('challenges')
        .update(challengeData)
        .eq('id', challenge.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('challenges')
        .insert(challengeData);
      error = insertError;
    }

    if (error) {
      toast({
        title: 'Error',
        description: `Failed to ${challenge ? 'update' : 'create'} challenge: ${error.message}`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `Challenge ${challenge ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
      onClose();
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent-gold" />
            {challenge ? 'Edit Challenge' : 'Create Challenge'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., January Reading Marathon"
              maxLength={50}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description (max 200 characters)"
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Challenge Type */}
          <div className="space-y-2">
            <Label>Challenge Type *</Label>
            <Select
              value={challengeType}
              onValueChange={(value) => setValue('challenge_type', value as any)}
              disabled={restrictToClass}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {!restrictToClass && <SelectItem value="book_count">Book Count</SelectItem>}
                {!restrictToClass && <SelectItem value="genre_exploration">Genre Explorer</SelectItem>}
                {!restrictToClass && <SelectItem value="time_based">Time-Based</SelectItem>}
                <SelectItem value="class_competition">Class Competition</SelectItem>
                <SelectItem value="house_competition">House Competition</SelectItem>
              </SelectContent>
            </Select>
            {restrictToClass && (
              <p className="text-xs text-muted-foreground mt-1">
                As a teacher, you can only create class or house competitions.
              </p>
            )}
          </div>

          {/* Target Count */}
          <div className="space-y-2">
            <Label htmlFor="target_count">Target Count</Label>
            <Input
              id="target_count"
              type="number"
              {...register('target_count', { valueAsNumber: true })}
              min={1}
              placeholder="Number of books to read"
            />
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
              />
              {errors.start_date && (
                <p className="text-xs text-destructive">{errors.start_date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
              />
              {errors.end_date && (
                <p className="text-xs text-destructive">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          {/* Target Class/House */}
          {(challengeType === 'class_competition' || challengeType === 'house_competition') && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target_class">Target Class</Label>
                <Input
                  id="target_class"
                  {...register('target_class')}
                  placeholder="e.g., Grade 8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_house">Target House</Label>
                <Input
                  id="target_house"
                  {...register('target_house')}
                  placeholder="e.g., Phoenix"
                />
              </div>
            </div>
          )}

          {/* Badge */}
          <div className="space-y-2">
            <Label>Badge</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                {...register('badge_name')}
                placeholder="Badge name"
                maxLength={30}
              />
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {badgeEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setValue('badge_icon', emoji)}
                      className={`text-xl p-2 rounded-lg transition-all ${
                        selectedIcon === emoji
                          ? 'bg-primary/20 ring-2 ring-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : challenge ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
