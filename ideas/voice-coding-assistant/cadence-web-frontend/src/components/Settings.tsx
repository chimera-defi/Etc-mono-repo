'use client';

import { useState, useCallback } from 'react';
import {
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Server,
  Key,
  Mic,
  Moon,
  Sun,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { clsx } from 'clsx';

export function Settings() {
  const { settings, updateSettings, isConnected, setConnected } = useStore();

  const [localSettings, setLocalSettings] = useState(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = useCallback(
    (field: keyof typeof localSettings, value: string | boolean) => {
      setLocalSettings((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleTestConnection = useCallback(async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      api.setConfig(localSettings.endpoint, localSettings.apiKey);
      await api.health();
      setTestResult('success');
      setConnected(true);
    } catch {
      setTestResult('error');
      setConnected(false);
    } finally {
      setIsTesting(false);
    }
  }, [localSettings.endpoint, localSettings.apiKey, setConnected]);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    updateSettings(localSettings);
    api.setConfig(localSettings.endpoint, localSettings.apiKey);

    // Simulate save delay
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  }, [localSettings, updateSettings]);

  const toggleDarkMode = useCallback(() => {
    const newValue = !localSettings.darkMode;
    handleChange('darkMode', newValue);
    document.documentElement.classList.toggle('light', !newValue);
    document.documentElement.classList.toggle('dark', newValue);
  }, [localSettings.darkMode, handleChange]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>

      {/* Connection Settings */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Server className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Connection</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-dim)] mb-2">
              API Endpoint
            </label>
            <input
              type="text"
              value={localSettings.endpoint}
              onChange={(e) => handleChange('endpoint', e.target.value)}
              placeholder="http://localhost:3001"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-dim)] mb-2">
              API Key (optional)
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={localSettings.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="cad_xxxxxxxx"
                className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text)]"
              >
                {showApiKey ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !localSettings.endpoint}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
                localSettings.endpoint
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'bg-border text-[var(--text-dim)] cursor-not-allowed'
              )}
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </button>

            {testResult === 'success' && (
              <span className="flex items-center gap-2 text-success text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </span>
            )}
            {testResult === 'error' && (
              <span className="flex items-center gap-2 text-error text-sm">
                <XCircle className="w-4 h-4" />
                Connection failed
              </span>
            )}
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-success' : 'bg-error'
                )}
              />
              <span className="text-[var(--text-dim)]">
                {isConnected ? 'WebSocket connected' : 'WebSocket disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">OpenAI (Voice Transcription)</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-dim)] mb-2">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={showOpenAiKey ? 'text' : 'password'}
                value={localSettings.openaiKey}
                onChange={(e) => handleChange('openaiKey', e.target.value)}
                placeholder="sk-xxxxxxxx"
                className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text)]"
              >
                {showOpenAiKey ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-[var(--text-dim)] mt-2">
              Required for voice transcription. Get your key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI Dashboard
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Mic className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Preferences</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-medium">Voice Commands</span>
              <p className="text-sm text-[var(--text-dim)]">
                Enable microphone for voice input
              </p>
            </div>
            <button
              onClick={() => handleChange('voiceEnabled', !localSettings.voiceEnabled)}
              className={clsx(
                'relative w-12 h-6 rounded-full transition-colors',
                localSettings.voiceEnabled ? 'bg-primary' : 'bg-border'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  localSettings.voiceEnabled ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-medium">Auto-speak Responses</span>
              <p className="text-sm text-[var(--text-dim)]">
                Read responses aloud using text-to-speech
              </p>
            </div>
            <button
              onClick={() => handleChange('autoSpeak', !localSettings.autoSpeak)}
              className={clsx(
                'relative w-12 h-6 rounded-full transition-colors',
                localSettings.autoSpeak ? 'bg-primary' : 'bg-border'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  localSettings.autoSpeak ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              {localSettings.darkMode ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              <span className="font-medium">Dark Mode</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={clsx(
                'relative w-12 h-6 rounded-full transition-colors',
                localSettings.darkMode ? 'bg-primary' : 'bg-border'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  localSettings.darkMode ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dim transition-colors flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Settings
          </>
        )}
      </button>

      {/* Version info */}
      <div className="mt-8 text-center text-sm text-[var(--text-dim)]">
        <p>Cadence Web v0.1.0</p>
        <p className="mt-1">
          <a
            href="https://github.com/chimera-defi/Etc-mono-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View on GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
