import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Palette, Sparkles, Layers } from 'lucide-react';
import { Badge, buttonVariants, Panel } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Design Lab | Wallet Radar',
  description: 'Internal Wallet Radar design variants for review.',
  robots: {
    index: false,
    follow: false,
  },
};

const variants = [
  {
    slug: 'variant-a',
    title: 'Variant A',
    subtitle: 'Design Taste Frontend',
    recommended: false,
    summary:
      'Asymmetric editorial direction with a denser visual hierarchy, compact data rails, and explicit state styling.',
    strengths: ['Strong visual identity', 'Explicit loading/empty/error states', 'Asymmetric layout language'],
  },
  {
    slug: 'variant-b',
    title: 'Variant B',
    subtitle: 'Redesign Existing Projects',
    recommended: true,
    summary:
      'Pragmatic premium refresh focused on readability, reusable sections, and incremental migration toward a design system.',
    strengths: ['Cleaner migration path', 'Lower implementation risk', 'Consistent page-level rhythm'],
  },
];

export default function DesignLabPage() {
  return (
    <div className="wr-container py-10">
      <div className="mb-8">
        <span className="wr-kicker">Internal review</span>
        <h1 className="wr-section-title">Wallet Radar Design Lab</h1>
        <p className="mt-3 max-w-[72ch] text-muted-foreground">
          Parallel redesign prototypes generated from different design skills. Use these routes for visual and product review before
          broad rollout.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {variants.map((variant, index) => (
          <Panel key={variant.slug} className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="accent">{variant.subtitle}</Badge>
                {variant.recommended && <Badge variant="success">Recommended</Badge>}
              </div>
              {index === 0 ? <Sparkles className="h-4 w-4 text-primary" /> : <Layers className="h-4 w-4 text-primary" />}
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">{variant.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{variant.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {variant.strengths.map((strength) => (
                <span key={strength} className="wr-chip">
                  {strength}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href={`/design-lab/${variant.slug}`}
                className={buttonVariants({ variant: 'outline', size: 'md', className: 'rounded-xl' })}
              >
                Open Prototype
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className={buttonVariants({ variant: 'ghost', size: 'md', className: 'rounded-xl' })}
        >
          <Palette className="h-4 w-4" />
          Back to production homepage
        </Link>
      </div>
    </div>
  );
}
