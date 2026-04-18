import Link from 'next/link';
import { ArrowRight, Clock, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { MarkdownDocument } from '@/lib/markdown';

interface WalletCardProps {
  document: MarkdownDocument;
}

const categoryColors: Record<string, string> = {
  comparison: 'accent',
  research: 'warning',
  guide: 'success',
  other: 'neutral',
};

const categoryLabels: Record<string, string> = {
  comparison: 'Comparison',
  research: 'Research',
  guide: 'Guide',
  other: 'Documentation',
};

export function WalletCard({ document }: WalletCardProps) {
  return (
    <Link
      href={`/docs/${document.slug}`}
      className="group block rounded-2xl border border-border bg-card/90 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_38px_-24px_hsl(var(--primary))]"
    >
      <div className="mb-4 flex items-start justify-between">
        <Badge variant={categoryColors[document.category] as 'accent' | 'warning' | 'success' | 'neutral'}>
          {categoryLabels[document.category]}
        </Badge>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
      </div>

      <h3 className="mb-2 text-balance text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
        {document.title}
      </h3>

      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
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
