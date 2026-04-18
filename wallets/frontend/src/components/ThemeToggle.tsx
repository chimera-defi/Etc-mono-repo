'use client';

import { Moon, Sun } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={buttonVariants({
        variant: 'ghost',
        size: 'icon',
        className: 'h-10 w-10 rounded-xl sm:h-9 sm:w-9',
      })}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
      ) : (
        <Moon className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
      )}
    </button>
  );
}
