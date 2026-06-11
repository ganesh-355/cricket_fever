import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import { UserRole } from '../types';
import { 
  Shield, 
  Coins, 
  Flame, 
  TrendingUp, 
  Users, 
  Clock, 
  Play, 
  UserPlus, 
  Award, 
  Compass, 
  Grid, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Volume2, 
  Search,
  Check,
  ChevronRight,
  TrendingDown,
  Activity
} from 'lucide-react';

export const WarRoom: React.FC = () => {
  const { 
    teams, 
    players,
    userTeamId, 
    setUserTeamId,
    activeAuction, 
    placeBid, 
    bidHistory,
    logs,
    activeTournamentId,
    tournaments,
    userRole,
    setRole,
    startAuctionItem,
    passTimer,
    sellCurrentPlayer,
    unsoldCurrentPlayer,
    triggerAutoBid,
    addSystemLog
  } = useStore();

  const { sendMessage } = useWebSocket();

  // Selected tournament details
  const currentTournament = tournaments.find(t => t.id === activeTournamentId);
  const config = currentTournament?.config;

  // Search through upcoming players in active catalog
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  
  // Custom manual bid amount state
  const [customBidAmount, setCustomBidAmount] = useState<string>('');
  const [bidError, setBidError] = useState<string | null>(null);

  // Sound feedback simulation
  const playSound = (type: 'gavel' | 'bid' | 'alert') => {
    try {
      // Create a web audio synthetic sound for a modern futuristic feel
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'gavel') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'bid') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Ignored if browser restrains audio ctx
    }
  };

  // Safe monetary custom scaling formats
  const formatMoney = (val: number) => {
    const isPoints = config?.economy_mode === 'POINTS';
    const currencyTag = config?.currency_label ?? '₹';

    if (isPoints) {
      return `${val.toLocaleString()} ${currencyTag}`;
    }

    // Classic Crores and Lakhs system format
    if (val >= 10000000) {
      return `${currencyTag}${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `${currencyTag}${(val / 100000).toFixed(1)} Lakhs`;
    }
    return `${currencyTag}${val.toLocaleString()}`;
  };

  // Active represent team selection
  const myTeam = teams.find(t => t.id === userTeamId);

  // Compute standard dynamic increment increments based on current bid
  const getDynamicPaddleIncrement = () => {
    if (!activeAuction) return 500000;
    
    if (config?.bid_increments && config.bid_increments.length > 0) {
      const match = config.bid_increments.find(
        rule => activeAuction.currentBid >= rule.from_amount && activeAuction.currentBid < rule.to_amount
      );
      if (match) return match.increment_by;
      
      const sorted = [...config.bid_increments].sort((a,b) => b.from_amount - a.from_amount);
      return sorted[0]?.increment_by ?? activeAuction.minIncrement;
    }

    // Default system steps fallback
    if (activeAuction.currentBid < 5000000) return 200000;
    if (activeAuction.currentBid < 20000000) return 500000;
    return 1000000;
  };

  const dynamicIncrement = getDynamicPaddleIncrement();

  // Execute quick paddle bid submission
  const handleQuickPaddleBid = () => {
    if (!myTeam || !activeAuction) return;
    
    // Minimum bid is either current bid + dynamic increment OR base price if no bids exist
    const nextAmount = activeAuction.highestBidderTeamId 
      ? activeAuction.currentBid + dynamicIncrement 
      : activeAuction.player.basePrice;

    submitBidTransaction(nextAmount);
  };

  // Execute secondary specific valuation bid
  const handleCustomBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBidError(null);

    if (!myTeam || !activeAuction) return;
    
    const parsedAmount = parseInt(customBidAmount.replace(/[^0-9]/g, ''), 10);
    if (!parsedAmount || isNaN(parsedAmount)) {
      setBidError('Please declare a numeric bid value.');
      return;
    }

    const minRequired = activeAuction.highestBidderTeamId 
      ? activeAuction.currentBid + dynamicIncrement 
      : activeAuction.player.basePrice;

    if (parsedAmount < minRequired) {
      setBidError(`Minimum required bid must be at least ${formatMoney(minRequired)}.`);
      return;
    }

    submitBidTransaction(parsedAmount);
    setCustomBidAmount('');
  };

  const submitBidTransaction = (amount: number) => {
    if (!myTeam || !activeAuction) return;

    const res = placeBid(myTeam.id, amount);
    if (!res.success) {
      setBidError(res.message);
      playSound('alert');
    } else {
      playSound('bid');
      setBidError(null);
      // Synchronize WebSocket event to network channels
      sendMessage(JSON.stringify({
        event: 'BID_SUBMITTED',
        franchise: myTeam.name,
        short: myTeam.shortName,
        bidValue: amount,
        targetPlayer: activeAuction.player.name,
        timestamp: new Date().toLocaleTimeString()
      }));
    }
  };

  // Helper arrays for upcoming lot filter cards
  const upcomingPlayers = players.filter(p => p.auctionStatus === 'UPCOMING');
  const filteredUpcoming = upcomingPlayers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(playerSearchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'ALL' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Automatically seed first player lot if simulation is loaded empty
  const handleTriggerLotKickoff = (playerId: string) => {
    playSound('gavel');
    startAuctionItem(playerId);
  };

  // Active Admin Action proxies the timers manually
  const handleTickManualTimer = () => {
    if (activeAuction) {
      passTimer();
    }
  };

  // Admin Sell/Unsold trigger handlers
  const handleGavelCommitSold = () => {
    playSound('gavel');
    sellCurrentPlayer();
  };

  const handleGavelCommitUnsold = () => {
    playSound('gavel');
    unsoldCurrentPlayer();
  };

  // Budget calculations
  const remainingBudget = myTeam ? myTeam.maxBudget - myTeam.budgetSpent : 0;
  const maxSquadSize = config?.max_squad_size ?? currentTournament?.maxSquadSize ?? 20;
  const maxOverseasLimit = config?.max_overseas_players ?? currentTournament?.maxOverseasPlayers ?? 6;

  const squadSizePerc = myTeam ? (myTeam.squadSize / maxSquadSize) * 100 : 0;
  const overseasSpentPerc = myTeam ? (myTeam.overseasCount / maxOverseasLimit) * 100 : 0;

  return (
    <div id="war-room-root" className="space-y-6">
      
      {/* 👑 ACTIVE TOURNAMENT SUMMARY HEADER CARD */}
      <div className="bg-[#111118]/80 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0f62fe]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[9px] bg-[#0f62fe]/15 text-[#0f62fe] px-2.5 py-1 border border-[#0f62fe]/30 rounded-full font-mono font-bold uppercase tracking-wider">
              {currentTournament?.status === 'ACTIVE' ? '🟢 Live Auction active' : '📅 Planning Stage'}
            </span>
            <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1.5">
              {currentTournament?.name || 'Cricket Fever Premier Auction'}
            </h1>
            <p className="text-xs text-slate-400">
              Auction engine running under <strong className="text-slate-200">Gavel Config v3.1</strong> rules parameters.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">Simulation Role representation:</span>
            <select
              id="warroom-tester-role-dropdown"
              value={userRole}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-black border border-white/10 text-yellow-400 font-mono text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-yellow-400 cursor-pointer"
            >
              <option value={UserRole.TEAM_MANAGER}>Switch to Franchise Board</option>
              <option value={UserRole.AUCTION_ADMIN}>Switch to Moderation Gavel</option>
            </select>
          </div>
        </div>

        {/* Dynamic Rules Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5 text-xs font-sans">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Economy Mode</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#0f62fe]" />
              {config ? `${config.economy_mode} (${config.currency_label})` : 'Fiat Mode (₹)'}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Purse Limit Per Team</span>
            <span className="font-bold text-emerald-400">
              {config ? formatMoney(config.total_purse_limit) : formatMoney(1000000000)}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Roster Caps</span>
            <span className="font-bold text-white">
              {maxSquadSize} Max | {config?.min_squad_size ?? 11} Min
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Right To Match (RTM)</span>
            <span className="font-bold text-white">
              {config?.enable_rtm ? `Enabled (Max ${config.max_rtm_cards} Cards)` : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ACTIVE LOT & PLAYER PREVIEW TERMINAL */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-[#111118]/80 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            
            {/* Live indicator overlay */}
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#0f62fe] font-mono font-bold uppercase tracking-widest block">Gavel Stream Feed</span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Lot on Hammer</h2>
              </div>

              {activeAuction && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-3.5 py-1.5 rounded-xl font-mono font-bold flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 animate-spin text-red-500" />
                  <span>Countdown: {activeAuction.timerSeconds}s</span>
                </div>
              )}
            </div>

            {/* LOT PRESENTATION CARD */}
            {activeAuction ? (
              <div className="space-y-6">
                
                {/* Player Metadata */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <img 
                      src={activeAuction.player.imageUrl} 
                      alt={activeAuction.player.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-white/5 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] bg-[#0f62fe]/10 text-[#0f62fe] border border-[#0f62fe]/20 px-2.5 py-0.5 rounded font-bold uppercase tracking-wide">
                        {activeAuction.player.category}
                      </span>
                      <h3 className="text-xl font-display font-black text-white tracking-tight mt-1">
                        {activeAuction.player.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Rating: <strong className="text-[#0f62fe]">{activeAuction.player.rating} PV</strong> | {activeAuction.player.isOverseas ? '✈ Overseas Board' : '🇮🇳 Domestic Roster'}
                      </p>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="bg-[#0f62fe]/5 border border-white/5 p-3 rounded-xl text-center min-w-[80px]">
                    <span className="text-[9px] text-slate-500 uppercase block font-mono">Tier Group</span>
                    <span className="text-xs font-bold text-white font-mono">
                      {activeAuction.player.basePrice >= 20000000 ? 'Marquee Tier A' : 
                       activeAuction.player.basePrice >= 10000000 ? 'Gold Tier B' : 'Silver Tier C'}
                    </span>
                  </div>
                </div>

                {/* Player past statistics summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-[#07070a]/80 p-3.5 rounded-xl border border-white/5 text-xs font-mono">
                  <div className="bg-white/[0.01] p-2.5 rounded border border-white/5 text-center">
                    <span className="text-slate-500 block text-[9px] uppercase">Matches</span>
                    <span className="text-xs font-bold text-white">{activeAuction.player.stats?.matches || 'NA'}</span>
                  </div>
                  <div className="bg-white/[0.01] p-2.5 rounded border border-white/5 text-center">
                    <span className="text-slate-500 block text-[9px] uppercase">Runs/Wickets</span>
                    <span className="text-xs font-bold text-white">
                      {activeAuction.player.category === 'BOWLER' ? activeAuction.player.stats?.wickets : activeAuction.player.stats?.runs}
                    </span>
                  </div>
                  <div className="bg-white/[0.01] p-2.5 rounded border border-white/5 text-center">
                    <span className="text-slate-500 block text-[9px] uppercase">Rate Indicator</span>
                    <span className="text-xs font-bold text-white">
                      {activeAuction.player.category === 'BOWLER' ? `Eco: ${activeAuction.player.stats?.economy}` : `S/R: ${activeAuction.player.stats?.strikeRate}`}
                    </span>
                  </div>
                  <div className="bg-white/[0.01] p-2.5 rounded border border-white/5 text-center">
                    <span className="text-slate-500 block text-[9px] uppercase">Average</span>
                    <span className="text-xs font-bold text-white">{activeAuction.player.stats?.average || 'NA'}</span>
                  </div>
                </div>

                {/* TRANSACTION LEDGER */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Current highest bidder block */}
                  <div className="bg-black/60 border border-white/10 p-5 rounded-2xl relative">
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-[#0f62fe] rounded-full animate-pulse" />
                      <span className="text-[8px] text-slate-500 uppercase font-mono font-bold">Winning Bid</span>
                    </div>

                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Current Bid Valuation</span>
                    <span className="text-3xl font-display font-black text-white font-mono mt-1 block">
                      {formatMoney(activeAuction.currentBid)}
                    </span>
                    
                    <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center gap-2">
                      <div className="w-5.5 h-5.5 bg-[#0f62fe]/10 border border-white/5 rounded-full flex items-center justify-center shrink-0">
                        <Users className="w-3 h-3 text-[#0f62fe]" />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Held by:{' '}
                        <strong className="text-white">
                          {activeAuction.highestBidderTeamId 
                            ? teams.find(t => t.id === activeAuction.highestBidderTeamId)?.name
                            : 'No bids logged'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Current required next step valuation block */}
                  <div className="bg-[#0f62fe]/2 border border-[#0f62fe]/15 p-5 rounded-2xl relative">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Dynamic Next Increment</span>
                    <span className="text-3xl font-display font-black text-[#0f62fe] font-mono mt-1 block">
                      +{formatMoney(dynamicIncrement)}
                    </span>
                    
                    <p className="text-[11px] text-slate-400 mt-4 leading-relaxed font-sans">
                      Next required paddle trigger sequence must be at least{' '}
                      <strong className="text-white">
                        {formatMoney(activeAuction.highestBidderTeamId ? activeAuction.currentBid + dynamicIncrement : activeAuction.player.basePrice)}
                      </strong>.
                    </p>
                  </div>

                </div>

                {/* USER BID CONTEXT INTERACTIVE ROW */}
                <div className="border-t border-white/5 pt-6 space-y-4">
                  
                  {userRole === UserRole.TEAM_MANAGER ? (
                    <div className="space-y-4 text-xs font-sans">
                      
                      {/* Franchise Identity switch indicators */}
                      <div className="bg-[#0b101d] border border-blue-500/20 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-[#0f62fe] font-mono font-bold block uppercase">Represent Profile Status</span>
                          <h4 className="text-xs font-bold text-white uppercase">
                            {myTeam ? `Roster Representative: ${myTeam.name} (${myTeam.shortName})` : 'No franchisee roster linked.'}
                          </h4>
                        </div>
                        
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] text-slate-400 font-medium">Toggle franchise board:</span>
                          <select 
                            id="warroom-selected-franchise-select"
                            value={userTeamId || ''} 
                            onChange={(e) => {
                              setUserTeamId(e.target.value || null);
                              playSound('bid');
                            }}
                            className="bg-black border border-white/10 text-[#0f62fe] font-mono text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer text-blue-400 font-bold"
                          >
                            <option value="">-- Switch Active Franchise --</option>
                            {teams.map(t => (
                              <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {myTeam ? (
                        <div className="space-y-4">
                          
                          {/* GIANT INTERACTIVE PADDLE ACTION */}
                          <div className="flex flex-col md:flex-row gap-4">
                            <button
                              type="button"
                              id="warroom-submit-paddle-bid-btn"
                              onClick={handleQuickPaddleBid}
                              className="flex-1 py-4 bg-[#0f62fe] hover:bg-[#0d52d4] text-white text-sm font-black uppercase tracking-wider rounded-2xl transition transform active:scale-[0.98] shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2.5 cursor-pointer border-transparent"
                            >
                              <Volume2 className="w-5 h-5" />
                              SUBMIT PADDLE BID: {formatMoney(activeAuction.highestBidderTeamId ? activeAuction.currentBid + dynamicIncrement : activeAuction.player.basePrice)}
                            </button>

                            {/* Secondary RTM Indicator widget */}
                            {config?.enable_rtm && (
                              <div className="bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 rounded-xl p-3 flex flex-col justify-between items-center text-center max-w-[150px] shrink-0 font-sans">
                                <span className="text-[8px] text-slate-400 uppercase block font-mono">RTM Card Capacity</span>
                                <span className="text-lg font-bold text-white mt-1">
                                  {myTeam.squadSize > 0 ? `Active` : `No squad`}
                                </span>
                                <span className="text-[9px] text-slate-500">Max limit per board {config.max_rtm_cards} cards</span>
                              </div>
                            )}
                          </div>

                          {/* EXACT MANUAL BID AMOUNT INPUT FORM */}
                          <form onSubmit={handleCustomBidSubmit} className="flex gap-2 items-center">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={customBidAmount}
                                onChange={(e) => setCustomBidAmount(e.target.value)}
                                placeholder="Specify exact manual bid (e.g. 24,000,000)"
                                className="w-full bg-[#050507] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                              />
                            </div>
                            <button
                              type="submit"
                              id="war-room-exact-bid-submit"
                              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-not-allowed md:cursor-pointer transition"
                            >
                              Place Premium Valuation
                            </button>
                          </form>

                          {bidError && (
                            <div className="p-3 bg-red-600/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span>{bidError}</span>
                            </div>
                          )}

                        </div>
                      ) : (
                        <div className="p-6 bg-yellow-600/5 border border-yellow-500/20 rounded-2xl text-center">
                          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Board Identity Unassigned</h4>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">Please switch your Franchise representation filter above inside represent dropdown to place official bids.</p>
                        </div>
                      )}

                    </div>
                  ) : (
                    
                    /* ADMIN MODERATOR ACTION CONSOLE */
                    <div className="space-y-4">
                      
                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
                        <span className="text-[10px] text-yellow-400 font-mono uppercase block font-bold flex items-center gap-1">
                          <Shield className="w-4 h-4" /> Gavel Moderator Administrative Controls Panel
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">
                          You are currently representative of Administrative capabilities. Control timer state, lock hammer bids, or force simulator auto-bids on the catalog lot.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        
                        <button
                          type="button"
                          id="warroom-admin-tick-timer"
                          onClick={handleTickManualTimer}
                          className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
                        >
                          <Clock className="w-4.5 h-4.5 text-blue-400" />
                          <span>Adv. Timer (-1s)</span>
                        </button>

                        <button
                          type="button"
                          id="warroom-admin-auto-bid"
                          onClick={() => {
                            playSound('bid');
                            triggerAutoBid();
                          }}
                          className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
                        >
                          <Flame className="w-4.5 h-4.5 text-yellow-500" />
                          <span>Simulate Auto-Bid</span>
                        </button>

                        <button
                          type="button"
                          id="warroom-admin-hammer-sold"
                          onClick={handleGavelCommitSold}
                          className="px-4 py-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                          <span>SOLD HAMMER 🔨</span>
                        </button>

                        <button
                          type="button"
                          id="warroom-admin-hammer-unsold"
                          onClick={handleGavelCommitUnsold}
                          className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
                        >
                          <TrendingDown className="w-4.5 h-4.5 text-red-450" />
                          <span>UNSOLD PASSED 🔨</span>
                        </button>

                      </div>

                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 text-slate-400">
                  <Play className="w-8 h-8 text-[#0f62fe]" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">No Active Player Lot on Board</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  A lot has not been initialized yet. Use the selector bellow under the "Platform Catalog Lot Draft" tool to start bidding rounds!
                </p>
              </div>
            )}

          </div>

          {/* 🔍 COMPOSABLE PLAYER CATALOG DIRECTORY & SEED DRILL */}
          <div className="bg-[#111118]/80 border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4.5 h-4.5 text-[#0f62fe]" />
                  Active Catalog Lot Draft Builder
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Start bidding on premium upcoming athletes by kicking off catalog entries.</p>
              </div>

              {/* Filtering Controls */}
              <div className="flex gap-2 text-xs">
                {['ALL', 'BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition border cursor-pointer ${
                      selectedCategoryFilter === cat 
                        ? 'bg-[#0f62fe] text-white border-transparent' 
                        : 'bg-white/2 hover:bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog search search bar filter */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={playerSearchQuery}
                onChange={(e) => setPlayerSearchQuery(e.target.value)}
                placeholder="Lookup registered player draft catalog name..."
                className="w-full bg-[#050507] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0f62fe]"
              />
            </div>

            {filteredUpcoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {filteredUpcoming.map(player => (
                  <div 
                    key={player.id} 
                    className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-between gap-3 text-xs transition duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={player.imageUrl} 
                        alt={player.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover border border-white/5"
                      />
                      <div>
                        <h4 className="font-bold text-white">{player.name}</h4>
                        <span className="text-[9px] text-[#0f62fe] uppercase font-mono font-bold tracking-tight block">
                          {player.category} • Base: {formatMoney(player.basePrice)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTriggerLotKickoff(player.id)}
                      className="px-3 py-1.5 bg-[#0f62fe]/10 hover:bg-[#0f62fe] text-[#0f62fe] hover:text-white font-bold uppercase tracking-wider text-[9px] rounded-lg border border-[#0f62fe]/20 hover:border-transparent transition cursor-pointer"
                    >
                      Hammer Up Lot 🔨
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No upcoming players detected matching your search criteria.
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: FINANCIAL LEDGER & RECENT LEDGER */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* FRANCHISE PURSE & BUDGETS LEDGER */}
          <div className="bg-[#111118]/80 border border-white/10 rounded-2xl p-5">
            <h3 className="font-display font-bold text-white text-xs pb-2 border-b border-white/5 mb-4 uppercase tracking-wider">
              Franchise Purse &amp; Ledger
            </h3>

            <div className="space-y-4">
              {teams.map(team => {
                const isSelected = team.id === userTeamId;
                const progressLeft = ((team.maxBudget - team.budgetSpent) / team.maxBudget) * 100;
                
                return (
                  <div 
                    key={team.id}
                    onClick={() => {
                      setUserTeamId(team.id);
                      playSound('bid');
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected 
                        ? 'bg-[#0f62fe]/5 border-[#0f62fe]/50 shadow-md' 
                        : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <img 
                          src={team.logoUrl} 
                          alt={team.name} 
                          referrerPolicy="no-referrer"
                          className="w-5.5 h-5.5 rounded object-cover border border-white/5 shrink-0"
                        />
                        <div>
                          <h4 className="text-[11px] font-bold text-white tracking-tight flex items-center gap-1.5">
                            {team.name}
                            {isSelected && <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />}
                          </h4>
                          <span className="text-[9px] font-mono text-slate-500 uppercase">Manager: {team.managerName}</span>
                        </div>
                      </div>

                      <span className="text-[9px] font-mono text-slate-400">
                        Roster: <strong>{team.squadSize}/{maxSquadSize}</strong> slots
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-500 block uppercase text-[8px]">Purse Remaining</span>
                        <span className="font-bold text-emerald-400">{formatMoney(team.maxBudget - team.budgetSpent)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase text-[8px]">Foreign Cards</span>
                        <span className={`font-bold ${team.overseasCount >= maxOverseasLimit ? 'text-red-400' : 'text-white'}`}>
                          {team.overseasCount}/{maxOverseasLimit} Slots
                        </span>
                      </div>
                    </div>

                    {/* Progress slider */}
                    <div className="w-full bg-black/60 h-1 rounded-full mt-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          progressLeft <= 15 ? 'bg-red-500' : progressLeft <= 50 ? 'bg-yellow-500' : 'bg-[#0f62fe]'
                        }`}
                        style={{ width: `${progressLeft}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE RECORDED BIDS HISTORIES */}
          <div className="bg-[#111118]/80 border border-white/10 rounded-2xl p-5">
            <h3 className="font-display font-medium text-white text-xs mb-3 uppercase tracking-wider pb-2 border-b border-white/5">
              Live Auction Records Ledger
            </h3>
            
            {bidHistory.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[9px] pr-1">
                {bidHistory.map(b => {
                  return (
                    <div key={b.id} className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-1.5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white text-[10px]">{b.teamName}</span>
                        <span className="text-slate-500 block text-[8px]">{b.timestamp} • {b.paddleNumber}</span>
                      </div>
                      <span className="text-[#0f62fe] font-black text-xs font-mono">{formatMoney(b.amount)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-[10px]">
                Waiting for transaction lots to establish bids...
              </div>
            )}
          </div>

          {/* SYSTEM ACTIVITY EVENT CHIPS */}
          <div className="bg-[#111118]/80 border border-white/10 rounded-2xl p-5">
            <h3 className="font-display font-medium text-white text-xs mb-3 uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#0f62fe]" /> Live Event Stream
            </h3>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {logs.slice(0, 15).map(log => {
                const typeStyle = log.type === 'ALERT' ? 'bg-red-950/40 text-red-400 border-red-500/20' : 
                                  log.type === 'SUCCESS' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' : 
                                  log.type === 'WARNING' ? 'bg-yellow-950/40 text-yellow-500 border-yellow-500/20' : 
                                  'bg-white/2 text-slate-350 border-white/5';
                
                return (
                  <div key={log.id} className={`p-2 rounded-xl text-[9px] font-mono border ${typeStyle}`}>
                    <div className="flex justify-between font-bold border-b border-white/[0.04] pb-0.5 mb-1 text-[8px]">
                      <span>{log.type} Event</span>
                      <span className="text-slate-500 font-normal">{log.timestamp}</span>
                    </div>
                    <span>{log.message}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
