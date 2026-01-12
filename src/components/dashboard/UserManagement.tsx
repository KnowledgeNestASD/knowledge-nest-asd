import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Users, Search, Shield, GraduationCap, BookOpen, Loader2 } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animated-container';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  class_name: string | null;
  house_name: string | null;
  role: AppRole;
}

export function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('student');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    
    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    if (profilesError) {
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    // Fetch all roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) {
      toast({ title: 'Error', description: 'Failed to fetch roles', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    // Combine profiles with roles
    const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
      const userRole = roles?.find(r => r.user_id === profile.user_id);
      return {
        ...profile,
        role: userRole?.role || 'student',
      };
    });

    setUsers(usersWithRoles);
    setIsLoading(false);
  };

  const handleRoleChange = async () => {
    if (!editingUser) return;
    
    setIsUpdating(true);
    
    // Check if user already has a role entry
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', editingUser.user_id)
      .single();

    let error;
    if (existingRole) {
      // Update existing role
      const result = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', editingUser.user_id);
      error = result.error;
    } else {
      // Insert new role
      const result = await supabase
        .from('user_roles')
        .insert({ user_id: editingUser.user_id, role: newRole });
      error = result.error;
    }

    if (error) {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Role updated to ${newRole}` });
      fetchUsers();
    }
    
    setIsUpdating(false);
    setEditingUser(null);
  };

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case 'librarian': return <Shield className="h-3 w-3" />;
      case 'teacher': return <GraduationCap className="h-3 w-3" />;
      default: return <BookOpen className="h-3 w-3" />;
    }
  };

  const getRoleVariant = (role: AppRole) => {
    switch (role) {
      case 'librarian': return 'default' as const;
      case 'teacher': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    librarians: users.filter(u => u.role === 'librarian').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-primary' },
          { label: 'Students', value: stats.students, icon: BookOpen, color: 'text-accent-green' },
          { label: 'Teachers', value: stats.teachers, icon: GraduationCap, color: 'text-accent-orange' },
          { label: 'Librarians', value: stats.librarians, icon: Shield, color: 'text-accent-gold' },
        ].map((stat, i) => (
          <AnimatedCard key={stat.label} delay={i * 0.1} className="bg-card rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter role" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="teacher">Teachers</SelectItem>
            <SelectItem value="librarian">Librarians</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>House</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || 'Unknown'}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>{user.class_name || '-'}</TableCell>
                    <TableCell>{user.house_name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleVariant(user.role)} className="gap-1">
                        {getRoleIcon(user.role)}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setNewRole(user.role);
                        }}
                      >
                        Change Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Role Change Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {editingUser?.full_name || editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={(val) => setNewRole(val as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="student">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Student
                  </div>
                </SelectItem>
                <SelectItem value="teacher">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Teacher
                  </div>
                </SelectItem>
                <SelectItem value="librarian">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Librarian
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {newRole === 'librarian' && '⚠️ Librarians have full access to manage all library resources.'}
              {newRole === 'teacher' && '📚 Teachers can create class challenges and view student progress.'}
              {newRole === 'student' && '📖 Students can borrow books and participate in challenges.'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={handleRoleChange} disabled={isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
