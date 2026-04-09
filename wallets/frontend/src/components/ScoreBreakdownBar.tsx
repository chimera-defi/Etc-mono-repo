import { cn } from '@/lib/utils';
import type { ScoreBreakdownEntry } from '@/types/wallets';

const SEGMENT_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

const SHORT_LABEL_MAP: Record<string, string> = {
  'Core Readiness': 'Core',
  'Release Discipline': 'Release',
  'Developer Safety & Control': 'Dev Control',
  'Ecosystem & Accounts': 'Ecosystem',
  'Transparency & Access': 'Transparency',
  'Maintenance & Assurance': 'Maintenance',
  'Security Architecture': 'Security',
  'Transparency & Maintenance': 'Transparency',
  'Usability & Value': 'UX',
  'Product Model': 'Model',
  'Custody & Coverage': 'Custody',
  'Rewards Value': 'Rewards',
  'Fee Friction': 'Fees',
  'Delivery Confidence': 'Confidence',
  'Coverage': 'Coverage',
  'Product Breadth': 'Breadth',
  'Developer UX': 'Dev UX',
  'Pricing Shape': 'Pricing',
  'Operational Confidence': 'Confidence',
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function hexToRgba(hex: string, alpha: number) {
  const safeHex = hex.replace('#', '');
  const value = Number.parseInt(safeHex, 16);
  if (Number.isNaN(value) || safeHex.length !== 6) return `rgba(148, 163, 184, ${alpha})`;
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getScoreBreakdownShortLabel(label: string) {
  return SHORT_LABEL_MAP[label] || label;
}

interface ScoreBreakdownBarProps {
  breakdown: ScoreBreakdownEntry[];
  className?: string;
  barClassName?: string;
  showLegend?: boolean;
}

export function ScoreBreakdownBar({
  breakdown,
  className,
  barClassName,
  showLegend = false,
}: ScoreBreakdownBarProps) {
  const weightedBreakdown = breakdown.filter((entry) => entry.max > 0);
  if (weightedBreakdown.length === 0) return null;

  const totalMax = weightedBreakdown.reduce((sum, entry) => sum + entry.max, 0);

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn('flex h-2 overflow-hidden rounded-full border border-border/70 bg-muted/40', barClassName)}>
        {weightedBreakdown.map((entry, index) => {
          const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length]!;
          const segmentWidthPct = (entry.max / totalMax) * 100;
          const fillPct = clamp01(entry.score / entry.max) * 100;
          const tooltip = `${entry.label}: ${entry.score}/${entry.max} (${Math.round(fillPct)}%)${entry.note ? `\n${entry.note}` : ''}`;

          return (
            <div
              key={`${entry.key}-${entry.label}-${index}`}
              className="relative h-full border-r border-background/60 last:border-r-0"
              style={{ width: `${segmentWidthPct}%`, backgroundColor: hexToRgba(color, 0.2) }}
              title={tooltip}
            >
              <div
                className="h-full"
                style={{ width: `${fillPct}%`, backgroundColor: color }}
              />
            </div>
          );
        })}
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {weightedBreakdown.map((entry, index) => {
            const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length]!;
            return (
              <span
                key={`legend-${entry.key}-${entry.label}-${index}`}
                className="inline-flex items-center gap-1"
                title={`${entry.label}: ${entry.score}/${entry.max}`}
              >
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                {getScoreBreakdownShortLabel(entry.label)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ScoreBreakdownBar;
