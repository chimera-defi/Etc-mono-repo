'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

  // Ensure we only render portal on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate tooltip position based on trigger element
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const padding = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - padding;
        left = triggerRect.left + scrollX + triggerRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + padding;
        left = triggerRect.left + scrollX + triggerRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollY + triggerRect.height / 2;
        left = triggerRect.left + scrollX - padding;
        break;
      case 'right':
        top = triggerRect.top + scrollY + triggerRect.height / 2;
        left = triggerRect.right + scrollX + padding;
        break;
    }

    setTooltipPosition({ top, left });
  }, [position]);

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);
      return () => {
        window.removeEventListener('scroll', calculatePosition, true);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isVisible, calculatePosition]);

  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      transform: 'translate(-50%, -100%)',
    },
    bottom: {
      transform: 'translate(-50%, 0)',
    },
    left: {
      transform: 'translate(-100%, -50%)',
    },
    right: {
      transform: 'translate(0, -50%)',
    },
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 dark:border-t-slate-100 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 dark:border-b-slate-100 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 dark:border-l-slate-100 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 dark:border-r-slate-100 border-y-transparent border-l-transparent',
  };

  const tooltipElement = isVisible && content && mounted ? (
    <div
      role="tooltip"
      className={cn(
        'fixed z-[9999] px-3 py-2 text-xs font-normal leading-relaxed',
        'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900',
        'rounded-md shadow-lg pointer-events-none',
        'animate-in fade-in-0 zoom-in-95 duration-150'
      )}
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        maxWidth,
        ...positionStyles[position],
      }}
    >
      {content}
      {/* Arrow */}
      <span
        className={cn(
          'absolute w-0 h-0 border-4',
          arrowClasses[position]
        )}
      />
    </div>
  ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        className={cn('relative inline-flex items-center cursor-help', className)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
        {showIcon && (
          <HelpCircle
            className="h-3.5 w-3.5 ml-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="More information"
          />
        )}
      </span>
      {mounted && typeof document !== 'undefined' && createPortal(tooltipElement, document.body)}
    </>
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
    <Tooltip content={tooltip} showIcon position="bottom" className={className}>
      <span>{label}</span>
    </Tooltip>
  );
}

export default Tooltip;
