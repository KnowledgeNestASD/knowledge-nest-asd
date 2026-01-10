import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, User, LogIn, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

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
  const { user, profile, isLibrarian, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-lg font-bold text-foreground">
              Ambassador Library
            </p>
            <p className="text-xs text-muted-foreground">Dubai</p>
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
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {profile?.full_name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                  </div>
                  <span className="max-w-[120px] truncate">
                    {profile?.full_name || 'My Account'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                <DropdownMenuItem asChild>
                  <Link to="/my-books">My Books</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                {isLibrarian && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="text-primary font-medium">
                        Librarian Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button className="gap-2">
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
                  {isLibrarian && (
                    <Link
                      to="/dashboard"
                      className="block rounded-lg px-3 py-2 text-base font-medium text-primary hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Librarian Dashboard
                    </Link>
                  )}
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
