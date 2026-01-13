import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, User, ArrowRight, GraduationCap, BookOpen, Library, 
  Key, CheckCircle, Eye, EyeOff, Sparkles, BookMarked
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ambassadorLogo from '@/assets/ambassador-logo.png';

type UserRole = 'student' | 'teacher' | 'librarian';

const roleConfig = {
  student: {
    icon: GraduationCap,
    title: 'Student',
    description: 'Access your books, join challenges, and track your reading journey.',
    gradient: 'from-accent-green to-accent-green/80',
    bgGradient: 'from-accent-green/10 to-accent-green/5',
    requiresId: false,
  },
  teacher: {
    icon: BookOpen,
    title: 'Teacher',
    description: 'Create challenges, monitor student progress, and inspire readers.',
    gradient: 'from-accent-orange to-accent-orange/80',
    bgGradient: 'from-accent-orange/10 to-accent-orange/5',
    requiresId: true,
    secretId: 'KN-AMB-X9F2-7A3C-T8Q',
  },
  librarian: {
    icon: Library,
    title: 'Librarian',
    description: 'Full access to manage books, users, events, and library operations.',
    gradient: 'from-primary to-primary/80',
    bgGradient: 'from-primary/10 to-primary/5',
    requiresId: true,
    secretId: 'KN-AMB-K4D8-QP91-L6M',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [idVerified, setIdVerified] = useState(false);
  
  const { signIn, signUp, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

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
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      }
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in to Knowledge Nest.',
      });
      // Navigation will be handled by useEffect
    }
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

    if (!signupName || !signupEmail || !signupPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(signupEmail, signupPassword, signupName, selectedRole);

    if (error) {
      let errorMessage = error.message;
      if (error.message.includes('already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      }
      toast({
        title: 'Signup failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: 'Welcome to Knowledge Nest!',
      description: `Your ${roleConfig[selectedRole].title} account has been created.`,
    });
    // Navigation will be handled by useEffect

    setIsLoading(false);
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setIdVerified(false);
    setRoleId('');
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <BookMarked className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 hero-pattern opacity-50" />
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1 }}
          className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent-orange/15 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-gold/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-5xl"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <Link to="/" className="inline-block">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                {/* Circular Logo Container */}
                <div className="h-24 w-24 rounded-full bg-card shadow-xl border-4 border-primary/20 flex items-center justify-center p-3 overflow-hidden">
                  <img 
                    src={ambassadorLogo} 
                    alt="Ambassador School Dubai" 
                    className="h-full w-full object-contain"
                  />
                </div>
              </motion.div>
            </Link>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Welcome to{' '}
              <span 
                className="font-extrabold bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(to right, #003D7A, #E65100, #CC8800)',
                }}
              >
                Knowledge Nest
              </span>
            </h1>
            <p className="text-foreground/80 text-lg max-w-md mx-auto font-medium">
              Your gateway to reading excellence at Ambassador School Dubai
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-card backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-primary/20 overflow-hidden"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="bg-gradient-to-r from-primary/10 via-accent-orange/10 to-accent-gold/10 border-b-2 border-primary/20">
                <TabsList className="grid w-full grid-cols-2 h-16 rounded-none bg-transparent gap-0">
                  <TabsTrigger 
                    value="login" 
                    className="text-lg font-bold data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none h-full transition-all text-foreground/70 data-[state=active]:text-primary"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="text-lg font-bold data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none h-full transition-all text-foreground/70 data-[state=active]:text-primary"
                  >
                    Create Account
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Sign In Tab */}
              <TabsContent value="login" className="p-8 md:p-12">
                <AnimatePresence mode="wait">
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleLogin}
                    className="max-w-md mx-auto space-y-6"
                  >
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-4 shadow-lg shadow-primary/30">
                        <Sparkles className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">Welcome Back!</h2>
                      <p className="text-foreground/70 mt-1 font-medium">Sign in to continue your reading journey</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-base font-semibold text-foreground">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
                        <Input
                          id="login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="your.email@ambassadorschool.ae"
                          className="pl-12 h-14 text-base border-2 border-border bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-base font-semibold text-foreground">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="pl-12 pr-12 h-14 text-base border-2 border-border bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 text-lg gap-2 shadow-lg shadow-primary/30 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all font-bold" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <BookMarked className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <>
                          Sign In to Knowledge Nest
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </motion.form>
                </AnimatePresence>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="p-8 md:p-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="signup-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {/* Step 1: Role Selection */}
                    <div className="mb-8">
                      <div className="text-center mb-6">
                        <h3 className="font-display text-xl font-bold text-foreground">
                          I am a...
                        </h3>
                        <p className="text-foreground/70 text-sm mt-1 font-medium">
                          Select your role to get started
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(Object.entries(roleConfig) as [UserRole, typeof roleConfig.student][]).map(([role, config]) => {
                          const Icon = config.icon;
                          const isSelected = selectedRole === role;
                          return (
                            <motion.button
                              key={role}
                              type="button"
                              onClick={() => handleRoleSelect(role)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={cn(
                                'relative p-6 rounded-2xl border-2 text-left transition-all duration-300',
                                isSelected
                                  ? 'border-primary bg-gradient-to-br shadow-lg shadow-primary/20'
                                  : 'border-border hover:border-primary/50 hover:bg-muted/50',
                                isSelected && config.bgGradient
                              )}
                            >
                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute top-3 right-3"
                                  >
                                    <CheckCircle className="h-6 w-6 text-primary" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              <div className={cn(
                                'inline-flex p-3 rounded-xl bg-gradient-to-br text-primary-foreground mb-4 shadow-lg',
                                config.gradient
                              )}>
                                <Icon className="h-7 w-7" />
                              </div>
                              <h4 className="font-display text-lg font-bold text-foreground">{config.title}</h4>
                              <p className="text-sm text-foreground/70 mt-2 line-clamp-2 font-medium">
                                {config.description}
                              </p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: ID Verification (for Teachers/Librarians) */}
                    <AnimatePresence>
                      {selectedRole && selectedRole !== 'student' && !idVerified && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-8 overflow-hidden"
                        >
                          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30">
                            <h3 className="font-display font-bold text-foreground flex items-center gap-2 mb-3">
                              <Key className="h-5 w-5 text-primary" />
                              {roleConfig[selectedRole].title} Access Code
                            </h3>
                            <p className="text-sm text-foreground/70 mb-4 font-medium">
                              Please enter your {roleConfig[selectedRole].title.toLowerCase()} access code to verify your role.
                            </p>
                            <div className="flex gap-3">
                              <Input
                                type="text"
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value.toUpperCase())}
                                placeholder="KN-AMB-XXXX-XXXX-XXX"
                                className="h-12 font-mono tracking-wider text-base border-2 border-primary/30 bg-card focus:border-primary"
                              />
                              <Button
                                type="button"
                                onClick={verifyRoleId}
                                className="h-12 px-8 font-bold"
                              >
                                Verify
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Step 3: Account Details */}
                    <AnimatePresence>
                      {selectedRole && (selectedRole === 'student' || idVerified) && (
                        <motion.form
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          onSubmit={handleSignup}
                          className="max-w-md mx-auto space-y-5"
                        >
                          {idVerified && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="p-4 rounded-xl bg-accent-green/15 border-2 border-accent-green/30 flex items-center gap-3"
                            >
                              <CheckCircle className="h-6 w-6 text-accent-green flex-shrink-0" />
                              <span className="text-sm font-bold text-accent-green">
                                {roleConfig[selectedRole].title} access verified!
                              </span>
                            </motion.div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="signup-name" className="text-base font-semibold text-foreground">Full Name</Label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
                              <Input
                                id="signup-name"
                                type="text"
                                value={signupName}
                                onChange={(e) => setSignupName(e.target.value)}
                                placeholder="Enter your full name"
                                className="pl-12 h-14 text-base border-2 border-border bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                required
                                autoComplete="name"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-email" className="text-base font-semibold text-foreground">School Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
                              <Input
                                id="signup-email"
                                type="email"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                placeholder="your.email@ambassadorschool.ae"
                                className="pl-12 h-14 text-base border-2 border-border bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                required
                                autoComplete="email"
                              />
                            </div>
                            <p className="text-xs text-foreground/60 pl-1 font-medium">
                              Use your Ambassador School email address
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-password" className="text-base font-semibold text-foreground">Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
                              <Input
                                id="signup-password"
                                type={showPassword ? 'text' : 'password'}
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                placeholder="Create a secure password"
                                className="pl-12 pr-12 h-14 text-base border-2 border-border bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                minLength={6}
                                required
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                            <p className="text-xs text-foreground/60 pl-1 font-medium">
                              At least 6 characters
                            </p>
                          </div>

                          <Button 
                            type="submit" 
                            className="w-full h-14 text-lg gap-2 shadow-lg shadow-primary/30 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all font-bold" 
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                <BookMarked className="h-5 w-5" />
                              </motion.div>
                            ) : (
                              <>
                                Create {roleConfig[selectedRole].title} Account
                                <ArrowRight className="h-5 w-5" />
                              </>
                            )}
                          </Button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Guest Notice */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-foreground/70 font-medium">
              Want to browse first?{' '}
              <Link 
                to="/catalogue" 
                className="text-primary hover:text-primary/80 font-bold inline-flex items-center gap-1 transition-colors"
              >
                Explore our catalogue as a guest
                <ArrowRight className="h-4 w-4" />
              </Link>
            </p>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-sm text-foreground/60 font-medium">
              © 2024 Ambassador School Dubai. All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
