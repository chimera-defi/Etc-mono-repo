/**
 * Capacitor Hello World - Framework Parity Demo
 * 
 * Demonstrates framework parity with Flutter, React Native, and Valdi experiments.
 * Features:
 * - Clean Material-inspired design
 * - State management with hooks
 * - CSS animations
 * - Dark/Light mode support
 * - Cross-platform ready (iOS/Android/Web)
 */

import { useState, useEffect } from 'react';
import './App.css';

// Detect dark mode preference
const useDarkMode = () => {
  const getInitialMode = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDark, setIsDark] = useState(getInitialMode);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return isDark;
};

function App() {
  const [showDetails, setShowDetails] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isDarkMode = useDarkMode();

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowDetails(!showDetails);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      {/* App Bar */}
      <header className="app-bar">
        <h1 className="app-bar-title">Hello from Valdi Labs</h1>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Icon */}
        <div className="hero-icon">
          <span className="hero-emoji">⚡</span>
        </div>

        {/* Title */}
        <h2 className="title">Capacitor says hi! 👋</h2>

        {/* Subtitle */}
        <p className="subtitle">
          Exploring framework parity with our Valdi experiment.
        </p>

        {/* Animated Content Card */}
        <div 
          className={`content-card ${showDetails ? 'active' : ''} ${isAnimating ? 'animating' : ''}`}
        >
          {showDetails ? (
            <div className="details-content">
              <div className="details-header">
                <span className="details-icon">✅</span>
                <span className="details-title">State toggled successfully!</span>
              </div>
              <div className="details-list">
                <p>✓ Hot Module Replacement</p>
                <p>✓ TypeScript support</p>
                <p>✓ CSS animations</p>
                <p>✓ Web + native ready</p>
              </div>
            </div>
          ) : (
            <div className="prompt-content">
              <span className="prompt-icon">👆</span>
              <span className="prompt-text">Tap the button to see framework details.</span>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button 
          className="toggle-button"
          onClick={handleToggle}
        >
          <span className="button-icon">{showDetails ? '👁️‍🗨️' : '👁️'}</span>
          <span className="button-text">{showDetails ? 'Hide details' : 'Show details'}</span>
        </button>

        {/* Framework Badge */}
        <div className="badge">
          <span className="badge-text">💻 Built with Capacitor + Vite</span>
        </div>
      </main>
    </div>
  );
}

export default App;
