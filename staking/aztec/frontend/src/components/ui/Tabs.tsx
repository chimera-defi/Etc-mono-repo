'use client';

import { cn } from '@/lib/cn';

export interface Tab {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'inline-flex p-1 bg-aztec-dark rounded-xl border border-aztec-border',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            activeTab === tab.id
              ? 'bg-gradient-primary text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
