import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Tv, 
  Award, 
  Radio, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Search, 
  User, 
  Coins, 
  Ban, 
  CheckCircle2, 
  Calendar, 
  Hash, 
  Clock, 
  Filter, 
  UserX,
  History,
  BookOpen
} from 'lucide-react';

export const RealTimeSpectatorBoard: React.FC = () => {
  const { activeAuction, players, teams, currencyMode, bidHistory } = useStore();

  // Navigation tab states: 'live' | 'upcoming' | 'history'
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'history'>('live');

  // Search & Filters for upcoming players
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [nationalityFilter, setNationalityFilter] = useState<string>('ALL');

  // Filter lists
  const finishedSold = players.filter(p => p.auctionStatus === 'SOLD');
  const upcomingPlayers = players.filter(p => p.auctionStatus === 'UPCOMING');
  const unsoldPlayers = players.filter(p => p.auctionStatus === 'UNSOLD');

  // Historic statistics calculations
  const totalSpent = teams.reduce((acc, curr) => acc + curr.budgetSpent, 0);
  const avgSoldPrice = finishedSold.length > 0 
    ? finishedSold.reduce((acc, curr) => acc + (curr.soldPrice || 0), 0) / finishedSold.length 
    : 0;

  const highestPaidPlayer = finishedSold.length > 0
    ? [...finishedSold].sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))[0]
    : null;

  const formatMoney = (val: number) => {
    if (currencyMode === 'INR') {
      const cr = val / 10000000;
      if (cr >= 1) return `₹${cr.toFixed(2)} Cr`;
      const lakhs = val / 100000;
      return `₹${lakhs.toFixed(0)} Lakhs`;
    }
    return `${(val / 10000).toFixed(0)} Credits`;
  };

  // Filtered upcoming players
  const filteredUpcoming = upcomingPlayers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesNationality = nationalityFilter === 'ALL' || 
      (nationalityFilter === 'OVERSEAS' && p.isOverseas) || 
      (nationalityFilter === 'DOMESTIC' && !p.isOverseas);
    return matchesSearch && matchesCategory && matchesNationality;
  });

  return (
    <div id="spectator-board-terminal" className="space-y-6">
      
      {/* 🔮 PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-display font-black text-white flex items-center gap-2 select-none">
            <Tv className="w-6 h-6 text-[#0f62fe]" />
            Live Auction Spectator Lounge
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time public telemetry hub. Stream live lots, search the upcoming draft list, and audit completed transfers.
          </p>
        </div>

        {/* Global Select Tab Switcher */}
        <div className="bg-[#111118] border border-white/10 p-1 rounded-xl flex items-center gap-1 shrink-0 select-none">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${
              activeTab === 'live'
                ? 'bg-[#0f62fe] text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Live Arena
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-[#0f62fe] text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Upcoming Queue ({upcomingPlayers.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#0f62fe] text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Historic Logs & Bios
          </button>
        </div>
      </div>

      {/* --- TAB 1: LIVE BROADCAST FEED --- */}
      {activeTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main spotlight feed */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Direct TV Screen Display */}
            <div className="bg-[#050507] border-2 border-white/10 rounded-3xl overflow-hidden relative shadow-2xl flex flex-col justify-between aspect-video group">
              
              <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none z-10">
                <span className="px-3 py-1 bg-[#111118]/95 border border-white/10 text-[#0f62fe] font-mono text-[10px] uppercase font-bold tracking-widest rounded-lg flex items-center gap-1.5 shadow">
                  <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  Live Stadium Spot Feed
                </span>
                {activeAuction && (
                  <span className="px-3 py-1 bg-[#111118]/95 border border-white/10 text-yellow-400 font-mono text-[10px] rounded-lg font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" />
                    Timer: {activeAuction.timerSeconds}s
                  </span>
                )}
              </div>

              {/* Player Showcase Body */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#111118] via-[#050507] to-[#111118] flex flex-col items-center justify-center p-6 text-center">
                {activeAuction ? (
                  <div className="space-y-4 max-w-xl w-full my-auto flex flex-col md:flex-row items-center justify-center gap-8 text-left z-10">
                    
                    {/* Main Image Avatar Card */}
                    <div className="w-44 h-56 bg-gradient-to-t from-slate-800 to-slate-900 rounded-2xl border border-white/10 overflow-hidden relative shrink-0 shadow-xl">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(15,98,254,0.15),transparent)]"></div>
                      <img 
                        src={activeAuction.player.imageUrl} 
                        alt={activeAuction.player.name} 
                        className="w-full h-full object-cover relative z-10"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 right-2.5 z-20 bg-[#0f62fe] text-white font-mono font-black text-xs rounded-lg w-8 h-8 flex items-center justify-center shadow-lg">
                        {activeAuction.player.rating}
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 z-20 text-center bg-black/75 backdrop-blur-md py-0.5 rounded text-[9px] uppercase font-bold text-slate-300">
                        {activeAuction.player.isOverseas ? '✈ Overseas Star' : '🇮🇳 Domestic Star'}
                      </div>
                    </div>

                    {/* Meta stats and valuations */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <span className="inline-flex items-center px-3 py-0.5 bg-[#0f62fe]/10 border border-[#0f62fe]/20 text-[#0f62fe] text-[10px] font-bold rounded-full uppercase tracking-widest mb-1.5 font-mono">
                          {activeAuction.player.category} Specialist
                        </span>
                        <h2 className="text-3xl font-black tracking-tight uppercase text-white font-sans leading-none">
                          {activeAuction.player.name}
                        </h2>
                        
                        {/* Compact statistics table */}
                        <div className="grid grid-cols-3 gap-2 mt-3 select-none">
                          {activeAuction.player.category === 'BATSMAN' || activeAuction.player.category === 'WICKET_KEEPER' ? (
                            <>
                              <div className="bg-white/5 p-1 px-2 rounded border border-white/5 text-center">
                                <span className="text-[9px] text-slate-450 block font-mono text-slate-500">MATCHES</span>
                                <span className="text-xs font-extrabold text-white">{activeAuction.player.stats?.matches || '—'}</span>
                              </div>
                              <div className="bg-white/5 p-1 px-2 rounded border border-white/5 text-center">
                                <span className="text-[9px] text-slate-450 block font-mono text-slate-500">RUNS</span>
                                <span className="text-xs font-extrabold text-white">{activeAuction.player.stats?.runs || '—'}</span>
                              </div>
                              <div className="bg-white/5 p-1 px-2 rounded border border-white/5 text-center">
                                <span className="text-[9px] text-slate-450 block font-mono text-slate-500">S/R</span>
                                <span className="text-xs font-extrabold text-white">{activeAuction.player.stats?.strikeRate || '—'}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="bg-white/5 p-1 px-2 rounded border border-white/5 text-center">
                                <span className="text-[9px] text-slate-450 block font-mono text-slate-500">MATCHES</span>
                                <span className="text-xs font-extrabold text-white">{activeAuction.player.stats?.matches || '—'}</span>
                              </div>
                              <div className="bg-white/5 p-1 px-2 rounded border border-white/5 text-center">
                                <span className="text-[9px] text-slate-450 block font-mono text-slate-500">WICKETS</span>
                                <span className="text-xs font-extrabold text-white">{activeAuction.player.stats?.wickets || '—'}</span>
                              </div>
                              <div className="bg-white/5 p-1 px-2 rounded border border-white/5 text-center">
                                <span className="text-[9px] text-slate-450 block font-mono text-slate-500">ECONOMY</span>
                                <span className="text-xs font-extrabold text-white">{activeAuction.player.stats?.economy || '—'}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#050507] border border-white/10 rounded-xl p-3 shadow-lg">
                          <span className="text-[9px] text-slate-500 font-mono block uppercase tracking-wider">Base Price</span>
                          <span className="text-lg font-black text-slate-300 font-mono">
                            {formatMoney(activeAuction.player.basePrice)}
                          </span>
                        </div>
                        <div className="bg-[#0f62fe]/10 border border-[#0f62fe]/30 rounded-xl p-3 shadow-lg">
                          <span className="text-[9px] text-[#0f62fe] font-mono block uppercase tracking-wider font-bold">Highest Bid</span>
                          <span className="text-lg font-black text-yellow-400 font-mono">
                            {formatMoney(activeAuction.currentBid)}
                          </span>
                        </div>
                      </div>
                      
                      {activeAuction.highestBidderTeamId ? (
                        <div className="flex items-center gap-2 p-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-full">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                          <span className="text-[10px] text-emerald-400 font-mono uppercase font-black">LEADER PADDLE:</span>
                          <span className="text-white text-xs font-black uppercase tracking-tight truncate">
                            {teams.find(t => t.id === activeAuction.highestBidderTeamId)?.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 p-2 px-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl text-yellow-500">
                          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wide">
                            Awaiting opening paddle bid...
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="space-y-4 max-w-sm z-10 select-none">
                    <div className="w-16 h-16 bg-[#111118] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-2 text-3xl shadow-lg">
                      💤
                    </div>
                    <h4 className="text-base font-bold text-white uppercase tracking-tight">Gavel Platform Idle</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      The admin panel is currently not streaming any active players. Bidding will resume once a room administrator initiates the next player lot.
                    </p>
                  </div>
                )}
              </div>

              {/* IPL Sports overlay news layout */}
              <div className="bg-[#111118] border-t border-white/5 py-3.5 px-6 flex items-center justify-between text-xs font-mono relative z-10 shrink-0 select-none">
                <div className="flex items-center gap-3">
                  <span className="text-[#0f62fe] font-black tracking-widest uppercase italic text-[11px] flex items-center gap-1">
                    <span className="w-2 h-2 bg-[#0f62fe] rounded-full animate-pulse" /> TELEMETRY
                  </span>
                  {activeAuction && (
                    <span className="text-slate-300 text-[11px] hidden sm:inline">
                      SPOTLIGHT ACTIVE: <strong className="text-white font-sans uppercase font-bold text-xs">{activeAuction.player.name}</strong>
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                  {bidHistory.length > 0 ? `Ledger Count: ${bidHistory.length}` : 'Secure socket streaming active'}
                </div>
              </div>

            </div>

            {/* Quick stats grid highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#111118] border border-white/10 p-4 rounded-xl flex items-center gap-3 select-none">
                <div className="w-10 h-10 bg-[#0f62fe]/10 border border-[#0f62fe]/20 text-[#0f62fe] rounded-lg flex items-center justify-center text-lg shrink-0">
                  <Award className="w-5 h-5 text-[#0f62fe]" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Roster Slots Filled</span>
                  <span className="text-base font-display font-bold text-white font-mono">{finishedSold.length} Sold Drafts</span>
                </div>
              </div>

              <div className="bg-[#111118] border border-white/10 p-4 rounded-xl flex items-center gap-3 select-none">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center text-lg shrink-0">
                  <Coins className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Accumulated Value</span>
                  <span className="text-base font-display font-bold text-white font-mono">
                    {formatMoney(totalSpent)}
                  </span>
                </div>
              </div>

              <div className="bg-[#111118] border border-white/10 p-4 rounded-xl flex items-center gap-3 select-none">
                <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg flex items-center justify-center text-lg shrink-0">
                  <Flame className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Remaining Pool</span>
                  <span className="text-base font-display font-bold text-white font-mono">
                    {upcomingPlayers.length} Players Left
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right sidebar containing real-time bids ledger stream of current lot */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Realtime bids ledger */}
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-full min-h-[400px]">
              <div className="space-y-4">
                <div className="pb-3 border-b border-white/5">
                  <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0f62fe]" />
                    Spot Bidding Ledger
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Live chronological list of logs transmitted from team paddles.
                  </p>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
                  {bidHistory.map((b, idx) => (
                    <div 
                      key={b.id} 
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 font-mono transition-all duration-300 ${
                        idx === 0 
                          ? 'bg-[#0f62fe]/10 border-[#0f62fe]/30 scale-102 font-bold' 
                          : 'bg-[#050507] border-white/5 opacity-80'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {b.teamName}
                        </span>
                        <span className="text-[9px] bg-white/5 text-slate-300 px-1.5 py-0.5 rounded text-yellow-400 uppercase tracking-widest text-[8px]">
                          {b.paddleNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-black block text-white text-[#0f62fe]">
                          {formatMoney(b.amount)}
                        </span>
                        <span className="text-[8px] text-slate-500 font-normal">
                          {b.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {bidHistory.length === 0 && (
                    <div className="py-14 text-center space-y-2">
                      <span className="text-2xl block text-slate-650">📯</span>
                      <p className="text-xs text-slate-500 italic">No paddle reports received in this session yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 text-center select-none">
                <span className="text-[9px] text-slate-600 font-mono tracking-widest uppercase block">
                  Encrypted Broadcast Lock // SSL Active
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- TAB 2: UPCOMING DRAFT QUEUE LISTING --- */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          
          {/* Controls bar */}
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search players by name..."
                className="w-full bg-[#050507] border border-white/10 rounded-xl pl-9.5 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0f62fe] font-sans"
              />
            </div>

            {/* Filter tags / Select inputs */}
            <div className="flex flex-wrap items-center gap-3 text-xs select-none">
              
              {/* Category Filter dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-slate-400 text-[11px] uppercase font-mono tracking-wider font-bold">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-[#050507] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                >
                  <option value="ALL">All Categories</option>
                  <option value="BATSMAN">Batsmen Only</option>
                  <option value="BOWLER">Bowlers Only</option>
                  <option value="ALL_ROUNDER">All-Rounder Profiles</option>
                  <option value="WICKET_KEEPER">Wicket Keepers</option>
                </select>
              </div>

              {/* Nationality dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-slate-400 text-[11px] uppercase font-mono tracking-wider font-bold">Origin:</span>
                <select
                  value={nationalityFilter}
                  onChange={(e) => setNationalityFilter(e.target.value)}
                  className="bg-[#050507] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                >
                  <option value="ALL">All Locations</option>
                  <option value="DOMESTIC">Domestic (India 🇮🇳)</option>
                  <option value="OVERSEAS">Overseas (International ✈)</option>
                </select>
              </div>

            </div>

          </div>

          {/* Grid list of upcoming items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredUpcoming.map(p => (
              <div 
                key={p.id} 
                className="bg-[#111118] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-[#0f62fe]/30 transition group relative overflow-hidden"
              >
                {/* Overlay rating indicator */}
                <span className="absolute top-3 right-3 bg-[#0f62fe]/10 text-[#0f62fe] border border-[#0f62fe]/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full select-none">
                  Rating: {p.rating}
                </span>

                <div className="space-y-3 pb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-[9px] text-[#0f62fe] font-mono font-bold uppercase tracking-wider block">
                        {p.category}
                      </span>
                      <h4 className="text-xs font-black text-white group-hover:text-[#0f62fe] transition-colors leading-tight">
                        {p.name}
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[10px] select-none">
                    <div className="bg-[#050507] p-1.5 rounded">
                      <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Origin</span>
                      <span className="text-slate-300 font-semibold">{p.isOverseas ? 'Overseas ✈' : 'Domestic 🇮🇳'}</span>
                    </div>
                    <div className="bg-[#050507] p-1.5 rounded">
                      <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Base Price</span>
                      <span className="text-yellow-500 font-mono font-bold">{formatMoney(p.basePrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="inline-block text-[9px] text-slate-400 font-mono italic">
                    Ready in queue • Pending activation
                  </span>
                </div>
              </div>
            ))}

            {filteredUpcoming.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-2 select-none border border-dashed border-white/10 rounded-2xl bg-[#111118]/50">
                <span className="text-3xl block">📁</span>
                <h4 className="text-sm font-bold text-white uppercase">No upcoming drafts match filters</h4>
                <p className="text-xs text-slate-550 text-slate-400 max-w-xs mx-auto">
                  Try adjusting your keywords or category specifications to clear the filters panel.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- TAB 3: HISTORIC LOGS & BIOS CARD --- */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          
          {/* Main historic stats block */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 select-none">
            
            <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-xs text-slate-500 font-mono uppercase block tracking-wider">Total Sales Capital</span>
              <span className="text-2xl font-black text-emerald-400 font-mono block mt-1.5">{formatMoney(totalSpent)}</span>
              <p className="text-[10px] text-slate-400 mt-2">Aggregated investment of all franchise slots.</p>
            </div>

            <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 h-16 w-16 bg-[#0f62fe]/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-xs text-slate-500 font-mono uppercase block tracking-wider">Average Sale Price</span>
              <span className="text-2xl font-black text-white font-mono block mt-1.5">{formatMoney(avgSoldPrice)}</span>
              <p className="text-[10px] text-slate-400 mt-2">Overall bidding cost average of drafted items.</p>
            </div>

            <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
              <span className="text-xs text-slate-500 font-mono uppercase block tracking-wider">Draft Success Ratio</span>
              <span className="text-2xl font-black text-blue-400 font-mono block mt-1.5">
                {players.length > 0 ? ((finishedSold.length / players.length) * 100).toFixed(0) : '0'} %
              </span>
              <p className="text-[10px] text-slate-400 mt-2">Overall draft pool clearance velocity.</p>
            </div>

            <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 h-16 w-16 bg-yellow-500/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-xs text-slate-500 font-mono uppercase block tracking-wider">Unsold Hammer Count</span>
              <span className="text-2xl font-black text-red-400 font-mono block mt-1.5">{unsoldPlayers.length} Passed</span>
              <p className="text-[10px] text-slate-400 mt-2">Lot items that went unplaced back to the catalog.</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Sold bio cards ledger */}
            <div className="lg:col-span-8 bg-[#111118] border border-white/10 rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="font-display font-bold text-white text-base">Completed Gavel Assignments</h3>
                <p className="text-xs text-slate-400">Detailed list of players successfully assigned to franchise boards.</p>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {finishedSold.map(p => {
                  const buyerTeam = teams.find(t => t.id === p.soldToTeamId);
                  return (
                    <div 
                      key={p.id} 
                      className="bg-[#050507] border border-white/5 hover:border-white/10 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white uppercase">{p.name}</h4>
                            <span className="text-[8px] bg-[#0f62fe]/10 text-[#0f62fe] px-1.5 py-0.2 rounded font-mono uppercase font-black">
                              {p.category}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1 font-sans">
                            Assigned Franchise: <strong className="text-slate-350 text-white font-semibold">{buyerTeam?.name || 'Unknown'} ({buyerTeam?.shortName})</strong>
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[9px] text-slate-555 text-slate-500 font-mono block uppercase">Hammer Cost Price</span>
                        <span className="text-sm font-black text-yellow-400 font-mono block">
                          {p.soldPrice ? formatMoney(p.soldPrice) : 'Unreleased'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {finishedSold.length === 0 && (
                  <div className="py-20 text-center space-y-2 select-none">
                    <span className="text-3xl block text-slate-650">🏆</span>
                    <p className="text-xs text-slate-500 italic">No completed player sales logs recorded yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Unsold players and top spotlight */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Highlight card of the Highest paid package */}
              {highestPaidPlayer && (
                <div className="bg-gradient-to-br from-[#111118] to-[#120f26] border border-[#0f62fe]/30 rounded-2xl p-5 relative overflow-hidden select-none">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-[#0f62fe]/10 rounded-full blur-2xl pointer-events-none" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                    Spotlight Bid Acquisition
                  </span>

                  <div className="flex items-center gap-3 mt-4">
                    <img 
                      src={highestPaidPlayer.imageUrl} 
                      alt={highestPaidPlayer.name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10 shadow"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-white leading-tight uppercase">
                        {highestPaidPlayer.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5 uppercase tracking-widest">
                        Rating: ★ {highestPaidPlayer.rating} • {highestPaidPlayer.category}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-white/5 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-mono">Assigned To</span>
                      <p className="font-bold text-white mt-0.5">
                        {teams.find(t => t.id === highestPaidPlayer.soldToTeamId)?.shortName || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 uppercase font-mono">Hammer Deal</span>
                      <p className="font-black text-yellow-400 font-mono text-sm mt-0.5">
                        {formatMoney(highestPaidPlayer.soldPrice || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Box of unsolds */}
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="pb-2 border-b border-white/5">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-display">
                    <Ban className="w-3.5 h-3.5 text-red-400" />
                    Unsold Pass Pool ({unsoldPlayers.length})
                  </h4>
                  <p className="text-[9px] text-slate-400 mt-1">Lot items waiting for a secondary recall round.</p>
                </div>

                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {unsoldPlayers.map(p => (
                    <div key={p.id} className="bg-[#050507] p-2.5 rounded-lg border border-white/5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          className="w-7 h-7 rounded-lg object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h5 className="font-bold text-white text-[11px] uppercase leading-none">{p.name}</h5>
                          <span className="text-[9px] text-slate-500 uppercase block font-mono mt-0.5">{p.category}</span>
                        </div>
                      </div>
                      <span className="font-mono text-slate-405 text-slate-400 font-medium text-[10px]">
                        Base: {formatMoney(p.basePrice)}
                      </span>
                    </div>
                  ))}

                  {unsoldPlayers.length === 0 && (
                    <p className="text-[10px] text-slate-550 text-slate-500 italic py-6 text-center">
                      No passed unsolds recorded in this slot yet.
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
