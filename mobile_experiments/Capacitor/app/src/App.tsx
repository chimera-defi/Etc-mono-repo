/**
 * Capacitor Hello World - Framework Parity Demo
 * Features: Material design, state toggle, animations, dark mode
 */

import { useState, useEffect } from 'react';
import './App.css';

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDark;
};

export default function App() {
  const [showDetails, setShowDetails] = useState(false);
  const [animating, setAnimating] = useState(false);
  const isDark = useDarkMode();

  const toggle = () => {
    setAnimating(true);
    setTimeout(() => { setShowDetails(s => !s); setAnimating(false); }, 150);
  };

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <header className="app-bar">
        <h1 className="app-bar-title">Hello from Valdi Labs</h1>
      </header>
      <main className="content">
        <div className="hero-icon"><span className="hero-emoji">📱</span></div>
        <h2 className="title">Capacitor says hi! 👋</h2>
        <p className="subtitle">Exploring cross-platform framework parity.</p>
        <div className={`card ${showDetails ? 'active' : ''} ${animating ? 'animating' : ''}`}>
          {showDetails ? (
            <div className="details">
              <div className="row"><span className="icon">✅</span><span className="card-title">State toggled!</span></div>
              <p>✓ Hot reload</p><p>✓ Type safety</p><p>✓ Animations</p><p>✓ Cross-platform</p>
            </div>
          ) : (
            <div className="row"><span className="icon">👆</span><span className="prompt">Tap button to see details</span></div>
          )}
        </div>
        <button className="toggle-btn" onClick={toggle}>
          {showDetails ? '👁️ Hide' : '👁️ Show'} details
        </button>
        <div className="badge">Capacitor + Vite</div>
      </main>
    </div>
  );
}
