'use client';

import { useState, useCallback } from 'react';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { clsx } from 'clsx';

export function VoiceInterface() {
  const { transcript, setTranscript, addTask, settings } = useStore();
  const { isRecording, isProcessing, audioLevel, error, startRecording, stopRecording } = useVoiceRecorder();

  const [repoUrl, setRepoUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Click to record');
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  const handleRecordToggle = useCallback(async () => {
    if (isRecording) {
      setStatusMessage('Transcribing...');
      const audioBlob = await stopRecording();

      if (audioBlob) {
        try {
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];

            try {
              // Use OpenAI directly if we have the key
              if (settings.openaiKey) {
                const formData = new FormData();
                formData.append('file', audioBlob, 'recording.webm');
                formData.append('model', 'whisper-1');
                formData.append('language', 'en');

                const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${settings.openaiKey}` },
                  body: formData,
                });

                if (!response.ok) {
                  throw new Error(`Whisper API error: ${response.status}`);
                }

                const data = await response.json();
                setTranscript(data.text);
                setTranscribeError(null);
              } else {
                // Fall back to backend API
                const result = await api.transcribe(base64, 'webm');
                setTranscript(result.text);
                setTranscribeError(null);
              }
              setStatusMessage('Transcription complete');
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Transcription failed';
              setTranscribeError(message);
              setStatusMessage('Transcription failed');
            }
          };
          reader.readAsDataURL(audioBlob);
        } catch (err) {
          setTranscribeError('Failed to process audio');
          setStatusMessage('Click to record');
        }
      }
    } else {
      setTranscribeError(null);
      setStatusMessage('Recording... Click to stop');
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, settings.openaiKey, setTranscript]);

  const handleSend = useCallback(async () => {
    if (!transcript.trim()) return;

    setIsSending(true);
    try {
      const task = await api.createTask({
        task: transcript,
        repoUrl: repoUrl || undefined,
      });
      addTask(task);
      setTranscript('');
      setRepoUrl('');
      setStatusMessage('Task created successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      setTranscribeError(message);
    } finally {
      setIsSending(false);
    }
  }, [transcript, repoUrl, addTask, setTranscript]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Voice Assistant</h2>
        <p className="text-[var(--text-dim)]">
          Record your voice command or type below
        </p>
      </div>

      {/* Record Button */}
      <div className="relative">
        {/* Pulse ring when recording */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-error/20 animate-pulse-ring" />
        )}

        <button
          onClick={handleRecordToggle}
          disabled={isProcessing}
          className={clsx(
            'relative w-32 h-32 rounded-full border-4 transition-all duration-200 flex items-center justify-center',
            isRecording
              ? 'border-error bg-error/10 scale-110'
              : isProcessing
              ? 'border-border bg-surface cursor-wait'
              : 'border-primary bg-transparent hover:bg-primary/10'
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-[var(--text-dim)] animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-12 h-12 text-error" />
          ) : (
            <Mic className="w-12 h-12 text-primary" />
          )}
        </button>

        {/* Audio level indicator */}
        {isRecording && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-error rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(8, audioLevel * 32 * Math.random() + 8)}px`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <p className={clsx('text-sm', error || transcribeError ? 'text-error' : 'text-[var(--text-dim)]')}>
        {error || transcribeError || statusMessage}
      </p>

      {/* Transcript Input */}
      <div className="w-full space-y-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <label className="block text-sm text-[var(--text-dim)] mb-2">
            Task Description
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your voice command will appear here, or type directly..."
            className="w-full bg-transparent border-none resize-none min-h-[100px] focus:outline-none text-[var(--text)]"
          />
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <label className="block text-sm text-[var(--text-dim)] mb-2">
            Repository URL (optional)
          </label>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/your/repo"
            className="w-full bg-transparent border-none focus:outline-none text-[var(--text)]"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!transcript.trim() || isSending}
          className={clsx(
            'w-full py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2',
            transcript.trim() && !isSending
              ? 'bg-primary text-white hover:bg-primary-dim'
              : 'bg-border text-[var(--text-dim)] cursor-not-allowed'
          )}
        >
          {isSending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send to Claude
            </>
          )}
        </button>
      </div>

      {/* Quick tips */}
      <div className="w-full bg-surface border border-border rounded-xl p-4">
        <h3 className="text-sm font-medium text-[var(--text-dim)] mb-3">
          Try saying:
        </h3>
        <ul className="space-y-2 text-sm text-[var(--text-dim)]">
          <li>&quot;Add dark mode support to my React app&quot;</li>
          <li>&quot;Fix the authentication bug in login.tsx&quot;</li>
          <li>&quot;Write unit tests for the API endpoints&quot;</li>
        </ul>
      </div>
    </div>
  );
}
