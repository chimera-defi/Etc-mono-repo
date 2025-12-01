/**
 * Tests for Capacitor Hello World App
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
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
    expect(screen.getByText('Tap button to see details')).toBeInTheDocument();
  });

  it('toggles details when button is clicked', async () => {
    render(<App />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Show');
    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveTextContent('Hide'), { timeout: 500 });
    await waitFor(() => expect(screen.getByText('State toggled!')).toBeInTheDocument(), { timeout: 500 });
  });

  it('displays the framework badge', () => {
    render(<App />);
    expect(screen.getByText('Capacitor + Vite')).toBeInTheDocument();
  });
});
