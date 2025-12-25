'use client';

import { Suspense, lazy, ComponentType, useEffect, useState, useRef } from 'react';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Lazy loading wrapper that only renders when visible
 */
export function LazyOnVisible({ fallback, children }: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback || <LoadingPlaceholder />}
    </div>
  );
}

/**
 * Simple loading placeholder
 */
export function LoadingPlaceholder({ height = 200 }: { height?: number }) {
  return (
    <div
      className="animate-pulse bg-muted rounded-lg"
      style={{ height: `${height}px` }}
    />
  );
}

/**
 * Loading spinner
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-muted border-t-primary`}
      />
    </div>
  );
}

/**
 * Skeleton for wallet card
 */
export function WalletCardSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-border animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="flex-1">
          <div className="h-5 w-32 bg-muted rounded mb-2" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <div className="h-8 w-12 bg-muted rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton for table row
 */
export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="p-3"><div className="h-5 w-24 bg-muted rounded" /></td>
      <td className="p-3"><div className="h-5 w-12 bg-muted rounded" /></td>
      <td className="p-3"><div className="h-5 w-16 bg-muted rounded" /></td>
      <td className="p-3"><div className="h-5 w-20 bg-muted rounded" /></td>
      <td className="p-3"><div className="h-5 w-16 bg-muted rounded" /></td>
    </tr>
  );
}

/**
 * Skeleton for table
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3 text-left"><div className="h-4 w-20 bg-muted rounded" /></th>
            <th className="p-3 text-left"><div className="h-4 w-16 bg-muted rounded" /></th>
            <th className="p-3 text-left"><div className="h-4 w-20 bg-muted rounded" /></th>
            <th className="p-3 text-left"><div className="h-4 w-24 bg-muted rounded" /></th>
            <th className="p-3 text-left"><div className="h-4 w-16 bg-muted rounded" /></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Generic suspense wrapper with fallback
 */
interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SuspenseWrapper({ children, fallback }: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      {children}
    </Suspense>
  );
}

/**
 * Helper for lazy loading components
 * Usage:
 * const LazyComponent = lazy(() => import('./MyComponent'));
 * <SuspenseWrapper><LazyComponent /></SuspenseWrapper>
 */
export { lazy };

/**
 * Deferred rendering for non-critical content
 */
export function DeferredRender({ children }: { children: React.ReactNode }) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setShouldRender(true));
      return () => window.cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => setShouldRender(true), 0);
      return () => clearTimeout(id);
    }
  }, []);

  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}
