'use client';

import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
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
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Detect touch device on mount
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Close tooltip when clicking outside (for mobile)
  useEffect(() => {
    if (!isVisible || !isTouchDevice) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
        setIsVisible(false);
      }
    };

    // Use a small delay to prevent immediate close on the same tap
    const timeoutId = setTimeout(() => {
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('click', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isVisible, isTouchDevice]);

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

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const tooltipWidth = maxWidth;

    // Clamp horizontal position
    if (position === 'top' || position === 'bottom') {
      const halfWidth = tooltipWidth / 2;
      if (left - halfWidth < 8) {
        left = halfWidth + 8;
      } else if (left + halfWidth > viewportWidth - 8) {
        left = viewportWidth - halfWidth - 8;
      }
    }

    setCoords({ top, left });
  }, [isVisible, position, maxWidth]);

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

  // Handle tap/click for mobile
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isTouchDevice) {
      e.preventDefault();
      e.stopPropagation();
      setIsVisible(prev => !prev);
    }
  }, [isTouchDevice]);

  // Handle mouse events for desktop
  const handleMouseEnter = useCallback(() => {
    if (!isTouchDevice) {
      setIsVisible(true);
    }
  }, [isTouchDevice]);

  const handleMouseLeave = useCallback(() => {
    if (!isTouchDevice) {
      setIsVisible(false);
    }
  }, [isTouchDevice]);

  // Only render portal on client side
  const canUseDOM = typeof window !== 'undefined';

  return (
    <>
      <span
        ref={triggerRef}
        className={cn('inline-flex items-center cursor-help', className)}
        onClick={handleClick}
        onTouchEnd={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        tabIndex={0}
        role="button"
        aria-describedby={isVisible ? 'tooltip' : undefined}
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
            id="tooltip"
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
            {/* Mobile close hint */}
            {isTouchDevice && (
              <div className="mt-1 pt-1 border-t border-gray-700 dark:border-gray-300 text-[10px] opacity-70">
                Tap anywhere to close
              </div>
            )}
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
