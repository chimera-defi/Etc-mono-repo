'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
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
  const [isClickOpen, setIsClickOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);

  // Track mount state for SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
        setIsVisible(false);
        setIsClickOpen(false);
      }
    };

    // Small delay to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible]);

  // Calculate position when visible
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

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    if (position === 'top' || position === 'bottom') {
      const halfWidth = maxWidth / 2;
      left = Math.max(halfWidth + 8, Math.min(left, viewportWidth - halfWidth - 8));
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

  // Toggle on click/tap (works for both mobile and desktop)
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsVisible(prev => {
      const next = !prev;
      setIsClickOpen(next);
      return next;
    });
  };

  // Show on hover (desktop only, doesn't interfere with click)
  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    setIsClickOpen(false);
    setIsVisible(true);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLSpanElement>) => {
    isHoveringRef.current = false;
    // Only hide if we're leaving via mouse (not if it was clicked open)
    if (isClickOpen) return;

    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && tooltipRef.current?.contains(nextTarget)) {
      return;
    }

    setIsVisible(false);
  };

  return (
    <>
      <span
        ref={triggerRef}
        className={cn('inline-flex items-center cursor-pointer', className)}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        tabIndex={0}
        role="button"
        aria-expanded={isVisible}
        aria-label={showIcon ? 'Show more information' : undefined}
      >
        {children}
        {showIcon && (
          <HelpCircle
            className="h-4 w-4 ml-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex-shrink-0"
            aria-hidden="true"
          />
        )}
      </span>

      {isMounted && isVisible && content &&
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
            onMouseEnter={() => {
              isHoveringRef.current = true;
              setIsVisible(true);
            }}
            onMouseLeave={(event) => {
              isHoveringRef.current = false;
              if (isClickOpen) return;

              const nextTarget = event.relatedTarget as Node | null;
              if (nextTarget && triggerRef.current?.contains(nextTarget)) {
                return;
              }

              setIsVisible(false);
            }}
            className={cn(
              'px-3 py-2 text-xs font-normal leading-relaxed whitespace-normal',
              'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
              'rounded-md shadow-xl border border-gray-700 dark:border-gray-300'
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
