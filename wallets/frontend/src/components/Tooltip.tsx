'use client';

import { useState, useRef, useLayoutEffect } from 'react';
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
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Use layout effect for synchronous position calculation before paint
  useLayoutEffect(() => {
    if (!isVisible || !triggerRef.current) return;

    const trigger = triggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - gap;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - gap;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
        break;
    }

    setCoords({ top, left });
  }, [isVisible, position]);

  const getTransform = () => {
    switch (position) {
      case 'top':
        return 'translateX(-50%) translateY(-100%)';
      case 'bottom':
        return 'translateX(-50%)';
      case 'left':
        return 'translateX(-100%) translateY(-50%)';
      case 'right':
        return 'translateY(-50%)';
      default:
        return '';
    }
  };

  // Only render portal on client side
  const canUseDOM = typeof window !== 'undefined';

  return (
    <>
      <span
        ref={triggerRef}
        className={cn('inline-flex items-center cursor-help', className)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        tabIndex={0}
      >
        {children}
        {showIcon && (
          <HelpCircle
            className="h-3.5 w-3.5 ml-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="More information"
          />
        )}
      </span>

      {canUseDOM && isVisible && content &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: getTransform(),
              maxWidth,
              zIndex: 99999,
            }}
            className={cn(
              'px-3 py-2 text-xs font-normal leading-relaxed whitespace-normal',
              'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
              'rounded-md shadow-xl',
              'transition-opacity duration-150'
            )}
          >
            {content}
          </div>,
          document.body
        )}
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
