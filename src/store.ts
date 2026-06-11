import { useAuthStore, authStore } from './stores/authStore';
import { useAuctionStore, auctionStore } from './stores/auctionStore';
import { useWebSocketStore, websocketStore } from './stores/websocketStore';

// Unified custom hook that bridges individual Zustand sub-stores for complete backward-compatibility
export const useStore = () => {
  const auth = useAuthStore();
  const auction = useAuctionStore();
  const ws = useWebSocketStore();

  return {
    ...auth,
    ...auction,
    ...ws
  };
};

// Expose the individual raw Zustand stores too for RBAC and clean decoupling
export {
  authStore,
  auctionStore,
  websocketStore,
  useAuthStore,
  useAuctionStore,
  useWebSocketStore
};
