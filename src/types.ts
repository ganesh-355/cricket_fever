export enum UserRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  AUCTION_ADMIN = 'AUCTION_ADMIN',
  TEAM_MANAGER = 'TEAM_MANAGER',
  SPECTATOR = 'SPECTATOR'
}

export type CurrencyMode = 'INR' | 'CREDITS';

export interface BasePriceTier {
  tier_name: string;
  base_amount: number;
}

export interface BidIncrement {
  from_amount: number;
  to_amount: number;
  increment_by: number;
}

export interface AuctionConfig {
  economy_mode: 'CURRENCY' | 'POINTS';
  currency_label: string;
  total_purse_limit: number;
  enable_rtm: boolean;
  max_rtm_cards: number;
  min_squad_size: number;
  max_squad_size: number;
  max_overseas_players: number;
  mandatory_roles: ('BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER')[];
  base_price_tiers: BasePriceTier[];
  bid_increments: BidIncrement[];
}

export interface Tournament {
  id: string;
  name: string;
  season: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  baseBudget: number; // e.g. 1000000000 (100 Cr or 10,000 Lakhs)
  maxSquadSize: number; // e.g. 25
  minSquadSize: number; // e.g. 15
  maxOverseasPlayers: number; // e.g. 8
  createdAt: string;
  config?: AuctionConfig;
}

export interface TournamentRequest {
  id: string;
  name: string;
  teamsCount: number; // 2 to 25
  customRules: string;
  baseBudget: number;
  requestedBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  config?: AuctionConfig;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  managerId: string;
  managerName: string;
  budgetSpent: number;
  maxBudget: number;
  squadSize: number;
  overseasCount: number;
  filledRoles: {
    batsman: number;
    bowler: number;
    allRounder: number;
    wicketKeeper: number;
  };
}

export type PlayerCategory = 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';

export interface Player {
  id: string;
  name: string;
  category: PlayerCategory;
  isOverseas: boolean;
  basePrice: number;
  rating: number; // e.g. 85
  imageUrl: string;
  stats: {
    matches?: number;
    runs?: number;
    strikeRate?: number;
    wickets?: number;
    economy?: number;
    average?: number;
  };
  auctionStatus: 'UNSOLD' | 'SOLD' | 'UPCOMING' | 'ACTIVE';
  soldToTeamId: string | null;
  soldPrice: number | null;
}

export interface AuctionItem {
  playerId: string;
  player: Player;
  currentBid: number;
  highestBidderTeamId: string | null;
  currentBidderTeamId: string | null;
  minIncrement: number;
  timerSeconds: number; // counts down from 30 or 60
  status: 'PENDING' | 'BIDDING' | 'FAIR_PLAY_OVERTIME' | 'SOLD' | 'UNSOLD';
}

export interface Bid {
  id: string;
  playerId: string;
  teamId: string;
  teamName: string;
  amount: number;
  timestamp: string;
  isConfirmed: boolean;
  paddleNumber: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
}
