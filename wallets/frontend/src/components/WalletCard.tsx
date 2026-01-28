import Link from 'next/link';
import { ArrowRight, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarkdownDocument } from '@/lib/markdown';

interface WalletCardProps {
  document: MarkdownDocument;
  className?: string;
}

const categoryColors: Record<string, string> = {
  comparison: 'border-sky-400/40 bg-sky-400/10 text-sky-300',
  research: 'border-indigo-400/40 bg-indigo-400/10 text-indigo-300',
  guide: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  other: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
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
        'group block p-6 glass-panel glass-panel-hover',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={cn(
            'text-xs font-medium px-2 py-1 rounded-full border',
            categoryColors[document.category]
          )}
        >
          {categoryLabels[document.category]}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-sky-300 group-hover:translate-x-1 transition-all" />
      </div>
      
      <h3 className="font-semibold text-lg mb-2 group-hover:text-sky-300 transition-colors">
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
