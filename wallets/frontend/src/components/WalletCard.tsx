import Link from 'next/link';
import { ArrowRight, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarkdownDocument } from '@/lib/markdown';

interface WalletCardProps {
  document: MarkdownDocument;
  className?: string;
}

const categoryColors: Record<string, string> = {
  comparison: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  research: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  guide: 'bg-green-500/10 text-green-600 dark:text-green-400',
  other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

const categoryLabels: Record<string, string> = {
  comparison: 'Comparison',
  research: 'Research',
  guide: 'Guide',
  other: 'Documentation',
};

export function WalletCard({ document, className }: WalletCardProps) {
  return (
    <Link
      href={`/docs/${document.slug}`}
      className={cn(
        'group block p-6 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            categoryColors[document.category]
          )}
        >
          {categoryLabels[document.category]}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
      
      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
        {document.title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {document.description}
      </p>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {document.lastUpdated && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {document.lastUpdated}
          </span>
        )}
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Read more
        </span>
      </div>
    </Link>
  );
}
