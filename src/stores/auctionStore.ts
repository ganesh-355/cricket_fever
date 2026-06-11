import { create } from 'zustand';
import { 
  Tournament, 
  TournamentRequest,
  Team, 
  Player, 
  AuctionItem, 
  Bid, 
  SystemLog 
} from '../types';

export interface AuctionState {
  tournaments: Tournament[];
  tournamentRequests: TournamentRequest[];
  activeTournamentId: string | null;
  teams: Team[];
  players: Player[];
  activeAuction: AuctionItem | null;
  bidHistory: Bid[];
  logs: SystemLog[];

  // Actions
  createTournament: (tournament: Tournament) => void;
  addTournamentRequest: (req: TournamentRequest) => void;
  approveTournamentRequest: (id: string) => void;
  rejectTournamentRequest: (id: string) => void;
  selectTournament: (id: string | null) => void;
  addTeam: (team: Team) => void;
  addPlayer: (player: Player) => void;
  startAuctionItem: (playerId: string) => void;
  placeBid: (teamId: string, amount: number) => { success: boolean; message: string };
  triggerAutoBid: () => void;
  passTimer: () => void;
  sellCurrentPlayer: () => void;
  unsoldCurrentPlayer: () => void;
  resetSimulation: () => void;
  addSystemLog: (message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT') => void;
}

const genId = () => Math.random().toString(36).substring(2, 9);

const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 't-1',
    name: 'Cricket Fever Premier Auction',
    season: '2026',
    status: 'ACTIVE',
    baseBudget: 1000000000, // 100 Crores
    maxSquadSize: 20,
    minSquadSize: 10,
    maxOverseasPlayers: 6,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_REQUESTS: TournamentRequest[] = [
  {
    id: 'req-1',
    name: 'Weekend Super Smashers League',
    teamsCount: 8,
    customRules: 'Minimum bid increment is set to 5 Lakhs fixed. Limit of 4 overseas players on physical squad rosters.',
    baseBudget: 800000000,
    requestedBy: 'Amit Malhotra (Manager - BL)',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  },
  {
    id: 'req-2',
    name: 'Corporate Friendly Cup',
    teamsCount: 4,
    customRules: 'Casual drafting rules. Base budgets are 50,000 Credits flat. Unlimited registrations.',
    baseBudget: 500000,
    requestedBy: 'Sanjay Dutt',
    status: 'APPROVED',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Mumbai Renegades',
    shortName: 'MR',
    logoUrl: 'https://images.unsplash.com/photo-1540747737956-378724044453?w=120&auto=format&fit=crop&q=80',
    managerId: 'mgr-1',
    managerName: 'Rohit Sharma',
    budgetSpent: 0,
    maxBudget: 1000000000,
    squadSize: 0,
    overseasCount: 0,
    filledRoles: { batsman: 0, bowler: 0, allRounder: 0, wicketKeeper: 0 }
  },
  {
    id: 'team-2',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    logoUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=120&auto=format&fit=crop&q=80',
    managerId: 'mgr-2',
    managerName: 'MS Dhoni',
    budgetSpent: 0,
    maxBudget: 1000000000,
    squadSize: 0,
    overseasCount: 0,
    filledRoles: { batsman: 0, bowler: 0, allRounder: 0, wicketKeeper: 0 }
  },
  {
    id: 'team-3',
    name: 'Bangalore Legends',
    shortName: 'BL',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80',
    managerId: 'mgr-3',
    managerName: 'Virat Kohli',
    budgetSpent: 0,
    maxBudget: 1000000000,
    squadSize: 0,
    overseasCount: 0,
    filledRoles: { batsman: 0, bowler: 0, allRounder: 0, wicketKeeper: 0 }
  },
  {
    id: 'team-4',
    name: 'Delhi Gladiators',
    shortName: 'DG',
    logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=120&auto=format&fit=crop&q=80',
    managerId: 'mgr-4',
    managerName: 'Rishabh Pant',
    budgetSpent: 0,
    maxBudget: 1000000000,
    squadSize: 0,
    overseasCount: 0,
    filledRoles: { batsman: 0, bowler: 0, allRounder: 0, wicketKeeper: 0 }
  },
  {
    id: 'team-5',
    name: 'Kolkata Night Hawks',
    shortName: 'KNH',
    logoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=120&auto=format&fit=crop&q=80',
    managerId: 'mgr-5',
    managerName: 'Gautam Gambhir',
    budgetSpent: 0,
    maxBudget: 1000000000,
    squadSize: 0,
    overseasCount: 0,
    filledRoles: { batsman: 0, bowler: 0, allRounder: 0, wicketKeeper: 0 }
  }
];

const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p-1',
    name: 'Virat Kohli',
    category: 'BATSMAN',
    isOverseas: false,
    basePrice: 20000000,
    rating: 96,
    imageUrl: 'https://images.unsplash.com/photo-1540747737956-378724044453?w=300&auto=format&fit=crop&q=80',
    stats: { matches: 240, runs: 7500, strikeRate: 135.2, average: 38.5 },
    auctionStatus: 'UPCOMING',
    soldToTeamId: null,
    soldPrice: null
  },
  {
    id: 'p-2',
    name: 'Jasprit Bumrah',
    category: 'BOWLER',
    isOverseas: false,
    basePrice: 20000000,
    rating: 98,
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=300&auto=format&fit=crop&q=80',
    stats: { matches: 125, wickets: 148, economy: 6.54, average: 18.2 },
    auctionStatus: 'UPCOMING',
    soldToTeamId: null,
    soldPrice: null
  },
  {
    id: 'p-3',
    name: 'Glenn Maxwell',
    category: 'ALL_ROUNDER',
    isOverseas: true,
    basePrice: 15000000,
    rating: 89,
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
    stats: { matches: 135, runs: 3100, strikeRate: 157.6, wickets: 38 },
    auctionStatus: 'UPCOMING',
    soldToTeamId: null,
    soldPrice: null
  },
  {
    id: 'p-4',
    name: 'Nicholas Pooran',
    category: 'WICKET_KEEPER',
    isOverseas: true,
    basePrice: 15000000,
    rating: 91,
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=300&auto=format&fit=crop&q=80',
    stats: { matches: 90, runs: 2400, strikeRate: 161.4, average: 32.1 },
    auctionStatus: 'UPCOMING',
    soldToTeamId: null,
    soldPrice: null
  },
  {
    id: 'p-5',
    name: 'Rashid Khan',
    category: 'BOWLER',
    isOverseas: true,
    basePrice: 20000000,
    rating: 95,
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&auto=format&fit=crop&q=80',
    stats: { matches: 109, wickets: 139, economy: 6.67, average: 20.8 },
    auctionStatus: 'UPCOMING',
    soldToTeamId: null,
    soldPrice: null
  },
  {
    id: 'p-6',
    name: 'Hardik Pandya',
    category: 'ALL_ROUNDER',
    isOverseas: false,
    basePrice: 15000000,
    rating: 90,
    imageUrl: 'https://images.unsplash.com/photo-1540747737956-378724044453?w=300&auto=format&fit=crop&q=80',
    stats: { matches: 120, runs: 2200, strikeRate: 145.8, wickets: 60 },
    auctionStatus: 'UPCOMING',
    soldToTeamId: null,
    soldPrice: null
  },
  {
    id: 'p-7',
    name: 'Travis Head',
    category: 'BATSMAN',
    isOverseas: true,
    basePrice: 10000000,
    rating: 88,
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=300&auto=format&fit=crop&q=80',
    stats: { matches: 45, runs: 1250, strikeRate: 142.3, average: 31.2 },
    auctionStatus: 'UPCOMING',
    soldToTeamId: null,
    soldPrice: null
  },
  {
    id: 'p-8',
    name: 'Sunil Narine',
    category: 'ALL_ROUNDER',
    isOverseas: true,
    basePrice: 15000000,
    rating: 92,
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
    stats: { matches: 162, wickets: 163, economy: 6.61, runs: 1350 },
    auctionStatus: 'UPCOMING',
    soldToTeamId: null,
    soldPrice: null
  }
];

export const useAuctionStore = create<AuctionState>((set, get) => ({
  tournaments: INITIAL_TOURNAMENTS,
  tournamentRequests: INITIAL_REQUESTS,
  activeTournamentId: 't-1',
  teams: INITIAL_TEAMS,
  players: INITIAL_PLAYERS,
  activeAuction: null,
  bidHistory: [],
  logs: [
    { id: 'l1', timestamp: new Date().toLocaleTimeString(), message: 'System initialized. Welcome to the Cricket Auction Engine!', type: 'INFO' }
  ],

  addSystemLog: (message, type) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog: SystemLog = { id: genId(), timestamp, message, type };
    set((state) => ({ logs: [newLog, ...state.logs.slice(0, 49)] }));
  },

  createTournament: (tournament) => set((state) => ({ 
    tournaments: [...state.tournaments, tournament],
    activeTournamentId: tournament.id
  })),

  addTournamentRequest: (req) => set((state) => {
    const nextRequests = [req, ...state.tournamentRequests];
    get().addSystemLog(`PROPOSAL INGESTED: Requested approval for tournament [${req.name}] from Platform Admin.`, 'INFO');
    return { tournamentRequests: nextRequests };
  }),

  approveTournamentRequest: (id) => set((state) => {
    const revisedRequests = state.tournamentRequests.map(r => 
      r.id === id ? { ...r, status: 'APPROVED' as const } : r
    );
    const targetReq = state.tournamentRequests.find(r => r.id === id);
    if (!targetReq) return { tournamentRequests: revisedRequests };

    // Create a new corresponding tournament in the live catalog
    const newTournament: Tournament = {
      id: `t-${targetReq.id}`,
      name: targetReq.name,
      season: '2026',
      status: 'ACTIVE',
      baseBudget: targetReq.baseBudget,
      maxSquadSize: targetReq.config?.max_squad_size ?? 20,
      minSquadSize: targetReq.config?.min_squad_size ?? 10,
      maxOverseasPlayers: targetReq.config?.max_overseas_players ?? 6,
      createdAt: new Date().toISOString(),
      config: targetReq.config
    };

    get().addSystemLog(`TOURNAMENT AUTHORIZED: Platform admin approved registration of [${targetReq.name}] with size [${targetReq.teamsCount} teams]!`, 'SUCCESS');

    return {
      tournamentRequests: revisedRequests,
      tournaments: [...state.tournaments, newTournament],
      activeTournamentId: newTournament.id
    };
  }),

  rejectTournamentRequest: (id) => set((state) => {
    const revisedRequests = state.tournamentRequests.map(r => 
      r.id === id ? { ...r, status: 'REJECTED' as const } : r
    );
    const targetReq = state.tournamentRequests.find(r => r.id === id);
    if (targetReq) {
      get().addSystemLog(`TOURNAMENT REJECTED: Custom tournament [${targetReq.name}] was declined by the administrator.`, 'WARNING');
    }
    return { tournamentRequests: revisedRequests };
  }),

  selectTournament: (id) => set((state) => {
    const target = state.tournaments.find(t => t.id === id);
    if (!target) return { activeTournamentId: id };

    // Update teams to match the new tournament's base budget
    const updatedTeams = state.teams.map(t => {
      const isCustomCurrency = target.config?.economy_mode === 'POINTS';
      const allocatedPurse = target.config?.total_purse_limit ?? target.baseBudget;
      return {
        ...t,
        maxBudget: allocatedPurse,
        budgetSpent: 0,
        squadSize: 0,
        overseasCount: 0,
        filledRoles: { batsman: 0, bowler: 0, allRounder: 0, wicketKeeper: 0 }
      };
    });

    // Reset players' auctionStatus to 'UPCOMING'
    const updatedPlayers = state.players.map(p => ({
      ...p,
      auctionStatus: 'UPCOMING' as const,
      soldToTeamId: null,
      soldPrice: null
    }));

    get().addSystemLog(`ACTIVE TOURNAMENT SWITCHED: Welcome to [${target.name}]. Teams and players have been synced to these budget rules.`, 'INFO');

    return {
      activeTournamentId: id,
      teams: updatedTeams,
      players: updatedPlayers,
      activeAuction: null,
      bidHistory: []
    };
  }),

  addTeam: (team) => {
    set((state) => ({ teams: [...state.teams, team] }));
    get().addSystemLog(`Franchise Team registered successfully: ${team.name}`, 'SUCCESS');
  },

  addPlayer: (p) => {
    set((state) => ({ players: [...state.players, p] }));
    get().addSystemLog(`Player entered catalog draft pool: ${p.name}`, 'INFO');
  },

  startAuctionItem: (playerId) => {
    const player = get().players.find(p => p.id === playerId);
    if (!player) return;

    const updatedPlayers = get().players.map(p => 
      p.id === playerId ? { ...p, auctionStatus: 'ACTIVE' as const } : p
    );

    const tournament = get().tournaments.find(to => to.id === get().activeTournamentId);
    let minIncrement = 100000;
    if (tournament?.config?.bid_increments && tournament.config.bid_increments.length > 0) {
      const match = tournament.config.bid_increments.find(
        rule => player.basePrice >= rule.from_amount && player.basePrice < rule.to_amount
      );
      if (match) {
        minIncrement = match.increment_by;
      } else {
        const sorted = [...tournament.config.bid_increments].sort((a,b) => b.from_amount - a.from_amount);
        minIncrement = sorted[0]?.increment_by ?? 100000;
      }
    } else {
      minIncrement = player.basePrice < 5000000 ? 200000 : 
                     player.basePrice < 20000000 ? 500000 : 
                     1000000;
    }

    const newAuction: AuctionItem = {
      playerId,
      player: { ...player, auctionStatus: 'ACTIVE' },
      currentBid: player.basePrice,
      highestBidderTeamId: null,
      currentBidderTeamId: null,
      minIncrement,
      timerSeconds: 30,
      status: 'BIDDING'
    };

    set({
      players: updatedPlayers,
      activeAuction: newAuction,
      bidHistory: []
    });

    const currencyLabel = tournament?.config?.currency_label ?? '₹';
    get().addSystemLog(`HAMMER UP: Current bidding open for ${player.name} (Base Price: ${currencyLabel}${player.basePrice.toLocaleString()})`, 'ALERT');
  },

  placeBid: (teamId, amount) => {
    const active = get().activeAuction;
    if (!active) return { success: false, message: 'No active player in the bidding pool' };
    if (active.status !== 'BIDDING' && active.status !== 'FAIR_PLAY_OVERTIME') {
      return { success: false, message: 'Bidding is currently closed or complete' };
    }

    const minRequired = active.highestBidderTeamId ? active.currentBid + active.minIncrement : active.player.basePrice;
    if (amount < minRequired) {
      const currencyLabel = get().tournaments.find(to => to.id === get().activeTournamentId)?.config?.currency_label ?? '₹';
      return { success: false, message: `Bid of ${currencyLabel}${amount.toLocaleString()} is below the minimum required bid of ${currencyLabel}${minRequired.toLocaleString()}` };
    }

    const team = get().teams.find(t => t.id === teamId);
    if (!team) return { success: false, message: 'Franchise team not found' };

    const prospectiveSpent = team.budgetSpent + amount;
    if (prospectiveSpent > team.maxBudget) {
      const currencyLabel = get().tournaments.find(to => to.id === get().activeTournamentId)?.config?.currency_label ?? '₹';
      return { success: false, message: `FAILED: Team budget limit exceeded. Team only has ${currencyLabel}${(team.maxBudget - team.budgetSpent).toLocaleString()} remaining.` };
    }

    const tournament = get().tournaments.find(to => to.id === get().activeTournamentId);
    if (tournament) {
      if (team.squadSize >= tournament.maxSquadSize) {
        return { success: false, message: `FAILED: Squad size limits reached (${tournament.maxSquadSize} slots max).` };
      }
      if (active.player.isOverseas && team.overseasCount >= tournament.maxOverseasPlayers) {
        return { success: false, message: `FAILED: Overseas slots fully utilized (${tournament.maxOverseasPlayers} maximum overseas limits).` };
      }
    }

    const newBid: Bid = {
      id: genId(),
      playerId: active.playerId,
      teamId,
      teamName: team.name,
      amount,
      timestamp: new Date().toLocaleTimeString(),
      isConfirmed: true,
      paddleNumber: `PADDLE-${team.shortName}-${10 + Math.floor(Math.random() * 80)}`
    };

    const overlayOvertime = active.timerSeconds < 10;
    const nextTimer = overlayOvertime ? Math.max(12, active.timerSeconds + 5) : active.timerSeconds;

    // Dynamically calculate the NEXT increment based on the new amount
    let nextIncrement = active.minIncrement;
    if (tournament?.config?.bid_increments && tournament.config.bid_increments.length > 0) {
      const match = tournament.config.bid_increments.find(
        rule => amount >= rule.from_amount && amount < rule.to_amount
      );
      if (match) {
        nextIncrement = match.increment_by;
      } else {
        const sorted = [...tournament.config.bid_increments].sort((a,b) => b.from_amount - a.from_amount);
        nextIncrement = sorted[0]?.increment_by ?? active.minIncrement;
      }
    } else {
      nextIncrement = amount < 5000000 ? 200000 : 
                      amount < 20000000 ? 500000 : 
                      1000000;
    }

    const revisedAuction: AuctionItem = {
      ...active,
      currentBid: amount,
      highestBidderTeamId: teamId,
      currentBidderTeamId: teamId,
      timerSeconds: nextTimer,
      status: overlayOvertime ? 'FAIR_PLAY_OVERTIME' : 'BIDDING',
      minIncrement: nextIncrement
    };

    set((state) => ({
      activeAuction: revisedAuction,
      bidHistory: [newBid, ...state.bidHistory]
    }));

    const currencyLabel = tournament?.config?.currency_label ?? '₹';
    get().addSystemLog(`NEW BID: ${team.name} placed bid of ${currencyLabel}${amount.toLocaleString()}!`, 'SUCCESS');
    return { success: true, message: 'Bid recorded in ledger' };
  },

  triggerAutoBid: () => {
    const active = get().activeAuction;
    if (!active) return;

    const availableTeams = get().teams.filter(t => t.id !== active.highestBidderTeamId);
    if (availableTeams.length === 0) return;

    const chosenTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
    const bidValue = active.highestBidderTeamId ? active.currentBid + active.minIncrement : active.player.basePrice;

    const res = get().placeBid(chosenTeam.id, bidValue);
    if (!res.success) {
      const retryTeams = availableTeams.filter(t => t.id !== chosenTeam.id);
      if (retryTeams.length > 0) {
        const fallbackTeam = retryTeams[Math.floor(Math.random() * retryTeams.length)];
        get().placeBid(fallbackTeam.id, bidValue);
      }
    }
  },

  passTimer: () => {
    const active = get().activeAuction;
    if (!active) return;

    if (active.timerSeconds <= 1) {
      if (active.highestBidderTeamId) {
        get().sellCurrentPlayer();
      } else {
        get().unsoldCurrentPlayer();
      }
    } else {
      set({
        activeAuction: { ...active, timerSeconds: active.timerSeconds - 1 }
      });

      if (active.timerSeconds % 7 === 0 && Math.random() > 0.4 && active.timerSeconds > 2) {
        get().triggerAutoBid();
      }
    }
  },

  sellCurrentPlayer: () => {
    const active = get().activeAuction;
    if (!active || !active.highestBidderTeamId) return;

    const buyerTeamId = active.highestBidderTeamId;
    const finalAmount = active.currentBid;

    const updatedTeams = get().teams.map(t => {
      if (t.id === buyerTeamId) {
        const isOverseas = active.player.isOverseas;
        const mappedRole = active.player.category;

        const updatedRoles = { ...t.filledRoles };
        if (mappedRole === 'BATSMAN') updatedRoles.batsman += 1;
        if (mappedRole === 'BOWLER') updatedRoles.bowler += 1;
        if (mappedRole === 'ALL_ROUNDER') updatedRoles.allRounder += 1;
        if (mappedRole === 'WICKET_KEEPER') updatedRoles.wicketKeeper += 1;

        return {
          ...t,
          budgetSpent: t.budgetSpent + finalAmount,
          squadSize: t.squadSize + 1,
          overseasCount: t.overseasCount + (isOverseas ? 1 : 0),
          filledRoles: updatedRoles
        };
      }
      return t;
    });

    const updatedPlayers = get().players.map(p => {
      if (p.id === active.playerId) {
        return {
          ...p,
          auctionStatus: 'SOLD' as const,
          soldToTeamId: buyerTeamId,
          soldPrice: finalAmount
        };
      }
      return p;
    });

    set({
      players: updatedPlayers,
      teams: updatedTeams,
      activeAuction: {
        ...active,
        status: 'SOLD',
        timerSeconds: 0
      }
    });

    const buyerTeamName = get().teams.find(t => t.id === buyerTeamId)?.name || 'An elite franchise';
    get().addSystemLog(`SOLD HAMMER! ${active.player.name} sold to ${buyerTeamName} for ₹${finalAmount.toLocaleString()}`, 'SUCCESS');
  },

  unsoldCurrentPlayer: () => {
    const active = get().activeAuction;
    if (!active) return;

    const updatedPlayers = get().players.map(p => {
      if (p.id === active.playerId) {
        return {
          ...p,
          auctionStatus: 'UNSOLD' as const
        };
      }
      return p;
    });

    set({
      players: updatedPlayers,
      activeAuction: {
        ...active,
        status: 'UNSOLD',
        timerSeconds: 0
      }
    });

    get().addSystemLog(`UNSOLD! ${active.player.name} passes unsold. It can be re-entered in the tie-breaker rounds later.`, 'WARNING');
  },

  resetSimulation: () => {
    set({
      teams: INITIAL_TEAMS,
      players: INITIAL_PLAYERS,
      tournaments: INITIAL_TOURNAMENTS,
      tournamentRequests: INITIAL_REQUESTS,
      activeTournamentId: 't-1',
      activeAuction: null,
      bidHistory: [],
      logs: [
        { id: genId(), timestamp: new Date().toLocaleTimeString(), message: 'Simulation parameters hard-reset. Bidding pool restored.', type: 'INFO' }
      ]
    });
  }
}));

export const auctionStore = useAuctionStore;
