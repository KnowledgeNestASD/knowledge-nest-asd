import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Feather, Mail, Lock, User, ArrowRight, GraduationCap, BookOpen, Library, Key, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type UserRole = 'student' | 'teacher' | 'librarian';

const roleConfig = {
  student: {
    icon: GraduationCap,
    title: 'Student',
    description: 'Access your books, join challenges, and track your reading journey.',
    color: 'from-accent-green to-accent-green/80',
    requiresId: false,
  },
  teacher: {
    icon: BookOpen,
    title: 'Teacher',
    description: 'Create challenges, monitor student progress, and inspire readers.',
    color: 'from-accent-orange to-accent-orange/80',
    requiresId: true,
    secretId: 'KN-AMB-X9F2-7A3C-T8Q',
  },
  librarian: {
    icon: Library,
    title: 'Librarian',
    description: 'Full access to manage books, users, events, and library operations.',
    color: 'from-primary to-primary/80',
    requiresId: true,
    secretId: 'KN-AMB-K4D8-QP91-L6M',
  },
};

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [idVerified, setIdVerified] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const verifyRoleId = () => {
    if (!selectedRole || selectedRole === 'student') return true;
    
    const config = roleConfig[selectedRole];
    if (config.requiresId && 'secretId' in config) {
      if (roleId === config.secretId) {
        setIdVerified(true);
        toast({
          title: 'ID Verified!',
          description: `${config.title} access code confirmed.`,
        });
        return true;
      } else {
        toast({
          title: 'Invalid ID',
          description: 'Please enter a valid access code.',
          variant: 'destructive',
        });
        return false;
      }
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in to Knowledge Nest.',
      });
      navigate('/');
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast({
        title: 'Select a role',
        description: 'Please select whether you are a Student, Teacher, or Librarian.',
        variant: 'destructive',
      });
      return;
    }

    // Verify role ID for teachers and librarians
    if (selectedRole !== 'student' && !idVerified) {
      toast({
        title: 'Verify your access code',
        description: 'Please verify your Teacher/Librarian ID first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Validate school email
    if (!signupEmail.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please use a valid email address.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(signupEmail, signupPassword, signupName);

    if (error) {
      toast({
        title: 'Signup failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Get the newly created user and assign role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_roles').insert({
        user_id: user.id,
        role: selectedRole,
      });
    }

    toast({
      title: 'Welcome to Knowledge Nest!',
      description: `Your ${roleConfig[selectedRole].title} account has been created.`,
    });
    navigate('/');

    setIsLoading(false);
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setIdVerified(false);
    setRoleId('');
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-accent-orange mb-4 shadow-lg shadow-primary/20">
              <Feather className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome to Knowledge Nest
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Your gateway to reading excellence at Ambassador School Dubai
            </p>
          </div>

          {/* Auth Tabs */}
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-14 rounded-none bg-muted/50">
                <TabsTrigger value="login" className="text-base data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-none h-full">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-base data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-none h-full">
                  Create Account
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="login" className="p-6 md:p-8">
                <form onSubmit={handleLogin} className="max-w-md mx-auto space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-base">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="your.email@ambassadorschool.ae"
                        className="pl-11 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-base">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pl-11 h-12"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-base gap-2 shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : (
                      <>
                        Sign In to Knowledge Nest
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="p-6 md:p-8">
                {/* Step 1: Role Selection */}
                <div className="mb-8">
                  <h3 className="font-display text-lg font-semibold text-center mb-4">
                    I am a...
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(Object.entries(roleConfig) as [UserRole, typeof roleConfig.student][]).map(([role, config]) => {
                      const Icon = config.icon;
                      const isSelected = selectedRole === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleRoleSelect(role)}
                          className={cn(
                            'relative p-5 rounded-xl border-2 text-left transition-all duration-300',
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div className={cn(
                            'inline-flex p-3 rounded-lg bg-gradient-to-br text-white mb-3',
                            config.color
                          )}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <h4 className="font-display font-semibold text-foreground">{config.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {config.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: ID Verification (for Teachers/Librarians) */}
                {selectedRole && selectedRole !== 'student' && !idVerified && (
                  <div className="mb-8 p-5 rounded-xl bg-muted/50 border border-border">
                    <h3 className="font-display font-semibold text-foreground flex items-center gap-2 mb-3">
                      <Key className="h-5 w-5 text-primary" />
                      {roleConfig[selectedRole].title} Access Code
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please enter your {roleConfig[selectedRole].title.toLowerCase()} access code to verify your role.
                    </p>
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value.toUpperCase())}
                        placeholder="KN-AMB-XXXX-XXXX-XXX"
                        className="h-12 font-mono tracking-wider"
                      />
                      <Button
                        type="button"
                        onClick={verifyRoleId}
                        className="h-12 px-6"
                      >
                        Verify
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Account Details */}
                {selectedRole && (selectedRole === 'student' || idVerified) && (
                  <form onSubmit={handleSignup} className="max-w-md mx-auto space-y-5">
                    {idVerified && (
                      <div className="p-3 rounded-lg bg-accent-green/10 border border-accent-green/20 flex items-center gap-2 text-accent-green">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {roleConfig[selectedRole].title} access verified!
                        </span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-base">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="Enter your full name"
                          className="pl-11 h-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-base">School Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="your.email@ambassadorschool.ae"
                          className="pl-11 h-12"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Use your Ambassador School email address
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-base">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Create a secure password"
                          className="pl-11 h-12"
                          minLength={6}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        At least 6 characters
                      </p>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base gap-2 shadow-lg shadow-primary/20" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : (
                        <>
                          Create {roleConfig[selectedRole].title} Account
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Guest Notice */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Want to browse first?{' '}
              <Link to="/catalogue" className="text-primary hover:underline font-medium">
                Explore our catalogue as a guest
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;