import { useEffect, useRef, useState, useCallback } from 'react';
import type { WebSocketEvent } from '@/types/api';

type EventListener = (event: WebSocketEvent) => void;

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<EventListener[]>([]);
  const reconnectTimeoutRef = useRef<number>();

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      wsRef.current = new window.WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event: MessageEvent) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data);
          listenersRef.current.forEach((listener: EventListener) => listener(data));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error: Event) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const send = useCallback((data: unknown) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, [isConnected]);

  const addListener = useCallback((listener: EventListener) => {
    listenersRef.current.push(listener);

    return () => {
      listenersRef.current = listenersRef.current.filter((l: EventListener) => l !== listener);
    };
  }, []);

  const joinRoom = useCallback((retrospectiveId: string, userId: string, userName: string, userColor: string) => {
    send({
      type: 'join-room',
      retrospectiveId,
      userId,
      userName,
      userColor
    });
  }, [send]);

  const leaveRoom = useCallback((retrospectiveId: string) => {
    send({ type: 'leave-room', retrospectiveId });
  }, [send]);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    isConnected,
    send,
    addListener,
    joinRoom,
    leaveRoom,
  };
};
