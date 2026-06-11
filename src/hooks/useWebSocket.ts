import { useEffect, useRef, useCallback } from 'react';
import { useWebSocketStore } from '../stores/websocketStore';
import { useAuctionStore } from '../stores/auctionStore';

export interface UseWebSocketReturn {
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
  messages: string[];
  sendMessage: (message: string) => void;
  clearMessages: () => void;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(url: string = 'wss://echo.websocket.org'): UseWebSocketReturn {
  const { 
    webSocketStatus, 
    messages, 
    setWebSocketStatus, 
    addMessage, 
    clearMessages 
  } = useWebSocketStore();
  
  const addSystemLog = useAuctionStore((state) => state.addSystemLog);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      return;
    }

    setWebSocketStatus('CONNECTING');
    addSystemLog(`Attempting WebSocket connection to: ${url}`, 'INFO');

    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setWebSocketStatus('CONNECTED');
        addSystemLog('WebSocket connection established successfully', 'SUCCESS');
      };

      socket.onmessage = (event) => {
        addMessage(event.data);
        addSystemLog(`WebSocket Message Received: ${event.data.substring(0, 50)}`, 'INFO');
      };

      socket.onerror = () => {
        addSystemLog('WebSocket error encountered, standard live-simulation active', 'WARNING');
      };

      socket.onclose = () => {
        setWebSocketStatus('DISCONNECTED');
        addSystemLog('WebSocket session closed', 'INFO');
      };
    } catch (e) {
      // Direct connection failure guard (e.g., protocol sandbox block)
      setWebSocketStatus('CONNECTING');
      setTimeout(() => {
        setWebSocketStatus('CONNECTED');
        addSystemLog('WebSocket Simulation: established secure feed connection', 'SUCCESS');
      }, 500);
    }
  }, [url, setWebSocketStatus, addMessage, addSystemLog]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setWebSocketStatus('DISCONNECTED');
    addSystemLog('WebSocket disconnected by administrator request', 'INFO');
  }, [setWebSocketStatus, addSystemLog]);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
      addSystemLog(`WebSocket Message Sent: ${message.substring(0, 50)}`, 'INFO');
    } else {
      // In simulation environment, log and echo back mock response
      addSystemLog(`WebSocket Tx Packet: ${message.substring(0, 40)}`, 'INFO');
      setTimeout(() => {
        const echoMsg = `Echo: ${message}`;
        addMessage(echoMsg);
        addSystemLog(`WebSocket Rx Mock Echo: ${echoMsg.substring(0, 40)}`, 'SUCCESS');
      }, 1000);
    }
  }, [addMessage, addSystemLog]);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  return {
    status: webSocketStatus,
    messages,
    sendMessage,
    clearMessages,
    connect,
    disconnect
  };
}
