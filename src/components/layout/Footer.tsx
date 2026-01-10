import { Link } from 'react-router-dom';
import { Feather, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-primary to-primary/95 text-primary-foreground">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground shadow-lg">
                <Feather className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-display text-xl font-bold">Knowledge Nest</p>
                <p className="text-xs text-primary-foreground/70">Ambassador School Dubai</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Inspiring a love for reading and learning in every student. Your gateway to knowledge and imagination.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <Heart className="h-4 w-4 text-accent-gold" />
              <span>Where Readers Flourish</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-display font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/catalogue" className="hover:text-primary-foreground transition-colors hover:pl-1 duration-200">
                  Book Catalogue
                </Link>
              </li>
              <li>
                <Link to="/challenges" className="hover:text-primary-foreground transition-colors hover:pl-1 duration-200">
                  Reading Challenges
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-primary-foreground transition-colors hover:pl-1 duration-200">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-primary-foreground transition-colors hover:pl-1 duration-200">
                  Online Resources
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-foreground transition-colors hover:pl-1 duration-200">
                  About the Library
                </Link>
              </li>
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h3 className="mb-4 font-display font-semibold text-lg">For Students</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/my-books" className="hover:text-primary-foreground transition-colors hover:pl-1 duration-200">
                  My Borrowed Books
                </Link>
              </li>
              <li>
                <Link to="/suggest" className="hover:text-primary-foreground transition-colors hover:pl-1 duration-200">
                  Suggest a Book
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-foreground transition-colors hover:pl-1 duration-200">
                  Contact & Help
                </Link>
              </li>
              <li>
                <Link to="/about#policies" className="hover:text-primary-foreground transition-colors hover:pl-1 duration-200">
                  Library Policies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-display font-semibold text-lg">Contact Us</h3>
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
            <div className="mt-4 flex gap-3">
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-accent-gold hover:text-accent-gold-foreground transition-all duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-accent-gold hover:text-accent-gold-foreground transition-all duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-accent-gold hover:text-accent-gold-foreground transition-all duration-300">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Knowledge Nest · Ambassador School Dubai Library. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-accent-gold" /> for readers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}