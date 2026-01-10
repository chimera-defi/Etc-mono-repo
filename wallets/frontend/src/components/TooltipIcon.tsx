'use client';

import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipIconProps {
  text: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export function TooltipIcon({ text, side = 'right' }: TooltipIconProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  const sideClasses = {
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  };

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center justify-center p-0 h-4 w-4 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-1 focus:ring-primary flex-shrink-0"
        aria-label={`Tooltip: ${text}`}
        title={text}
      >
        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 px-3 py-2 text-xs bg-foreground text-background rounded shadow-lg max-w-xs pointer-events-auto ${sideClasses[side]}`}
          style={{ wordWrap: 'break-word' }}
        >
          {text}
          {/* Arrow indicator */}
          <div
            className={`absolute w-1.5 h-1.5 bg-foreground transform rotate-45 ${
              side === 'right' ? '-left-1 top-1/2 -translate-y-1/2' :
              side === 'left' ? '-right-1 top-1/2 -translate-y-1/2' :
              side === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2' :
              '-top-1 left-1/2 -translate-x-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
}
