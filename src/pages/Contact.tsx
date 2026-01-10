import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HelpCircle, Mail, MessageSquare, Send, Book, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const faqs = [
  {
    question: 'How many books can I borrow at once?',
    answer: 'Students can borrow up to 3 books at a time. Each book can be kept for 2 weeks and renewed once if no one else has requested it.',
  },
  {
    question: 'What are the library hours?',
    answer: 'The library is open Sunday through Thursday from 7:30 AM to 4:00 PM. We are closed on Fridays and Saturdays.',
  },
  {
    question: 'How do I suggest a book for the library?',
    answer: 'You can suggest books through our "Suggest a Book" page. Simply provide the book title, author, and why you think it would be a great addition to our collection.',
  },
  {
    question: 'What happens if I lose or damage a book?',
    answer: 'Please report any lost or damaged books to the librarian immediately. You may be required to pay for replacement costs depending on the condition and availability of the book.',
  },
  {
    question: 'Can I renew my borrowed books online?',
    answer: 'Currently, book renewals must be done at the library desk. We are working on adding online renewal functionality soon!',
  },
  {
    question: 'How do I join a reading challenge?',
    answer: 'Visit the Challenges page and click "Join" on any active challenge. Your progress will be tracked automatically as you read and complete books.',
  },
  {
    question: 'Are there study spaces available in the library?',
    answer: 'Yes! We have individual study desks, group study tables, and a quiet reading corner. During exam periods, we extend our hours to provide more study time.',
  },
  {
    question: 'How can I access online resources?',
    answer: 'Visit our Resources page for links to approved online newspapers, eBooks, and educational platforms. Some resources may require you to be logged in with your school account.',
  },
];

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Message sent!',
      description: 'Thank you for contacting us. We will respond within 24-48 hours.',
    });

    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
              Contact & Help
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Have a question? Check our FAQs below or send us a message. We're here to help!
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* FAQ Section */}
          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Frequently Asked Questions
            </h2>
            
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card rounded-lg border border-border/50 px-4"
                >
                  <AccordionTrigger className="text-left font-medium hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Contact Form */}
          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name || profile?.full_name || ''}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email || profile?.email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@school.ae"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is your question about?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>

            {/* Quick Contact */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">library@school.ae</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 mx-auto text-accent-orange mb-2" />
                <p className="text-xs text-muted-foreground">Response Time</p>
                <p className="text-sm font-medium">24-48 hours</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 mx-auto text-accent-green mb-2" />
                <p className="text-xs text-muted-foreground">Visit Us</p>
                <p className="text-sm font-medium">Main Building</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
