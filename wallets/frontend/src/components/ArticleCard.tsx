import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react';
import { calculateReadingTime, formatReadingTime } from '@/lib/seo';

interface ArticleCardProps {
  slug: string;
  category: string;
  title: string;
  description: string;
  lastUpdated: string;
  content?: string;
  wallets?: string[];
  variant?: 'compact' | 'full';
}

export function ArticleCard({
  slug,
  category,
  title,
  description,
  lastUpdated,
  content,
  wallets,
  variant = 'full',
}: ArticleCardProps) {
  const readingTime = content ? calculateReadingTime(content) : null;

  if (variant === 'compact') {
    return (
      <Link
        href={`/articles/${slug}`}
        className="group glass-card-hover p-5"
      >
        <span className="text-xs font-medium text-sky-400 uppercase tracking-wide mb-2 block">
          {category}
        </span>
        <h3 className="text-lg font-semibold text-slate-100 mb-2 group-hover:text-sky-400 transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{description}</p>
        <span className="text-xs text-slate-500">{lastUpdated}</span>
      </Link>
    );
  }

  return (
    <Link
      href={`/articles/${slug}`}
      className="group glass-card-hover p-6"
    >
      {/* Category Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-medium text-xs capitalize">
          {category}
        </span>
        {readingTime && (
          <span className="text-xs text-slate-400 inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatReadingTime(readingTime)}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2 text-slate-100 group-hover:text-sky-400 transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-400 mb-4 line-clamp-3">
        {description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        {wallets && wallets.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Read More */}
      <div className="inline-flex items-center gap-2 text-sm font-medium text-sky-400 group-hover:gap-3 transition-all">
        Read Article
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
