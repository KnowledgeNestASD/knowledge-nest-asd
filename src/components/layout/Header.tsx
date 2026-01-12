import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, User, LogIn, ChevronDown, LayoutDashboard, Library, GraduationCap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationDropdown } from '@/components/layout/NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import ambassadorLogo from '@/assets/ambassador-logo.png';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Catalogue', href: '/catalogue' },
  { name: 'Challenges', href: '/challenges' },
  { name: 'Events', href: '/events' },
  { name: 'News', href: '/news' },
  { name: 'Resources', href: '/resources' },
  { name: 'About', href: '/about' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, isLibrarian, isTeacher, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Determine the correct dashboard link based on role
  const getDashboardLink = () => {
    if (isLibrarian) return '/dashboard';
    if (isTeacher) return '/teacher-dashboard';
    return '/my-dashboard';
  };

  const getDashboardLabel = () => {
    if (isLibrarian) return 'Control Panel';
    if (isTeacher) return 'Teacher Dashboard';
    return 'My Dashboard';
  };

  const getRoleBadge = () => {
    if (isLibrarian) return { label: 'Librarian', icon: Shield, variant: 'default' as const };
    if (isTeacher) return { label: 'Teacher', icon: GraduationCap, variant: 'secondary' as const };
    return null;
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full overflow-hidden bg-white shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
            <img 
              src={ambassadorLogo} 
              alt="Ambassador School Logo" 
              className="h-11 w-11 object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-xl font-bold text-foreground tracking-tight">
              Knowledge Nest
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              Ambassador School Dubai
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'nav-link text-sm',
                isActive(item.href) && 'active'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden lg:flex lg:items-center lg:gap-2">
          {user ? (
            <>
              {/* Role-specific dashboard button */}
              <Link to={getDashboardLink()}>
                <Button variant="ghost" size="sm" className={cn(
                  "gap-2",
                  (isLibrarian || isTeacher) && "text-primary font-medium"
                )}>
                  <LayoutDashboard className="h-4 w-4" />
                  {getDashboardLabel()}
                </Button>
              </Link>

              {/* Notifications */}
              <NotificationDropdown />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-orange text-primary-foreground">
                      {profile?.full_name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                    </div>
                    <span className="max-w-[120px] truncate">
                      {profile?.full_name || 'My Account'}
                    </span>
                    {roleBadge && (
                      <Badge variant={roleBadge.variant} className="text-[10px] px-1.5 py-0">
                        {roleBadge.label}
                      </Badge>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover">
                  {/* Show role indicator */}
                  {roleBadge && (
                    <>
                      <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
                        <roleBadge.icon className="h-3 w-3" />
                        Signed in as {roleBadge.label}
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Dashboard link - always shows role-appropriate dashboard */}
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()} className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      {getDashboardLabel()}
                    </Link>
                  </DropdownMenuItem>

                  {/* Student dashboard for staff (they might want to see student view) */}
                  {(isLibrarian || isTeacher) && (
                    <DropdownMenuItem asChild>
                      <Link to="/my-dashboard" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        My Reading Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link to="/my-books" className="flex items-center gap-2">
                      <Library className="h-4 w-4" />
                      My Library
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/login">
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden rounded-md p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-card">
          <div className="space-y-1 px-4 py-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'block rounded-lg px-3 py-2 text-base font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t pt-3 mt-3">
              {user ? (
                <>
                  {/* Role badge for mobile */}
                  {roleBadge && (
                    <div className="px-3 py-2 mb-2">
                      <Badge variant={roleBadge.variant} className="gap-1">
                        <roleBadge.icon className="h-3 w-3" />
                        {roleBadge.label}
                      </Badge>
                    </div>
                  )}

                  {/* Role-appropriate dashboard */}
                  <Link
                    to={getDashboardLink()}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-primary hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {getDashboardLabel()}
                  </Link>

                  <Link
                    to="/my-books"
                    className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Books
                  </Link>
                  <Link
                    to="/profile"
                    className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left rounded-lg px-3 py-2 text-base font-medium text-destructive hover:bg-muted"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-primary hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
