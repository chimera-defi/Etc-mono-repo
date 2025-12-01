/**
 * Capacitor Hello World - Framework Parity Demo
 * Features: Material design, state toggle, animations, dark mode
 */

import { useState, useEffect } from 'react';
import './App.css';

function useDarkMode() {
  const [isDark, setIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDark;
}

const details = [
  '✓ Hot reload',
  '✓ Type safety',
  '✓ Animations',
  '✓ Cross-platform',
];

export default function App() {
  const [showDetails, setShowDetails] = useState(false);
  const [animating, setAnimating] = useState(false);
  const isDark = useDarkMode();

  const toggle = () => {
    setAnimating(true);
    setTimeout(() => {
      setShowDetails(prev => !prev);
      setAnimating(false);
    }, 150);
  };

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      {/* App Bar */}
      <header className="app-bar">
        <h1 className="app-bar-title">Hello from Valdi Labs</h1>
      </header>

      {/* Main Content */}
      <main className="content">
        {/* Hero Icon */}
        <div className="hero-icon">
          <span className="hero-emoji">📱</span>
        </div>

        {/* Title & Subtitle */}
        <h2 className="title">Capacitor says hi! 👋</h2>
        <p className="subtitle">Exploring cross-platform framework parity.</p>

        {/* Content Card */}
        <div className={`card ${showDetails ? 'active' : ''} ${animating ? 'animating' : ''}`}>
          {showDetails ? (
            <div className="details">
              <div className="row">
                <span className="icon">✅</span>
                <span className="card-title">State toggled!</span>
              </div>
              {details.map((item, index) => (
                <p key={index} className="detail-item">{item}</p>
              ))}
            </div>
          ) : (
            <div className="row">
              <span className="icon">👆</span>
              <span className="prompt">Tap button to see details</span>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button className="toggle-btn" onClick={toggle}>
          {showDetails ? '👁️ Hide details' : '👁️ Show details'}
        </button>

        {/* Framework Badge */}
        <div className="badge">Capacitor + Vite</div>
      </main>
    </div>
  );
}
