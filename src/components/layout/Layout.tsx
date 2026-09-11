import { ReactNode } from 'react';
import { Code2 } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Developer credit"
          >
            <Code2 className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs text-center">
          <p>This platform is being developed by Hridansh Kumar for the Ambassador School Library</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
