import { Layout } from '@/components/layout/Layout';
import { BookOpen, Clock, Users, Mail, Phone, MapPin, Shield, Book, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl mb-4">
            About Our Library
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Welcome to the Ambassador School Dubai Library – a vibrant hub for learning, 
            discovery, and the joy of reading.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-primary/10 via-accent-orange/5 to-accent-gold/10 rounded-2xl p-8 lg:p-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our mission is to inspire a lifelong love of reading and learning in every student. 
              We provide a welcoming, resource-rich environment that supports academic excellence, 
              fosters creativity, and encourages exploration of diverse ideas and perspectives.
            </p>
          </div>
        </section>

        {/* Quick Info */}
        <section className="mb-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Library Hours</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex justify-between">
                  <span>Sunday - Thursday</span>
                  <span className="font-medium text-foreground">7:30 AM - 4:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Friday - Saturday</span>
                  <span className="text-muted-foreground">Closed</span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-accent-green/10">
                  <Book className="h-5 w-5 text-accent-green" />
                </div>
                <h3 className="font-semibold text-foreground">Our Collection</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex justify-between">
                  <span>Total Books</span>
                  <span className="font-medium text-foreground">5,000+</span>
                </li>
                <li className="flex justify-between">
                  <span>Digital Resources</span>
                  <span className="font-medium text-foreground">20+</span>
                </li>
                <li className="flex justify-between">
                  <span>Genres & Categories</span>
                  <span className="font-medium text-foreground">50+</span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-accent-orange/10">
                  <Users className="h-5 w-5 text-accent-orange" />
                </div>
                <h3 className="font-semibold text-foreground">Our Team</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>Head Librarian: Ms. Sarah Johnson</li>
                <li>Assistant Librarian: Mr. Ahmed Hassan</li>
                <li>Library Assistants: 3 staff members</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Policies */}
        <section id="policies" className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Library Policies & Guidelines
          </h2>
          
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Borrowing Rules</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">1</Badge>
                  <span>Students may borrow up to <strong className="text-foreground">3 books</strong> at a time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">2</Badge>
                  <span>Books may be borrowed for <strong className="text-foreground">2 weeks</strong> and can be renewed once if no one else has requested them.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">3</Badge>
                  <span>Reference books and magazines must be used within the library and cannot be borrowed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">4</Badge>
                  <span>Lost or damaged books must be reported immediately. Replacement costs may apply.</span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-accent-orange" />
                <h3 className="font-semibold text-foreground">Library Conduct</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent-green">✓</span>
                  <span>Maintain a quiet and respectful atmosphere for all library users.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green">✓</span>
                  <span>Food and drinks are not permitted in the library to protect our materials.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green">✓</span>
                  <span>Return borrowed materials on time to ensure availability for other readers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green">✓</span>
                  <span>Handle books and equipment with care – they are shared resources.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green">✓</span>
                  <span>Use electronic devices responsibly and for educational purposes only.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Contact the Library
          </h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <a 
              href="mailto:library@ambassadorschool.ae" 
              className="bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all text-center group"
            >
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
              <p className="text-sm text-muted-foreground">library@ambassadorschool.ae</p>
            </a>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-accent-green/10">
                  <Phone className="h-6 w-6 text-accent-green" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
              <p className="text-sm text-muted-foreground">+971 4 XXX XXXX (Ext. 123)</p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-accent-orange/10">
                  <MapPin className="h-6 w-6 text-accent-orange" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Visit Us</h3>
              <p className="text-sm text-muted-foreground">Ground Floor, Main Building</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
