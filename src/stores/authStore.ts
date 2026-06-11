import { create } from 'zustand';
import { UserRole, CurrencyMode } from '../types';
import { useAuctionStore } from './auctionStore';

export interface AuthState {
  userRole: UserRole;
  userName: string;
  userTeamId: string | null;
  currencyMode: CurrencyMode;
  isAuthenticated: boolean;
  
  setRole: (role: UserRole) => void;
  setUserName: (name: string) => void;
  setUserTeamId: (teamId: string | null) => void;
  setCurrencyMode: (mode: CurrencyMode) => void;
  setAuthenticated: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userRole: UserRole.SPECTATOR,
  userName: 'Guest Spectator',
  userTeamId: null,
  currencyMode: 'INR',
  isAuthenticated: false,

  setRole: (role) => {
    let teamId = get().userTeamId;
    let name = get().userName;
    if (role === UserRole.PLATFORM_ADMIN) {
      name = 'Admin (Platform)';
      teamId = null;
    } else if (role === UserRole.AUCTION_ADMIN) {
      name = 'Moderator (Auction)';
      teamId = null;
    } else if (role === UserRole.TEAM_MANAGER) {
      name = 'Manager (Mumbai)';
      teamId = 'team-1'; // Select Mumbai as default
    } else {
      name = 'Guest Spectator';
      teamId = null;
    }
    set({ userRole: role, userName: name, userTeamId: teamId });
    
    // Cross-store interaction: log the change
    try {
      useAuctionStore.getState().addSystemLog(`Role switched to ${role}`, 'INFO');
    } catch (e) {
      console.warn('AuctionStore log hook unavailable during init', e);
    }
  },

  setUserName: (name) => set({ userName: name }),
  
  setUserTeamId: (teamId) => {
    set({ userTeamId: teamId });
    if (teamId) {
      try {
        const teams = useAuctionStore.getState().teams;
        const selectedTeam = teams.find(t => t.id === teamId);
        if (selectedTeam) {
          useAuctionStore.getState().addSystemLog(`Representing team franchise: ${selectedTeam.name}`, 'SUCCESS');
        }
      } catch (e) {
        console.warn('AuctionStore unavailable for team lookup', e);
      }
    }
  },

  setCurrencyMode: (currencyMode) => {
    set({ currencyMode });
    try {
      useAuctionStore.getState().addSystemLog(
        `Currency scale mode changed to: ${currencyMode === 'INR' ? 'INR (₹ / Lakhs / Crores)' : 'Virtual Credits'}`, 
        'INFO'
      );
    } catch (e) {
      console.warn('AuctionStore unavailable for currency mode log', e);
    }
  },

  setAuthenticated: (status) => set({ isAuthenticated: status })
}));

export const authStore = useAuthStore;
