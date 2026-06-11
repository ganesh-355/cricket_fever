import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { TournamentRequest, Tournament } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Settings, 
  Coins, 
  Users, 
  Flame, 
  Trash2, 
  Plus, 
  Copy, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Info,
  Calendar,
  Lock,
  CoinsIcon,
  Layers,
  ArrowRight
} from 'lucide-react';

interface BasePriceTier {
  tier_name: string;
  base_amount: number;
}

interface BidIncrement {
  from_amount: number;
  to_amount: number;
  increment_by: number;
}

interface AuctionConfigForm {
  tournament_name: string;
  auction_datetime: string;
  visibility: 'Public' | 'Private';
  invite_code: string;
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

const DEFAULT_FORM_VALUES: AuctionConfigForm = {
  tournament_name: '',
  auction_datetime: '',
  visibility: 'Public',
  invite_code: '',
  economy_mode: 'POINTS',
  currency_label: 'Pts',
  total_purse_limit: 100000000, // 100M custom limit
  enable_rtm: false,
  max_rtm_cards: 2,
  min_squad_size: 11,
  max_squad_size: 18,
  max_overseas_players: 4,
  mandatory_roles: ['BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'],
  base_price_tiers: [
    { tier_name: 'Marquee Tier A', base_amount: 2000000 },
    { tier_name: 'Gold Tier B', base_amount: 1000000 },
    { tier_name: 'Silver Tier C', base_amount: 500000 }
  ],
  bid_increments: [
    { from_amount: 0, to_amount: 5000000, increment_by: 200000 },
    { from_amount: 5000000, to_amount: 20000000, increment_by: 500000 },
    { from_amount: 20000000, to_amount: 100000000, increment_by: 1000000 }
  ]
};

export const RegisterAuction: React.FC = () => {
  const { 
    tournamentRequests, 
    addTournamentRequest, 
    userName, 
    selectTournament,
    tournaments,
    approveTournamentRequest
  } = useStore();

  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'create' | 'stream'>('create');
  const [activeTab, setActiveTab] = useState<'general' | 'economy' | 'squad' | 'bidding'>('general');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [latestDraftId, setLatestDraftId] = useState<string | null>(null);

  // Initialize react-hook-form
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty }
  } = useForm<AuctionConfigForm>({
    defaultValues: DEFAULT_FORM_VALUES
  });

  // Watch fields needed for conditional rendering & defaults
  const watchedVisibility = useWatch({ control, name: 'visibility' });
  const watchedEconomyMode = useWatch({ control, name: 'economy_mode' });
  const watchedEnableRtm = useWatch({ control, name: 'enable_rtm' });
  const watchedInviteCode = useWatch({ control, name: 'invite_code' });

  // Field arrays for Tab 4
  const { 
    fields: tierFields, 
    append: appendTier, 
    remove: removeTier 
  } = useFieldArray({
    control,
    name: 'base_price_tiers'
  });

  const { 
    fields: incrementFields, 
    append: appendIncrement, 
    remove: removeIncrement 
  } = useFieldArray({
    control,
    name: 'bid_increments'
  });

  // Automatically update currency label default when economy mode changes
  useEffect(() => {
    if (watchedEconomyMode === 'POINTS') {
      setValue('currency_label', 'Pts');
    } else {
      setValue('currency_label', '₹');
    }
  }, [watchedEconomyMode, setValue]);

  // Handle invitation code auto-generation if visibility is toggled to Private
  useEffect(() => {
    if (watchedVisibility === 'Private' && !watchedInviteCode) {
      const code = 'FEVER-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setValue('invite_code', code);
    }
  }, [watchedVisibility, watchedInviteCode, setValue]);

  // Copy invitation code helper
  const copyInviteCodeToClipboard = () => {
    if (watchedInviteCode) {
      navigator.clipboard.writeText(watchedInviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Helper to detect tab errors
  const tabHasErrors = (tabId: 'general' | 'economy' | 'squad' | 'bidding') => {
    if (tabId === 'general') {
      return !!(errors.tournament_name || errors.auction_datetime || errors.visibility || errors.invite_code);
    }
    if (tabId === 'economy') {
      return !!(errors.economy_mode || errors.currency_label || errors.total_purse_limit || errors.enable_rtm || errors.max_rtm_cards);
    }
    if (tabId === 'squad') {
      return !!(errors.min_squad_size || errors.max_squad_size || errors.max_overseas_players || errors.mandatory_roles);
    }
    if (tabId === 'bidding') {
      return !!(errors.base_price_tiers || errors.bid_increments);
    }
    return false;
  };

  // On form submission
  const onSubmit = (data: AuctionConfigForm) => {
    // Generate rules string representation for backward compliance
    const rulesSummary = `
      Economy Mode: ${data.economy_mode} | Currency Tag: ${data.currency_label}
      Total Purse Limit: ${data.total_purse_limit.toLocaleString()} ${data.currency_label}
      Admin Visibility: ${data.visibility} (Invite Key: ${data.visibility === 'Private' ? data.invite_code : 'NA'})
      Squad Limits: Competing roster size min ${data.min_squad_size} up to max ${data.max_squad_size} players
      Foreign player slots: Max cap limit of ${data.max_overseas_players} overseas members
      RTM Capability: ${data.enable_rtm ? `Active (Allowance: ${data.max_rtm_cards} cards)` : 'Inactive'}
      Roles required: ${data.mandatory_roles.join(', ')}
      Starting Tier Categories: ${data.base_price_tiers.map(t => `${t.tier_name} (${t.base_amount.toLocaleString()})`).join('; ')}
      Incremental Multipliers: ${data.bid_increments.map(b => `[From ${b.from_amount.toLocaleString()}-${b.to_amount.toLocaleString()} +${b.increment_by.toLocaleString()}]`).join(', ')}
      Active Countdown Kickoff: ${data.auction_datetime}
    `.trim().replace(/\s+/g, ' ');

    const newRequestId = `req-${Date.now()}`;
    const newRequest: TournamentRequest = {
      id: newRequestId,
      name: data.tournament_name,
      teamsCount: 8, // Set standard 8 default to ensure simulator compatibility
      customRules: rulesSummary,
      baseBudget: Number(data.total_purse_limit),
      requestedBy: userName || 'Admin Host',
      status: 'APPROVED', // Auto approved for instant action
      createdAt: new Date().toISOString(),
      config: {
        economy_mode: data.economy_mode,
        currency_label: data.currency_label,
        total_purse_limit: Number(data.total_purse_limit),
        enable_rtm: data.enable_rtm,
        max_rtm_cards: Number(data.max_rtm_cards),
        min_squad_size: Number(data.min_squad_size),
        max_squad_size: Number(data.max_squad_size),
        max_overseas_players: Number(data.max_overseas_players),
        mandatory_roles: data.mandatory_roles,
        base_price_tiers: data.base_price_tiers,
        bid_increments: data.bid_increments
      }
    };

    addTournamentRequest(newRequest);
    
    // Auto clear / seed live tournament immediately so customer can play straight away
    approveTournamentRequest(newRequestId);

    setLatestDraftId(`t-${newRequestId}`);
    setShowSuccessBanner(true);
    
    // Scroll window to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Switch view to stream list so they can launch it
    setTimeout(() => {
      setActiveView('stream');
    }, 1500);
  };

  const onInvalid = (errs: any) => {
    // Redirect user to the first tab that contains validation errors
    if (errs.tournament_name || errs.auction_datetime || errs.visibility || errs.invite_code) {
      setActiveTab('general');
    } else if (errs.economy_mode || errs.currency_label || errs.total_purse_limit || errs.enable_rtm || errs.max_rtm_cards) {
      setActiveTab('economy');
    } else if (errs.min_squad_size || errs.max_squad_size || errs.max_overseas_players || errs.mandatory_roles) {
      setActiveTab('squad');
    } else if (errs.base_price_tiers || errs.bid_increments) {
      setActiveTab('bidding');
    }
  };

  const handleDiscard = () => {
    reset(DEFAULT_FORM_VALUES);
    // Switch to first tab
    setActiveTab('general');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeTournamentsAssoc = tournaments.map(t => t.id);

  return (
    <div id="register-auction-view" className="space-y-6 pb-24 relative">
      
      {/* 🔮 PAGE HEADER */}
      <div className="pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-white flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-[#0f62fe]" />
            Cricket Gavel Draft Configurator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build and optimize custom seasonal tournaments with granular budgeting caps, overseas limits, and dynamic bidding arrays.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start md:self-center">
          <button
            id="toggle-panel-builder"
            onClick={() => setActiveView('create')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeView === 'create'
                ? 'bg-[#0f62fe] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Rules
          </button>
          <button
            id="toggle-panel-stream"
            onClick={() => setActiveView('stream')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer relative ${
              activeView === 'stream'
                ? 'bg-[#0f62fe] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Manage Drafts
            {tournamentRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </div>

      {showSuccessBanner && (
        <div className="p-4 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-start gap-3.5 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <div className="space-y-1">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wide">Configuration Authorized Successfully</h4>
            <p className="text-slate-300">
              Your tournament configuration was saved and approved! You can now activate and run mock simulator draft lists under these parameters instantly.
            </p>
            {latestDraftId && (
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    selectTournament(latestDraftId);
                    navigate('/spectator');
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded uppercase text-[9px] flex items-center gap-1 cursor-pointer transition"
                >
                  Enter Spectator Broadcast Area <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'create' ? (
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8" id="auction-config-form">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Vertical Tab Navigation Menu */}
            <div className="lg:col-span-4 bg-[#111118]/80 border border-white/10 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest pl-3 block mb-2">
                Draft Architecture Modifiers
              </span>

              <button
                type="button"
                id="tab-btn-general"
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition cursor-pointer text-xs uppercase tracking-wider font-bold ${
                  activeTab === 'general'
                    ? 'bg-[#0f62fe] text-white shadow-lg shadow-blue-500/10 border-l-4 border-white'
                    : 'bg-white/2 hover:bg-white/5 border border-transparent text-slate-350 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>General Setup</span>
                </div>
                {tabHasErrors('general') ? (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" title="Contains validation errors" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              <button
                type="button"
                id="tab-btn-economy"
                onClick={() => setActiveTab('economy')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition cursor-pointer text-xs uppercase tracking-wider font-bold ${
                  activeTab === 'economy'
                    ? 'bg-[#0f62fe] text-white shadow-lg shadow-blue-500/10 border-l-4 border-white'
                    : 'bg-white/2 hover:bg-white/5 border border-transparent text-slate-350 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Coins className="w-4 h-4 shrink-0" />
                  <span>Economy &amp; Budgeting</span>
                </div>
                {tabHasErrors('economy') ? (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" title="Contains validation errors" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              <button
                type="button"
                id="tab-btn-squad"
                onClick={() => setActiveTab('squad')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition cursor-pointer text-xs uppercase tracking-wider font-bold ${
                  activeTab === 'squad'
                    ? 'bg-[#0f62fe] text-white shadow-lg shadow-blue-500/10 border-l-4 border-white'
                    : 'bg-white/2 hover:bg-white/5 border border-transparent text-slate-350 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Squad Composition</span>
                </div>
                {tabHasErrors('squad') ? (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" title="Contains validation errors" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              <button
                type="button"
                id="tab-btn-bidding"
                onClick={() => setActiveTab('bidding')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition cursor-pointer text-xs uppercase tracking-wider font-bold ${
                  activeTab === 'bidding'
                    ? 'bg-[#0f62fe] text-white shadow-lg shadow-blue-500/10 border-l-4 border-white'
                    : 'bg-white/2 hover:bg-white/5 border border-transparent text-slate-350 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 shrink-0" />
                  <span>Dynamic Bidding</span>
                </div>
                {tabHasErrors('bidding') ? (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" title="Contains validation errors" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              <div className="pt-4 mt-2 border-t border-white/5 px-2">
                <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-[10px] text-slate-400 space-y-1 select-none">
                  <span className="text-[10px] text-white font-bold block uppercase flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-[#0f62fe]" /> Instructions
                  </span>
                  <p className="leading-relaxed">
                    Set up parameters correctly. Errors will block drafts until cleared. Use physical rules toggles to preview dynamic code scopes.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Active Tab Fields Panel */}
            <div className="lg:col-span-8 bg-[#111118]/80 border border-white/10 rounded-2xl p-6 min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {/* TAB 1: General Setup */}
                {activeTab === 'general' && (
                  <motion.div
                    key="tab-general"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Settings className="w-4.5 h-4.5 text-[#0f62fe]" />
                        General Tournament Setup
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">Specify name identities, draft date, and accessibility constraints.</p>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-mono uppercase block">Tournament Name *</label>
                        <input
                          type="text"
                          id="tournament_name"
                          placeholder="e.g. Hyderabad Challenger Series Season 3"
                          {...register('tournament_name', {
                            required: 'Tournament Name is required',
                            minLength: { value: 3, message: 'Name must be at least 3 characters long' }
                          })}
                          className={`w-full bg-[#050507] border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0f62fe] ${
                            errors.tournament_name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                          }`}
                        />
                        {errors.tournament_name && (
                          <p className="text-[10px] text-red-400 flex items-center gap-1 font-mono pt-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.tournament_name.message}
                          </p>
                        )}
                      </div>

                      {/* Date picker */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-mono uppercase block">Auction Date / Kickoff Time *</label>
                        <div className="relative">
                          <input
                            type="datetime-local"
                            id="auction_datetime"
                            {...register('auction_datetime', {
                              required: 'Auction Date and Time is required',
                              validate: (val) => {
                                const selected = new Date(val);
                                const now = new Date();
                                return selected > now || 'Date and Time must reside in the future';
                              }
                            })}
                            className={`w-full bg-[#050507] border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0f62fe] ${
                              errors.auction_datetime ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                            }`}
                          />
                          <Calendar className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500 pointer-events-none" />
                        </div>
                        {errors.auction_datetime ? (
                          <p className="text-[10px] text-red-400 flex items-center gap-1 font-mono pt-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.auction_datetime.message}
                          </p>
                        ) : (
                          <p className="text-[9px] text-slate-500 pl-1">Choose a future kickoff slot for interactive timer synchronization.</p>
                        )}
                      </div>

                      {/* Visibility Toggle Switch */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-mono uppercase block">Accessibility Mode</label>
                        <div className="flex bg-[#050507] border border-white/10 p-1 rounded-xl max-w-sm justify-between">
                          <button
                            type="button"
                            onClick={() => setValue('visibility', 'Public')}
                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg text-center transition cursor-pointer ${
                              watchedVisibility === 'Public'
                                ? 'bg-white/5 text-white border border-white/10'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Public Room
                          </button>
                          <button
                            type="button"
                            onClick={() => setValue('visibility', 'Private')}
                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg text-center transition cursor-pointer ${
                              watchedVisibility === 'Private'
                                ? 'bg-white/5 text-white border border-white/10'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Private Invite
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Invite code (Private only) */}
                      {watchedVisibility === 'Private' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1 pt-1.5"
                        >
                          <label className="text-[10px] text-yellow-400 font-mono uppercase block flex items-center gap-1">
                            <Lock className="w-3 h-3 text-yellow-400" />
                            Auto-Generated Invitation Code (Read-Only)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              id="invite_code"
                              readOnly
                              {...register('invite_code')}
                              className="w-full bg-[#050507] border border-yellow-500/20 text-yellow-400 rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none cursor-default"
                            />
                            <button
                              type="button"
                              onClick={copyInviteCodeToClipboard}
                              className="px-4 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
                              title="Copy Invite Code"
                            >
                              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-[9px] text-slate-500 pl-1">Share this alphanumeric token with franchise managers to enter the private auction list.</p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: Economy & Budgeting */}
                {activeTab === 'economy' && (
                  <motion.div
                    key="tab-economy"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Coins className="w-4.5 h-4.5 text-[#0f62fe]" />
                        Economy &amp; Budgeting Settings
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">Regulate pricing systems, currency tags, and standard limit allowances.</p>
                    </div>

                    <div className="space-y-4 text-xs font-sans">
                      {/* Economy Mode Segmented control */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono uppercase block">Economy System Mode</label>
                          <div className="flex bg-[#050507] border border-white/10 p-1 rounded-xl justify-between">
                            <button
                              type="button"
                              onClick={() => setValue('economy_mode', 'POINTS')}
                              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg text-center transition cursor-pointer ${
                                watchedEconomyMode === 'POINTS'
                                  ? 'bg-[#0f62fe] text-white shadow-md'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Points Pool
                            </button>
                            <button
                              type="button"
                              onClick={() => setValue('economy_mode', 'CURRENCY')}
                              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg text-center transition cursor-pointer ${
                                watchedEconomyMode === 'CURRENCY'
                                  ? 'bg-[#0f62fe] text-white shadow-md'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Fiat Currency
                            </button>
                          </div>
                        </div>

                        {/* Currency Label input */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono uppercase block">Currency / Units Label *</label>
                          <input
                            type="text"
                            id="currency_label"
                            placeholder={watchedEconomyMode === 'POINTS' ? 'Pts / Credits' : '₹ / Lakhs / $'}
                            {...register('currency_label', { required: 'Currency unit tag is required' })}
                            className={`w-full bg-[#050507] border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0f62fe] ${
                              errors.currency_label ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                            }`}
                          />
                          {errors.currency_label && (
                            <p className="text-[10px] text-red-400 font-mono pt-1">{errors.currency_label.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Total Purse Limit input */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-mono uppercase block">
                          Total Purse Limit Limit per Franchise ({watchedEconomyMode}) *
                        </label>
                        <input
                          type="number"
                          id="total_purse_limit"
                          placeholder={watchedEconomyMode === 'POINTS' ? 'e.g. 100000000' : 'e.g. 500000000 (50 Cr)'}
                          {...register('total_purse_limit', {
                            required: 'Total purse allocation amount is required',
                            min: { value: 0, message: 'Purse allocation limit cannot be negative' },
                            valueAsNumber: true
                          })}
                          className={`w-full bg-[#050507] border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0f62fe] ${
                            errors.total_purse_limit ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                          }`}
                        />
                        {errors.total_purse_limit && (
                          <p className="text-[10px] text-red-400 font-mono pt-1">{errors.total_purse_limit.message}</p>
                        )}
                        <p className="text-[9px] text-slate-500">
                          Initial transaction purse balance allowed for each registered team roster.
                        </p>
                      </div>

                      {/* Right to Match (RTM) options */}
                      <div className="border border-white/5 bg-white/[0.02] rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-white font-bold block uppercase text-[10px]">Enable Right to Match (RTM) Card Limits</span>
                            <span className="text-[10px] text-slate-400">Allows managers to retain their former marquee athletes during a highest bid lock.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setValue('enable_rtm', !watchedEnableRtm)}
                            className={`w-12 h-6.5 rounded-full p-1 transition cursor-pointer ${
                              watchedEnableRtm ? 'bg-[#0f62fe]' : 'bg-white/10'
                            }`}
                          >
                            <div
                              className={`w-4.5 h-4.5 rounded-full bg-white transition-all transform ${
                                watchedEnableRtm ? 'translate-x-5.5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        {watchedEnableRtm && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-1.5 pt-2 border-t border-white/5"
                          >
                            <label className="text-[10px] text-slate-400 font-mono uppercase block">Max RTM Card Limit Allowance *</label>
                            <input
                              type="number"
                              id="max_rtm_cards"
                              {...register('max_rtm_cards', {
                                required: 'Specify custom RTM card limits',
                                min: { value: 1, message: 'Minimum 1 Card required' },
                                max: { value: 5, message: 'Maximum 5 Cards allowed' },
                                valueAsNumber: true
                              })}
                              className={`w-full bg-[#050507] border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe] ${
                                errors.max_rtm_cards ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                              }`}
                            />
                            {errors.max_rtm_cards && (
                              <p className="text-[10px] text-red-400 font-mono pt-1">{errors.max_rtm_cards.message}</p>
                            )}
                            <p className="text-[9px] text-slate-500">Limits the frequency of match queries each manager can deploy inside active bids.</p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: Squad Composition Rules */}
                {activeTab === 'squad' && (
                  <motion.div
                    key="tab-squad"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4.5 h-4.5 text-[#0f62fe]" />
                        Squad Composition &amp; Roster Rules
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">Configure limits on overseas members, absolute caps, and mandatory roles.</p>
                    </div>

                    <div className="space-y-4 text-xs font-sans">
                      {/* Squad Size Ranges */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono uppercase block">Min Squad Size Cap *</label>
                          <input
                            type="number"
                            id="min_squad_size"
                            {...register('min_squad_size', {
                              required: 'Min squad size is required',
                              min: { value: 11, message: 'Minimum squad size must be 11 (full XI roster)' },
                              valueAsNumber: true,
                              validate: (val, formValues) => 
                                Number(val) <= Number(formValues.max_squad_size) || 'Must be less than or equal to Max squad size'
                            })}
                            className={`w-full bg-[#050507] border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0f62fe] ${
                              errors.min_squad_size ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                            }`}
                          />
                          {errors.min_squad_size && (
                            <p className="text-[10px] text-red-400 font-mono pt-1">{errors.min_squad_size.message}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono uppercase block">Max Squad Size Cap *</label>
                          <input
                            type="number"
                            id="max_squad_size"
                            {...register('max_squad_size', {
                              required: 'Max squad size is required',
                              max: { value: 35, message: 'Maximum squad size cannot exceed 35 entries' },
                              valueAsNumber: true,
                              validate: (val, formValues) => 
                                Number(val) >= Number(formValues.min_squad_size) || 'Must be greater than or equal to Min squad size'
                            })}
                            className={`w-full bg-[#050507] border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0f62fe] ${
                              errors.max_squad_size ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                            }`}
                          />
                          {errors.max_squad_size && (
                            <p className="text-[10px] text-red-400 font-mono pt-1">{errors.max_squad_size.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Foreign players cap */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-mono uppercase block">Max Overseas Players Cap *</label>
                        <input
                          type="number"
                          id="max_overseas_players"
                          {...register('max_overseas_players', {
                            required: 'Overseas limit is required',
                            min: { value: 0, message: 'Minimum overseas player cap must be 0' },
                            valueAsNumber: true,
                            validate: (val, formValues) => 
                              Number(val) <= Number(formValues.max_squad_size) || 'Cannot exceed total squad roster size capacity'
                          })}
                          className={`w-full bg-[#050507] border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0f62fe] ${
                            errors.max_overseas_players ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                          }`}
                        />
                        {errors.max_overseas_players && (
                          <p className="text-[10px] text-red-400 font-mono pt-1">{errors.max_overseas_players.message}</p>
                        )}
                        <p className="text-[9px] text-slate-500">Restricts the number of foreign cards selected inside standard bidding rounds.</p>
                      </div>

                      {/* Mandatory Player Roles */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-mono uppercase block">
                          Mandatory Roster Specialization Roles (Checkbox Group)
                        </label>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {['BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'].map((role) => {
                            const checkedRolesList = watchedEnableRtm 
                              ? DEFAULT_FORM_VALUES.mandatory_roles 
                              : ['BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER']; // static guard array logic helper
                            
                            return (
                              <label
                                key={role}
                                className="flex items-center gap-2.5 bg-[#050507] border border-white/5 hover:border-white/10 rounded-xl p-3.5 cursor-pointer selection:bg-transparent"
                              >
                                <input
                                  type="checkbox"
                                  value={role}
                                  defaultChecked
                                  {...register('mandatory_roles', {
                                    required: 'Choose at least 1 mandatory role requirement'
                                  })}
                                  className="w-4 h-4 rounded text-[#0f62fe] focus:ring-[#0f62fe] bg-black border-white/20"
                                />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{role.replace('_', ' ')}</span>
                              </label>
                            );
                          })}
                        </div>
                        {errors.mandatory_roles && (
                          <p className="text-[10px] text-red-400 font-mono pt-1">{errors.mandatory_roles.message}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 4: Dynamic Bidding Engine */}
                {activeTab === 'bidding' && (
                  <motion.div
                    key="tab-bidding"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    {/* Header */}
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Flame className="w-4.5 h-4.5 text-[#0f62fe]" />
                        Dynamic Bidding &amp; Multiplier Engine
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">Configure starting appraisal price categories and mathematical rate multiplier jumps.</p>
                    </div>

                    <div className="space-y-6 text-xs">
                      
                      {/* FIELD GROUP: Base Price Tiers (Array) */}
                      <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-white font-bold block uppercase text-[11px] tracking-wide flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-slate-400" />
                              Base Price Appraisal Tiers
                            </span>
                            <p className="text-[10px] text-slate-400">Initialize minimum validation categories for upcoming players.</p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => appendTier({ tier_name: '', base_amount: 100000 })}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-lg border border-white/10 transition cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Tier
                          </button>
                        </div>

                        {/* Array rows */}
                        <div className="space-y-3">
                          {tierFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                              <div className="md:col-span-6 space-y-0.5">
                                <input
                                  type="text"
                                  placeholder="e.g. Uncapped Local Tier"
                                  {...register(`base_price_tiers.${index}.tier_name` as const, {
                                    required: 'Tier label label is required'
                                  })}
                                  className={`w-full bg-[#050507] border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe] ${
                                    errors.base_price_tiers?.[index]?.tier_name ? 'border-red-500/50' : 'border-white/10'
                                  }`}
                                />
                              </div>

                              <div className="md:col-span-5 space-y-0.5">
                                <input
                                  type="number"
                                  placeholder="e.g. 500000"
                                  {...register(`base_price_tiers.${index}.base_amount` as const, {
                                    required: 'Amount is required',
                                    min: { value: 0, message: 'Minimum 0' },
                                    valueAsNumber: true
                                  })}
                                  className={`w-full bg-[#050507] border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe] ${
                                    errors.base_price_tiers?.[index]?.base_amount ? 'border-red-500/50' : 'border-white/10'
                                  }`}
                                />
                              </div>

                              <div className="md:col-span-1 justify-self-center md:justify-self-end">
                                <button
                                  type="button"
                                  onClick={() => removeTier(index)}
                                  disabled={tierFields.length <= 1}
                                  className="p-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Delete Category Tier"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* FIELD GROUP: Bid Increment Rules (Array) */}
                      <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-white font-bold block uppercase text-[11px] tracking-wide flex items-center gap-1.5">
                              <CoinsIcon className="w-4 h-4 text-slate-400" />
                              Paddle Bidding Increments Range Rules
                            </span>
                            <p className="text-[10px] text-slate-400">Specifies auto-increment multipliers triggered relative to player bids valuation.</p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => appendIncrement({ from_amount: 100000, to_amount: 1000000, increment_by: 50000 })}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-lg border border-white/10 transition cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Rule
                          </button>
                        </div>

                        {/* Array rows */}
                        <div className="space-y-3">
                          {incrementFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border-b border-white/5 pb-3 md:pb-0 md:border-b-0 last:pb-0">
                              
                              <div className="md:col-span-3 space-y-0.5">
                                <label className="md:hidden text-[9px] text-slate-500 font-mono block mb-1">Valued From Amount</label>
                                <input
                                  type="number"
                                  placeholder="From amount"
                                  {...register(`bid_increments.${index}.from_amount` as const, {
                                    required: 'From amount is required',
                                    min: { value: 0, message: 'Min 0' },
                                    valueAsNumber: true
                                  })}
                                  className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                                />
                              </div>

                              <div className="md:col-span-4 space-y-0.5">
                                <label className="md:hidden text-[9px] text-slate-500 font-mono block mb-1">To Valuation Amount</label>
                                <input
                                  type="number"
                                  placeholder="To amount"
                                  {...register(`bid_increments.${index}.to_amount` as const, {
                                    required: 'To amount is required',
                                    valueAsNumber: true,
                                    validate: (val, formValues) => {
                                      const fromVal = Number((formValues as any).bid_increments?.[index]?.from_amount || 0);
                                      return Number(val) > fromVal || 'To amount must be greater than From amount';
                                    }
                                  })}
                                  className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                                />
                              </div>

                              <div className="md:col-span-4 space-y-0.5">
                                <label className="md:hidden text-[9px] text-slate-500 font-mono block mb-1">Increment Offset Amount</label>
                                <input
                                  type="number"
                                  placeholder="Increment value"
                                  {...register(`bid_increments.${index}.increment_by` as const, {
                                    required: 'Increment modifier required',
                                    min: { value: 1, message: 'Min 1' },
                                    valueAsNumber: true
                                  })}
                                  className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                                />
                              </div>

                              <div className="md:col-span-1 justify-self-center md:justify-self-end">
                                <button
                                  type="button"
                                  onClick={() => removeIncrement(index)}
                                  disabled={incrementFields.length <= 1}
                                  className="p-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Delete Increment Rule"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

          {/* STICKY BOTTOM ACTIONS FOOTER BAR */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 border-t border-white/10 backdrop-blur-md py-4 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="hidden sm:block text-[11px] text-slate-400 select-none">
                {isDirty ? (
                  <span className="text-yellow-405 text-yellow-400 font-medium">⚠️ Unsaved parameters pending authorization!</span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-slate-500" /> Configurations fully sync-locked
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
                <button
                  type="button"
                  id="btn-discard-changes"
                  onClick={handleDiscard}
                  disabled={!isDirty}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-slate-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
                  title="Reset form fields"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Discard Changes
                </button>
                <button
                  type="submit"
                  id="btn-save-settings"
                  className="px-5 py-2.5 bg-[#0f62fe] hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-lg shadow-blue-500/20 inline-flex items-center gap-1.5"
                  title="Validate and Save Draft settings"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save Configuration
                </button>
              </div>
            </div>
          </div>

        </form>
      ) : (
        /* MANAGE DRAFTS STREAM VIEW (Active tracker stream list of tournaments) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="drafts-stream-view">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#111118]/80 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider pl-1 mb-1">
                Authorized Active Catalog Stream
              </h3>
              <p className="text-[11px] text-slate-400 pl-1 mb-4">
                Launch, activate, and route player drafting lobbies directly from the historical log stack.
              </p>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {tournamentRequests.map((r) => {
                  const isActivated = activeTournamentsAssoc.includes(`t-${r.id}`);
                  return (
                    <div 
                      key={r.id} 
                      className="bg-[#050507] border border-white/10 rounded-xl p-5 space-y-4 hover:border-white/20 transition hover:shadow-xl hover:shadow-black/40"
                    >
                      <div className="flex justify-between items-start gap-2 select-none">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wide leading-tight">{r.name}</h4>
                          <span className="text-[9px] text-slate-500 block uppercase font-mono">
                            Requested By: {r.requestedBy}
                          </span>
                        </div>
                        
                        <span className="text-[9px] px-2.5 py-0.5 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded font-mono uppercase tracking-widest font-black">
                          Authorized Actionable Room
                        </span>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg text-[10px] leading-relaxed text-slate-300 font-sans">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase font-black tracking-wide mb-1">
                          Configured Parameters Block:
                        </span>
                        <p className="italic text-slate-400 leading-normal pl-1.5 border-l-2 border-[#0f62fe]">
                          {r.customRules}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[10px] select-none text-slate-400 border-t border-white/5 pt-3.5">
                        <div>
                          System Org Size: <strong className="text-white">8 Competing Franchises</strong>
                        </div>
                        <div>
                          Roster Spending Limit Cap: <strong className="text-emerald-400 font-mono">₹{(r.baseBudget).toLocaleString()} Credits</strong>
                        </div>
                      </div>

                      {/* Launch Button Action */}
                      <div className="pt-2 flex items-center justify-between gap-2.5 border-t border-white/5">
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 select-none font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> READY TO KICKOFF
                        </span>
                        
                        <button
                          onClick={() => {
                            selectTournament(`t-${r.id}`);
                            navigate('/spectator');
                          }}
                          className="px-4 py-2 bg-[#0f62fe] hover:bg-blue-500 text-white font-extrabold rounded-lg uppercase tracking-wider text-[9px] cursor-pointer flex items-center gap-1 font-sans transition-all shadow-md shadow-blue-500/10"
                        >
                          Host &amp; Start Draft
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {tournamentRequests.length === 0 && (
                  <div className="py-24 text-center space-y-3 select-none">
                    <span className="text-3xl block animate-bounce">📬</span>
                    <p className="text-xs text-slate-500 italic">No custom tournament configurations recorded inside current stream logs.</p>
                    <button
                      onClick={() => setActiveView('create')}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-lg border border-white/10 transition cursor-pointer"
                    >
                      Build First Config Block
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANELS inside Stream active tracker */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#111118]/80 border border-white/10 rounded-2xl p-5 space-y-4 text-xs leading-normal font-sans">
              <h4 className="text-white font-bold flex items-center gap-1.5 uppercase tracking-wide text-[11px] border-b border-white/5 pb-2">
                <Info className="w-4 h-4 text-[#0f62fe]" /> Live Stream Help Desk
              </h4>
              <div className="space-y-3">
                <div className="space-y-0.5">
                  <span className="text-white font-semibold text-[10px] uppercase block">Simulator Synced Roster Limits</span>
                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    Custom rooms utilize the 8 premier teams registered in standard lobbies. Saving configurations automatically initializes matching parameters inside draft modules.
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-white font-semibold text-[10px] uppercase block font-mono">JSON Engine Feed Tracker</span>
                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    By binding custom price tiers and threshold increments, the bidding panel renders exact math multiplications when managers lock state triggers.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
