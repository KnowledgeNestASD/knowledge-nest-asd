import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BookOpen, Globe, Newspaper, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  resource_type: string;
  image_url: string | null;
}

const placeholderResources: Resource[] = [
  {
    id: '1',
    title: 'National Geographic Kids',
    description: 'Explore science, geography, history, and culture with fun articles, videos, and games designed for young learners.',
    url: 'https://kids.nationalgeographic.com',
    resource_type: 'eBooks',
    image_url: null,
  },
  {
    id: '2',
    title: 'Oxford Owl',
    description: 'Free eBooks and reading resources for children aged 3-11, including phonics activities and reading tips.',
    url: 'https://www.oxfordowl.co.uk',
    resource_type: 'eBooks',
    image_url: null,
  },
  {
    id: '3',
    title: 'Epic! Reading Platform',
    description: 'Access to over 40,000 digital books for kids 12 and under. Educational videos and audiobooks included.',
    url: 'https://www.getepic.com',
    resource_type: 'eBooks',
    image_url: null,
  },
  {
    id: '4',
    title: 'BBC Newsround',
    description: 'News, stories and videos for children and young people, covering current events in an age-appropriate way.',
    url: 'https://www.bbc.co.uk/newsround',
    resource_type: 'Newspapers',
    image_url: null,
  },
  {
    id: '5',
    title: 'The Guardian Kids',
    description: 'Age-appropriate news articles and features from The Guardian, covering topics from science to sports.',
    url: 'https://www.theguardian.com/childrens-books-site',
    resource_type: 'Newspapers',
    image_url: null,
  },
  {
    id: '6',
    title: 'Time for Kids',
    description: 'Current events magazine for students with news stories, debates, and infographics.',
    url: 'https://www.timeforkids.com',
    resource_type: 'Newspapers',
    image_url: null,
  },
  {
    id: '7',
    title: 'Britannica School',
    description: 'Trusted encyclopedia and research tool for students of all ages with articles, videos, and primary sources.',
    url: 'https://school.britannica.com',
    resource_type: 'Educational',
    image_url: null,
  },
  {
    id: '8',
    title: 'Khan Academy',
    description: 'Free courses, lessons, and practice in math, science, arts, humanities, and more for all grade levels.',
    url: 'https://www.khanacademy.org',
    resource_type: 'Educational',
    image_url: null,
  },
];

const resourceTypeConfig: Record<string, { icon: typeof BookOpen; color: string }> = {
  'eBooks': { icon: BookOpen, color: 'bg-primary/10 text-primary' },
  'Newspapers': { icon: Newspaper, color: 'bg-accent-orange/10 text-accent-orange' },
  'Educational': { icon: Globe, color: 'bg-accent-green/10 text-accent-green' },
};

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('online_resources')
        .select('*')
        .eq('is_active', true)
        .order('title');

      if (!error && data && data.length > 0) {
        setResources(data);
      }
      
      setIsLoading(false);
    };

    fetchResources();
  }, []);

  const displayResources = resources.length > 0 ? resources : placeholderResources;

  const resourceTypes = ['all', ...new Set(displayResources.map(r => r.resource_type))];
  
  const filteredResources = activeTab === 'all' 
    ? displayResources 
    : displayResources.filter(r => r.resource_type === activeTab);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
              Online Resources
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Access curated eBooks, online newspapers, and educational platforms. 
            All resources are safe and appropriate for students.
          </p>
        </div>

        {/* Notice */}
        <div className="mb-8 rounded-xl bg-accent-gold/10 border border-accent-gold/30 p-4 flex items-start gap-3">
          <FileText className="h-5 w-5 text-accent-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">External Resources Notice</p>
            <p className="text-sm text-muted-foreground">
              These links will open in a new tab and take you to external websites. 
              All resources are curated and approved by our library staff.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-muted/50">
            {resourceTypes.map((type) => (
              <TabsTrigger key={type} value={type} className="capitalize">
                {type === 'all' ? 'All Resources' : type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => {
              const config = resourceTypeConfig[resource.resource_type] || resourceTypeConfig.Educational;
              const Icon = config.icon;

              return (
                <div
                  key={resource.id}
                  className="group bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`rounded-lg p-2 ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {resource.resource_type}
                    </Badge>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>

                  {resource.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {resource.description}
                    </p>
                  )}

                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      Visit Resource
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {filteredResources.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Globe className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No resources found</h3>
            <p className="text-muted-foreground">
              Check back soon for new online resources!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Resources;
