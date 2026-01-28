import Link from 'next/link';
import { ArrowRight, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarkdownDocument } from '@/lib/markdown';

interface WalletCardProps {
  document: MarkdownDocument;
}

const categoryColors: Record<string, string> = {
  comparison: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
  research: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  guide: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  other: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
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
      className="group block p-6 bg-slate-900/70 border border-slate-700/60 backdrop-blur-sm rounded-xl hover:border-sky-500/50 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full',
            categoryColors[document.category]
          )}
        >
          {categoryLabels[document.category]}
        </span>
        <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
      </div>

      <h3 className="font-semibold text-lg mb-2 text-slate-100 group-hover:text-sky-400 transition-colors">
        {document.title}
      </h3>

      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
        {document.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-slate-500">
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
