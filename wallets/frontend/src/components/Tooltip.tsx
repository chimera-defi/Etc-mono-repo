'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  /** Show an info icon that triggers the tooltip */
  showIcon?: boolean;
  /** Position of the tooltip relative to the trigger */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Additional class names for the tooltip container */
  className?: string;
  /** Maximum width of the tooltip */
  maxWidth?: number;
}

export function Tooltip({
  content,
  children,
  showIcon = false,
  position = 'top',
  className,
  maxWidth = 280,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Adjust tooltip position to stay within viewport
  const adjustPosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current || !isVisible) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 8;

    let newPosition = position;

    // Check if tooltip overflows and adjust
    if (position === 'top' && triggerRect.top - tooltipRect.height - padding < 0) {
      newPosition = 'bottom';
    } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height + padding > window.innerHeight) {
      newPosition = 'top';
    } else if (position === 'left' && triggerRect.left - tooltipRect.width - padding < 0) {
      newPosition = 'right';
    } else if (position === 'right' && triggerRect.right + tooltipRect.width + padding > window.innerWidth) {
      newPosition = 'left';
    }

    setAdjustedPosition(newPosition);
  }, [position, isVisible]);

  useEffect(() => {
    if (isVisible) {
      adjustPosition();
      window.addEventListener('resize', adjustPosition);
      return () => window.removeEventListener('resize', adjustPosition);
    }
  }, [isVisible, adjustPosition]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 dark:border-t-slate-100 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 dark:border-b-slate-100 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 dark:border-l-slate-100 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 dark:border-r-slate-100 border-y-transparent border-l-transparent',
  };

  return (
    <span
      ref={triggerRef}
      className={cn('relative inline-flex items-center', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {showIcon && (
        <HelpCircle
          className="h-3.5 w-3.5 ml-1 text-muted-foreground hover:text-foreground cursor-help transition-colors"
          aria-label="More information"
        />
      )}

      {isVisible && content && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-2 text-xs font-normal leading-relaxed',
            'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900',
            'rounded-md shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            positionClasses[adjustedPosition]
          )}
          style={{ maxWidth, width: 'max-content' }}
        >
          {content}
          {/* Arrow */}
          <span
            className={cn(
              'absolute w-0 h-0 border-4',
              arrowClasses[adjustedPosition]
            )}
          />
        </div>
      )}
    </span>
  );
}

/**
 * HeaderTooltip - A table header with an integrated tooltip icon
 */
interface HeaderTooltipProps {
  label: string;
  tooltip: string;
  className?: string;
}

export function HeaderTooltip({ label, tooltip, className }: HeaderTooltipProps) {
  return (
    <Tooltip content={tooltip} showIcon position="top" className={className}>
      <span>{label}</span>
    </Tooltip>
  );
}

export default Tooltip;
