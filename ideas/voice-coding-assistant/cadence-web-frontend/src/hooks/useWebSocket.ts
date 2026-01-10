'use client';

import { useEffect, useCallback } from 'react';
import { wsClient } from '@/lib/websocket';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import type { StreamEvent } from '@/lib/types';

export function useWebSocket() {
  const { settings, setConnected, addEvent, updateTask } = useStore();

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (settings.endpoint) {
      api.setConfig(settings.endpoint, settings.apiKey);
      wsClient.connect(api.getWebSocketUrl());
    }
  }, [settings.endpoint, settings.apiKey]);

  // Handle events
  useEffect(() => {
    const unsubscribeEvent = wsClient.onEvent((event: StreamEvent) => {
      addEvent(event);

      // Update task status based on events
      if (event.data.type === 'task_started') {
        updateTask(event.taskId, { status: 'running' });
      } else if (event.data.type === 'task_completed') {
        updateTask(event.taskId, {
          status: event.data.success ? 'completed' : 'failed',
          completedAt: event.timestamp,
        });
      } else if (event.data.type === 'error' && !event.data.recoverable) {
        updateTask(event.taskId, { status: 'failed' });
      }
    });

    const unsubscribeConnect = wsClient.onConnect(() => {
      setConnected(true);
    });

    const unsubscribeDisconnect = wsClient.onDisconnect(() => {
      setConnected(false);
    });

    return () => {
      unsubscribeEvent();
      unsubscribeConnect();
      unsubscribeDisconnect();
    };
  }, [addEvent, updateTask, setConnected]);

  // Initial connection
  useEffect(() => {
    connect();
    return () => {
      wsClient.disconnect();
    };
  }, [connect]);

  return {
    isConnected: wsClient.isConnected,
    subscribe: wsClient.subscribe.bind(wsClient),
    unsubscribe: wsClient.unsubscribe.bind(wsClient),
    reconnect: connect,
  };
}
