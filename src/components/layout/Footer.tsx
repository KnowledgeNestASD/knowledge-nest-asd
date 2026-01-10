import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-display text-lg font-bold">Ambassador Library</p>
                <p className="text-xs text-primary-foreground/70">Dubai</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Inspiring a love for reading and learning in every student at Ambassador School Dubai.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/catalogue" className="hover:text-primary-foreground transition-colors">
                  Book Catalogue
                </Link>
              </li>
              <li>
                <Link to="/challenges" className="hover:text-primary-foreground transition-colors">
                  Reading Challenges
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-primary-foreground transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-primary-foreground transition-colors">
                  Online Resources
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-foreground transition-colors">
                  About the Library
                </Link>
              </li>
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h3 className="mb-4 font-semibold">For Students</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/my-books" className="hover:text-primary-foreground transition-colors">
                  My Borrowed Books
                </Link>
              </li>
              <li>
                <Link to="/suggest" className="hover:text-primary-foreground transition-colors">
                  Suggest a Book
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-foreground transition-colors">
                  Contact & Help
                </Link>
              </li>
              <li>
                <Link to="/about#policies" className="hover:text-primary-foreground transition-colors">
                  Library Policies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold">Contact Us</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Ambassador School Dubai, UAE</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:library@ambassadorschool.ae" className="hover:text-primary-foreground transition-colors">
                  library@ambassadorschool.ae
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+971 4 XXX XXXX</span>
              </li>
            </ul>
            <div className="mt-4 flex gap-4">
              <a href="#" className="hover:text-accent-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent-gold transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/20 pt-6 text-center text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Ambassador School Dubai Library. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
