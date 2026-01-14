import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
type AppRole = 'student' | 'teacher' | 'librarian';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  class_name: string | null;
  house_name: string | null;
  managed_class: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isLibrarian: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role?: AppRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
      }
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, []);

  const fetchRoles = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (!error && data) {
        const userRoles = data.map((r) => r.role as AppRole);
        setRoles(userRoles);
        return userRoles;
      }
      return [];
    } catch (err) {
      console.error('Error fetching roles:', err);
      return [];
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
      await fetchRoles(user.id);
    }
  }, [user, fetchProfile, fetchRoles]);

  const loadUserData = useCallback(async (userId: string) => {
    await Promise.all([
      fetchProfile(userId),
      fetchRoles(userId)
    ]);
  }, [fetchProfile, fetchRoles]);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST (critical for proper session handling)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;

        // Synchronously update state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Defer Supabase calls to avoid deadlock
          setTimeout(() => {
            if (mounted) {
              loadUserData(currentSession.user.id).finally(() => {
                if (mounted) setIsLoading(false);
              });
            }
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!mounted) return;

      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        loadUserData(existingSession.user.id).finally(() => {
          if (mounted) {
            setIsLoading(false);
            setInitialized(true);
          }
        });
      } else {
        setIsLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { error: error as Error };
      }

      // The onAuthStateChange will handle updating the state
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: AppRole = 'student') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error: error as Error };
      }

      // If signup successful and we have a user, create profile and assign role
      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: data.user.id,
            email: email.trim().toLowerCase(),
            full_name: fullName,
          }, {
            onConflict: 'user_id'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast.error('Failed to create profile. Please contact support.');
        }

        // Assign role - this is critical for dashboard access
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: role,
          });

        if (roleError) {
          console.error('Error assigning role:', roleError);
          // Try upsert as fallback
          const { error: upsertError } = await supabase
            .from('user_roles')
            .upsert({
              user_id: data.user.id,
              role: role,
            }, {
              onConflict: 'user_id'
            });
          
          if (upsertError) {
            console.error('Error upserting role:', upsertError);
            toast.error(`Failed to assign ${role} role. Please contact the librarian.`);
          } else {
            console.log(`Successfully assigned ${role} role via upsert`);
          }
        } else {
          console.log(`Successfully assigned ${role} role`);
        }

        // Verify role was assigned
        const { data: verifyRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (verifyRole) {
          console.log('Verified role assignment:', verifyRole.role);
          toast.success(`Account created with ${verifyRole.role} role!`);
        } else {
          console.warn('Could not verify role assignment');
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
    }
  };

  const isLibrarian = roles.includes('librarian');
  const isTeacher = roles.includes('teacher');
  const isStudent = roles.includes('student');
  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        isLoading,
        isAuthenticated,
        isLibrarian,
        isTeacher,
        isStudent,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
