import Link from 'next/link';
import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Cpu,
  CreditCard,
  GitCompare,
  Shield,
  Wallet,
  Zap,
} from 'lucide-react';

export interface VariantBMetric {
  label: string;
  value: string;
  context: string;
}

export interface VariantBTrack {
  name: string;
  href: string;
  count: number;
  summary: string;
  focus: string;
}

export interface VariantBPick {
  name: string;
  href: string;
  score: number;
  reason: string;
  fit: string;
}

export interface VariantBData {
  headline: string;
  subline: string;
  lastUpdated: string;
  keyStats: VariantBMetric[];
  tracks: VariantBTrack[];
  picks: VariantBPick[];
  systemNotes: string[];
}

interface VariantBProps {
  data: VariantBData;
}

const numberFormatter = new Intl.NumberFormat('en-US');
const statIcons = [Wallet, GitCompare, BookOpen];
const trackIcons = [Wallet, Shield, CreditCard, ArrowLeftRight];
const pickIcons = [Zap, CheckCircle, Shield, Cpu];
const trackSpans = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-7'];

export function VariantB({ data }: VariantBProps) {
  return (
    <div className="relative isolate overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(56,189,248,0.18),transparent_58%),radial-gradient(90%_120%_at_100%_20%,rgba(16,185,129,0.14),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.09] [background-image:linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 pb-24 pt-14 sm:px-8 lg:px-12">
        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr] lg:items-end">
          <article className="rounded-[2rem] border border-slate-800/80 bg-slate-900/75 p-8 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.95)] sm:p-10">
            <p className="inline-flex rounded-full border border-sky-300/30 bg-sky-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-sky-200">
              Design Lab / Variant B
            </p>
            <h1 className="mt-5 max-w-[19ch] text-4xl font-semibold leading-[1.04] tracking-[-0.03em] text-slate-50 sm:text-5xl lg:text-6xl">
              {data.headline}
            </h1>
            <p className="mt-6 max-w-[65ch] text-base leading-relaxed text-slate-300 sm:text-lg">
              {data.subline}
            </p>
            <p className="mt-5 text-xs uppercase tracking-[0.12em] text-slate-400">
              Last dataset refresh{' '}
              <span className="font-semibold text-slate-200">{data.lastUpdated}</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-0.5"
              >
                Open compare workspace
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/docs/about"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-medium text-slate-200 transition duration-200 hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-0.5"
              >
                Read scoring docs
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <aside className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/65 p-7 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.95)] sm:p-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.11em] text-slate-300">
              Operational snapshot
            </h2>
            <ul className="mt-5 space-y-3">
              {data.keyStats.map((stat, index) => {
                const Icon = statIcons[index % statIcons.length];
                return (
                  <li
                    key={stat.label}
                    className="group rounded-2xl border border-slate-800 bg-slate-950/55 p-4 transition duration-200 hover:border-slate-600 hover:bg-slate-950/80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-slate-300">{stat.label}</p>
                      <Icon className="h-4 w-4 text-sky-300 transition duration-200 group-hover:text-sky-200" aria-hidden="true" />
                    </div>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-slate-100 tabular-nums">
                      {stat.value}
                    </p>
                    <p className="mt-2 max-w-[40ch] text-xs leading-relaxed text-slate-400">
                      {stat.context}
                    </p>
                  </li>
                );
              })}
            </ul>
          </aside>
        </section>

        <section aria-labelledby="variant-b-lanes" className="space-y-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.11em] text-slate-300">
                Coverage lanes
              </p>
              <h2
                id="variant-b-lanes"
                className="mt-1 max-w-[26ch] text-3xl font-semibold leading-tight tracking-[-0.02em] text-slate-100 sm:text-4xl"
              >
                Benchmarks grouped by developer decision path.
              </h2>
            </div>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-900/70 px-3.5 py-2 text-sm font-medium text-slate-200 transition duration-200 hover:border-slate-500 hover:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Browse full documentation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </header>

          <div className="grid gap-4 lg:grid-cols-12">
            {data.tracks.map((track, index) => {
              const Icon = trackIcons[index % trackIcons.length];
              const spanClass = trackSpans[index % trackSpans.length];

              return (
                <article
                  key={track.name}
                  className={`${spanClass} group rounded-[1.5rem] border border-slate-800/80 bg-slate-900/70 p-6 transition duration-300 hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-900/90`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium uppercase tracking-[0.1em] text-slate-300">
                      {track.name}
                    </p>
                    <Icon className="h-5 w-5 text-sky-300/90 transition duration-200 group-hover:text-sky-200" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-4xl font-semibold tracking-[-0.02em] text-slate-100 tabular-nums">
                    {numberFormatter.format(track.count)}
                  </p>
                  <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-slate-300">
                    {track.summary}
                  </p>
                  <p className="mt-3 text-sm text-slate-400">
                    Focus: <span className="text-slate-200">{track.focus}</span>
                  </p>
                  <Link
                    href={track.href}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-sky-200 transition duration-200 hover:text-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    Open track
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-12 lg:items-start">
          <article className="lg:col-span-8 rounded-[1.75rem] border border-slate-800/80 bg-slate-900/65 p-7 sm:p-8">
            <header>
              <p className="text-sm font-medium uppercase tracking-[0.11em] text-slate-300">
                Editor picks
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-slate-100 sm:text-4xl">
                Fast answers for common wallet decisions.
              </h2>
            </header>

            <ol className="mt-6 space-y-3">
              {data.picks.map((pick, index) => {
                const Icon = pickIcons[index % pickIcons.length];

                return (
                  <li
                    key={pick.name}
                    className="group rounded-2xl border border-slate-800 bg-slate-950/55 p-4 transition duration-200 hover:border-slate-600 hover:bg-slate-950/75"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-200">
                          <Icon className="h-4 w-4 text-sky-300" aria-hidden="true" />
                          {pick.name}
                        </p>
                        <p className="max-w-[54ch] text-sm leading-relaxed text-slate-300">{pick.reason}</p>
                        <p className="text-xs uppercase tracking-[0.09em] text-slate-400">{pick.fit}</p>
                      </div>

                      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 sm:min-w-[11rem] sm:flex-col sm:items-end sm:gap-1">
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Score</p>
                        <p className="text-2xl font-semibold text-slate-100 tabular-nums">{pick.score}</p>
                        <Link
                          href={pick.href}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-200 transition duration-200 hover:text-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                        >
                          View research
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </article>

          <aside className="lg:col-span-4 rounded-[1.75rem] border border-slate-800/80 bg-slate-900/65 p-7 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-100">
              Design system rollout notes
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Variant B reduces one-off sections and leans on reusable surfaces so future tracks can ship with minimal custom CSS.
            </p>
            <ul className="mt-5 space-y-3">
              {data.systemNotes.map((note) => (
                <li key={note} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" aria-hidden="true" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>

            <nav aria-label="Variant B quick links" className="mt-6 grid gap-2">
              <Link
                href="/explore"
                className="inline-flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/85 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition duration-200 hover:border-slate-500 hover:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Inspect table view
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/docs/about"
                className="inline-flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/85 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition duration-200 hover:border-slate-500 hover:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Methodology and caveats
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </nav>
          </aside>
        </section>

        <section className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/70 p-7 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.1em] text-slate-300">
                Variant B intent
              </p>
              <h2 className="mt-1 max-w-[30ch] text-2xl font-semibold tracking-[-0.02em] text-slate-100 sm:text-3xl">
                Less template feel, more analyst workstation.
              </h2>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/75 px-4 py-2.5 text-sm font-medium text-slate-200 transition duration-200 hover:border-slate-500 hover:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Back to current homepage
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
