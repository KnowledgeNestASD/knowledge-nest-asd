import { useState, useEffect } from 'react';
import { Bell, BookOpen, Trophy, MessageSquare, Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  type: 'overdue' | 'due_soon' | 'challenge' | 'review';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setIsLoading(true);

    const notifs: Notification[] = [];

    // Fetch overdue books
    const { data: overdueBooks } = await supabase
      .from('borrowing_records')
      .select('*, book:books(title)')
      .eq('user_id', user.id)
      .eq('status', 'overdue')
      .limit(5);

    if (overdueBooks) {
      overdueBooks.forEach(record => {
        notifs.push({
          id: `overdue-${record.id}`,
          type: 'overdue',
          title: 'Book Overdue',
          message: `"${record.book?.title}" is overdue`,
          time: 'Now',
          read: false,
        });
      });
    }

    // Fetch books due soon (within 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const { data: dueSoonBooks } = await supabase
      .from('borrowing_records')
      .select('*, book:books(title)')
      .eq('user_id', user.id)
      .eq('status', 'borrowed')
      .lte('due_date', threeDaysFromNow.toISOString())
      .limit(5);

    if (dueSoonBooks) {
      dueSoonBooks.forEach(record => {
        const daysLeft = Math.ceil((new Date(record.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0) {
          notifs.push({
            id: `due-${record.id}`,
            type: 'due_soon',
            title: 'Due Soon',
            message: `"${record.book?.title}" due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
            time: `${daysLeft}d`,
            read: false,
          });
        }
      });
    }

    // Fetch pending review status
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*, book:books(title)')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .order('moderated_at', { ascending: false })
      .limit(3);

    if (reviews) {
      reviews.forEach(review => {
        notifs.push({
          id: `review-${review.id}`,
          type: 'review',
          title: 'Review Approved',
          message: `Your review for "${review.book?.title}" was approved`,
          time: 'Recent',
          read: true,
        });
      });
    }

    setNotifications(notifs);
    setIsLoading(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'overdue': return <Clock className="h-4 w-4 text-destructive" />;
      case 'due_soon': return <BookOpen className="h-4 w-4 text-accent-orange" />;
      case 'challenge': return <Trophy className="h-4 w-4 text-accent-gold" />;
      case 'review': return <MessageSquare className="h-4 w-4 text-accent-green" />;
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-popover">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 cursor-pointer',
                  !notification.read && 'bg-primary/5'
                )}
              >
                <div className="mt-0.5">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', !notification.read && 'font-medium')}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {notification.message}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {notification.time}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-primary">
                View All Notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
