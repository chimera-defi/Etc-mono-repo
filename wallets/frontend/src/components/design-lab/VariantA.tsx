import Link from 'next/link';
import { cn } from '@/lib/utils';

type RankedWallet = {
  name: string;
  focus: string;
  score: number;
  releaseCadence: string;
  auditLag: string;
};

type Signal = {
  label: string;
  value: string;
  context: string;
};

const rankedWallets: RankedWallet[] = [
  {
    name: 'Rabby Wallet',
    focus: 'Protocol operators and power users',
    score: 92,
    releaseCadence: '6.4 releases / month',
    auditLag: '17 days since latest review',
  },
  {
    name: 'Trezor Safe 5',
    focus: 'Cold storage with transparent firmware',
    score: 94,
    releaseCadence: '2.1 releases / month',
    auditLag: '29 days since latest review',
  },
  {
    name: 'EtherFi Cash',
    focus: 'Card-native treasury operations',
    score: 85,
    releaseCadence: '3.2 releases / month',
    auditLag: '41 days since latest review',
  },
];

const watchSignals: Signal[] = [
  {
    label: 'Pipeline Throughput',
    value: '47.2 comparisons/day',
    context: '7-day moving window',
  },
  {
    label: 'Provider Drift Alerts',
    value: '3 active',
    context: 'SLA threshold: 6',
  },
  {
    label: 'Verified Data Coverage',
    value: '89.4%',
    context: 'Across 126 tracked fields',
  },
];

function Surface({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-[2rem] border border-zinc-300/70 bg-white/95 p-6 shadow-[0_24px_60px_-32px_rgba(16,24,40,0.28)] backdrop-blur-sm sm:p-8',
        className
      )}
    >
      {children}
    </section>
  );
}

function ScoreMark({ score }: { score: number }) {
  const tone =
    score >= 90
      ? 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25'
      : 'bg-zinc-900/5 text-zinc-700 ring-zinc-500/25';

  return (
    <span
      className={cn(
        'inline-flex min-h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold ring-1',
        tone
      )}
    >
      {score}
    </span>
  );
}

function DotPulse() {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
    </span>
  );
}

export function VariantA() {
  return (
    <div
      className="relative isolate overflow-hidden bg-zinc-50 text-zinc-900"
      style={{
        fontFamily: '"Geist", "Outfit", "Avenir Next", "Segoe UI", sans-serif',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(16,185,129,0.14),transparent_42%),radial-gradient(circle_at_88%_16%,rgba(15,23,42,0.12),transparent_46%),radial-gradient(circle_at_82%_78%,rgba(16,185,129,0.08),transparent_40%)]"
      />

      <div className="min-h-[100dvh]">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.45fr_0.95fr] md:items-start md:gap-8">
            <Surface className="relative overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl"
              />

              <div className="relative space-y-8">
                <div className="space-y-4">
                  <p className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-zinc-600">
                    Variant A Prototype
                  </p>
                  <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl md:text-6xl">
                    Asymmetric control room for wallet intelligence teams
                  </h1>
                  <p className="max-w-[62ch] text-sm leading-relaxed text-zinc-600 sm:text-base">
                    This concept pushes WalletRadar toward a modular design system: neutral structural surfaces,
                    one accent color, and component slots that can map directly to future off-the-shelf primitives.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200/80 bg-zinc-100/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Focus Segment</p>
                    <p className="mt-2 text-sm font-medium text-zinc-900">Research operations and integration leads</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-600/20 bg-emerald-500/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Core Accent</p>
                    <p className="mt-2 text-sm font-medium text-zinc-900">Emerald feedback for state and action layers</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/docs/software-wallets"
                    className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-50 transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Inspect software comparisons
                  </Link>
                  <Link
                    href="/explore"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Open data explorer
                  </Link>
                </div>
              </div>
            </Surface>

            <Surface className="md:mt-10">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Live Reliability Deck</p>
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700">
                    <DotPulse />
                    Synced 4m ago
                  </span>
                </div>

                <div className="space-y-3">
                  {watchSignals.map((signal) => (
                    <div
                      key={signal.label}
                      className="rounded-2xl border border-zinc-200 bg-zinc-100/70 p-4 transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{signal.label}</p>
                      <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-900">{signal.value}</p>
                      <p className="mt-1 text-xs text-zinc-500">{signal.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Surface>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[1.55fr_0.95fr]">
            <Surface>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Curated comparison slate</h2>
                  <p className="mt-1 text-sm text-zinc-600">Rows are intentionally modular for migration into shared table primitives.</p>
                </div>
                <span className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                  Source synced: April 18, 2026
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {rankedWallets.map((wallet) => (
                  <article
                    key={wallet.name}
                    className="grid grid-cols-1 gap-4 rounded-2xl border border-zinc-200/90 bg-white p-4 transition-transform duration-300 hover:-translate-y-[1px] md:grid-cols-[1.35fr_0.7fr_0.9fr_0.95fr] md:items-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{wallet.name}</p>
                      <p className="mt-1 text-xs text-zinc-600">{wallet.focus}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Score</p>
                      <div className="mt-1">
                        <ScoreMark score={wallet.score} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Release cadence</p>
                      <p className="mt-1 text-sm text-zinc-800">{wallet.releaseCadence}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Audit recency</p>
                      <p className="mt-1 text-sm text-zinc-800">{wallet.auditLag}</p>
                    </div>
                  </article>
                ))}
              </div>
            </Surface>

            <div className="grid grid-cols-1 gap-6">
              <Surface>
                <h3 className="text-lg font-semibold tracking-tight text-zinc-950">Design system slots</h3>
                <ul className="mt-4 space-y-3 text-sm text-zinc-700">
                  <li className="rounded-xl border border-zinc-200 bg-zinc-100/70 px-3 py-2">Surface: rounded container + semantic section heading</li>
                  <li className="rounded-xl border border-zinc-200 bg-zinc-100/70 px-3 py-2">Metric row: label/value/context triad</li>
                  <li className="rounded-xl border border-zinc-200 bg-zinc-100/70 px-3 py-2">Status badge: live, warning, blocked variants</li>
                </ul>
              </Surface>

              <Surface>
                <h3 className="text-lg font-semibold tracking-tight text-zinc-950">State quality preview</h3>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-100/70 p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Loading</p>
                    <div className="mt-3 space-y-2 animate-pulse">
                      <div className="h-2 w-5/6 rounded-full bg-zinc-300/80" />
                      <div className="h-2 w-3/5 rounded-full bg-zinc-300/70" />
                      <div className="h-2 w-4/6 rounded-full bg-zinc-300/70" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-100/70 p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Empty</p>
                    <p className="mt-2 text-sm text-zinc-700">No liquidity snapshots found for this cohort. Add at least one provider filter to populate the lane.</p>
                  </div>

                  <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">Error</p>
                    <label htmlFor="source-id" className="mt-2 block text-sm font-medium text-zinc-800">
                      Provider source ID
                    </label>
                    <input
                      id="source-id"
                      type="text"
                      defaultValue="walletbeat-main"
                      className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-offset-0 transition-shadow duration-300 focus:border-emerald-600/50 focus:shadow-[0_0_0_2px_rgba(16,185,129,0.15)]"
                    />
                    <p className="mt-2 text-xs text-amber-900">Unable to verify release frequency for this source. Retry after key rotation.</p>
                  </div>
                </div>
              </Surface>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
