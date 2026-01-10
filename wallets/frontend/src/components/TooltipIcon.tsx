'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipIconProps {
  text: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export function TooltipIcon({ text, side = 'bottom' }: TooltipIconProps) {
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
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center justify-center px-2.5 py-1 ml-2 text-xs font-bold rounded-full bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex-shrink-0 cursor-help border-2 border-orange-600 shadow-md hover:shadow-lg"
        aria-label={`More info: ${text}`}
        title={text}
      >
        ? Info
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 px-3 py-2 text-xs bg-foreground text-background rounded-lg shadow-lg max-w-xs pointer-events-auto ${sideClasses[side]}`}
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
