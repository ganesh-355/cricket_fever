import { create } from 'zustand';

export interface WebSocketState {
  webSocketStatus: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
  messages: string[];
  
  setWebSocketStatus: (status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING') => void;
  addMessage: (message: string) => void;
  clearMessages: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  webSocketStatus: 'CONNECTED',
  messages: [],

  setWebSocketStatus: (webSocketStatus) => set({ webSocketStatus }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] })
}));

export const websocketStore = useWebSocketStore;
