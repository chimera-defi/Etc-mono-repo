/**
 * Tests for Capacitor Hello World App
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock matchMedia for dark mode detection
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('App', () => {
  it('renders the main greeting', () => {
    render(<App />);
    expect(screen.getByText('Capacitor says hi! 👋')).toBeInTheDocument();
    expect(screen.getByText('Hello from Valdi Labs')).toBeInTheDocument();
  });

  it('shows the initial prompt', () => {
    render(<App />);
    expect(screen.getByText('Tap the button to see framework details.')).toBeInTheDocument();
  });

  it('toggles details when button is clicked', async () => {
    render(<App />);
    
    // Find and click the button
    const button = screen.getByText('Show details');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    
    // Wait for animation and state change
    await waitFor(() => {
      expect(screen.getByText('Hide details')).toBeInTheDocument();
    }, { timeout: 500 });
    
    // Check details content is shown
    await waitFor(() => {
      expect(screen.getByText('State toggled successfully!')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('displays the framework badge', () => {
    render(<App />);
    expect(screen.getByText('💻 Built with Capacitor + Vite')).toBeInTheDocument();
  });
});
