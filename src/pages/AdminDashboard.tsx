import React, { useState } from 'react';
import { useStore, useAuctionStore } from '../store';
import { UserRole, CurrencyMode } from '../types';
import { 
  Shield, 
  Gavel, 
  Play, 
  CheckCircle, 
  Ban, 
  Users, 
  Timer, 
  AlertTriangle, 
  Trash2,
  UserPlus,
  Edit2,
  Save,
  X,
  Coins,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  // Store context for Auction Control & Log auditing
  const { 
    players, 
    activeAuction, 
    teams,
    startAuctionItem, 
    sellCurrentPlayer, 
    unsoldCurrentPlayer, 
    triggerAutoBid,
    bidHistory,
    currencyMode,
    logs,
    resetSimulation,
    addSystemLog,
    addTeam,
    tournamentRequests,
    approveTournamentRequest,
    rejectTournamentRequest,
    // Current user context
    userRole,
    userName,
    userTeamId,
    setRole,
    setUserName,
    setUserTeamId,
    setCurrencyMode
  } = useStore();

  // Internal tab switcher - Auction, User Management, or Tournament requests
  const [activeSubTab, setActiveSubTab] = useState<'auction' | 'users' | 'requests'>('auction');

  // New Team registry form states
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamShort, setNewTeamShort] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState('');
  const [newTeamManager, setNewTeamManager] = useState('');
  const [newTeamBudget, setNewTeamBudget] = useState(1000000000); // Default: 100 Crores
  const [formError, setFormError] = useState('');

  // Editing existing team manager states
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editManagerName, setEditManagerName] = useState('');
  const [editMaxBudget, setEditMaxBudget] = useState(1000000000);

  // -- Handler Actions --
  const handleStartAuction = (id: string) => {
    startAuctionItem(id);
  };

  const handleSell = () => {
    if (!activeAuction) return;
    sellCurrentPlayer();
  };

  const handleUnsold = () => {
    if (!activeAuction) return;
    unsoldCurrentPlayer();
  };

  const mockCounterBid = () => {
    triggerAutoBid();
  };

  const triggerReset = () => {
    const confirmReboot = window.confirm('Are you absolutely sure you want to restore default teams, reset all rosters, budgets, and clear active lots?');
    if (confirmReboot) {
      resetSimulation();
      addSystemLog('Simulation database rebooted by platform administrator.', 'WARNING');
    }
  };

  // Register a new custom sports franchise
  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamShort.trim() || !newTeamManager.trim()) {
      setFormError('Please fill in Name, Abbr, and Manager Name.');
      return;
    }

    if (newTeamShort.length > 5) {
      setFormError('Abbreviation should contain at most 5 characters.');
      return;
    }

    const uniqueId = `team-${Date.now()}`;
    const cleanLogo = newTeamLogo.trim() || 'https://images.unsplash.com/photo-1540747737956-378724044453?w=120&auto=format&fit=crop&q=80';
    
    const formattedTeam = {
      id: uniqueId,
      name: newTeamName.trim(),
      shortName: newTeamShort.trim().toUpperCase(),
      logoUrl: cleanLogo,
      managerId: `mgr-${Date.now()}`,
      managerName: newTeamManager.trim(),
      budgetSpent: 0,
      maxBudget: Number(newTeamBudget),
      squadSize: 0,
      overseasCount: 0,
      filledRoles: { batsman: 0, bowler: 0, allRounder: 0, wicketKeeper: 0 }
    };

    addTeam(formattedTeam);

    // Reset Form
    setNewTeamName('');
    setNewTeamShort('');
    setNewTeamLogo('');
    setNewTeamManager('');
    setNewTeamBudget(1000000000);
    setFormError('');
    addSystemLog(`Sports team registered: ${formattedTeam.name}`, 'SUCCESS');
  };

  // Switch direct manager context or budgets on pre-existing franchises
  const startEditingTeam = (teamId: string, currentManager: string, currentBudget: number) => {
    setEditingTeamId(teamId);
    setEditManagerName(currentManager);
    setEditMaxBudget(currentBudget);
  };

  const saveTeamEdits = (teamId: string) => {
    if (!editManagerName.trim()) return;

    const revisedTeams = teams.map(t => 
      t.id === teamId 
        ? { ...t, managerName: editManagerName.trim(), maxBudget: editMaxBudget }
        : t
    );

    useAuctionStore.setState({ teams: revisedTeams });
    addSystemLog(`Franchise assignment changed for team ${teamId}: Manager = ${editManagerName.trim()}`, 'SUCCESS');
    setEditingTeamId(null);
  };

  const deleteTeam = (teamId: string, teamName: string) => {
    const confirmDel = window.confirm(`Are you sure you want to delete ${teamName}? This action cannot be undone.`);
    if (confirmDel) {
      const remainingTeams = teams.filter(t => t.id !== teamId);
      useAuctionStore.setState({ teams: remainingTeams });
      addSystemLog(`Team deleted: ${teamName}`, 'WARNING');
    }
  };

  const draftPool = players.filter(p => p.auctionStatus === 'UPCOMING' || p.auctionStatus === 'UNSOLD');

  const formatMoney = (val: number) => {
    if (currencyMode === 'INR') {
      const cr = val / 10000000;
      if (cr >= 1) return `₹${cr.toFixed(2)} Cr`;
      const lakhs = val / 100000;
      return `₹${lakhs.toFixed(0)} Lakhs`;
    }
    return `${(val / 10000).toFixed(0)} Credits`;
  };

  return (
    <div id="admin-unified-dashboard" className="space-y-6">
      
      {/* 🔮 PAGE SUMMARY HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-display font-black text-white flex items-center gap-2 tracking-tight select-none">
            <Shield className="w-6 h-6 text-[#0f62fe]" />
            Platform Admin Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Secure panel to manage active live rosters, start bidding lots, overrides roles, and configure franchise sports teams.
          </p>
        </div>

        {/* Global Select Tab Switcher */}
        <div className="bg-[#111118] border border-white/10 p-1 rounded-xl flex items-center gap-1 shrink-0 select-none">
          <button
            onClick={() => setActiveSubTab('auction')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${
              activeSubTab === 'auction'
                ? 'bg-[#0f62fe] text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            Auction Lobby
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-[#0f62fe] text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            User Management
          </button>
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${
              activeSubTab === 'requests'
                ? 'bg-[#0f62fe] text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Host Requests ({tournamentRequests ? tournamentRequests.filter(r => r.status === 'PENDING').length : 0})
          </button>
        </div>
      </div>

      {/* --- SUB-TAB 1: LOBBY & LOTS AUCTION MANAGEMENT --- */}
      {activeSubTab === 'auction' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Lot controls section */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Active Lot display widget */}
            <div className="bg-gradient-to-br from-[#111118] to-[#0c0c12] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-[#0f62fe]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 select-none">
                <span className="text-xs font-mono font-bold tracking-widest text-[#0f62fe] block uppercase">
                  {activeAuction ? `⚡ [ LOT IN PROGRESS • ${activeAuction.status} ]` : '💤 [ STANDBY • NO LIVE PLAYER ]'}
                </span>
                {activeAuction && (
                  <div className="flex items-center gap-1.5 text-xs text-[#0f62fe] bg-[#0f62fe]/10 px-3 py-1 rounded-full border border-[#0f62fe]/20">
                    <Timer className="w-3.5 h-3.5 animate-pulse" />
                    <span>Countdown: <strong>{activeAuction.timerSeconds}s</strong></span>
                  </div>
                )}
              </div>

              {activeAuction ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  
                  {/* Photo & specialist index */}
                  <div className="md:col-span-2 flex flex-col items-center border-r border-white/5 pr-2">
                    <img 
                      src={activeAuction.player.imageUrl} 
                      alt={activeAuction.player.name}
                      className="w-32 h-32 rounded-2xl object-cover border border-white/10 mb-3 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-center">
                      <span className="text-xs text-slate-400 font-medium tracking-tight block">{activeAuction.player.category}</span>
                      <div className="text-xs font-mono text-yellow-400 font-bold mt-1 uppercase tracking-wider">
                        Rating: ★ {activeAuction.player.rating}
                      </div>
                    </div>
                  </div>

                  {/* Lot stats & live bidding controls */}
                  <div className="md:col-span-3 space-y-4">
                    <div>
                      <span className="inline-block text-[10px] uppercase font-mono bg-white/5 px-2.5 py-1 rounded text-[#0f62fe] border border-white/5">
                        {activeAuction.player.isOverseas ? '✈ Overseas Player' : '🇮🇳 Domestic Star'}
                      </span>
                      <h3 className="text-2xl font-display font-black text-white mt-2 leading-tight">{activeAuction.player.name}</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div className="bg-[#050507] p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 block uppercase">Base Value</span>
                        <span className="text-xs font-bold text-white font-mono">{formatMoney(activeAuction.player.basePrice)}</span>
                      </div>
                      <div className="bg-[#050507] p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 block uppercase">Current Bid</span>
                        <span className="text-xs font-bold text-yellow-500 font-mono">{formatMoney(activeAuction.currentBid)}</span>
                      </div>
                      <div className="bg-[#050507] p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 block uppercase">Increment</span>
                        <span className="text-xs font-semibold text-slate-400 font-mono">+{formatMoney(activeAuction.minIncrement)}</span>
                      </div>
                    </div>

                    {/* Hammer Gavel actions */}
                    <div className="pt-2 border-t border-white/5 space-y-3">
                      <span className="text-xs font-semibold text-slate-400 font-sans block uppercase">Gavel Commands</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          id="moderator-sell-button"
                          onClick={handleSell}
                          disabled={!activeAuction.highestBidderTeamId}
                          className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          SELL PLAYER
                        </button>
                        
                        <button
                          id="moderator-unsold-button"
                          onClick={handleUnsold}
                          className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Ban className="w-4 h-4" />
                          UNSOLD / PASS
                        </button>

                        <button
                          id="moderator-auto-bid-button"
                          onClick={mockCounterBid}
                          className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-mono rounded-xl transition cursor-pointer flex items-center gap-1"
                          title="Place a proxy bot bid randomly"
                        >
                          🤖 Bot Bid
                        </button>
                      </div>
                      {!activeAuction.highestBidderTeamId && (
                        <p className="text-[10px] text-yellow-500/80 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Note: Bidding on this lot has no bids yet. At least 1 team bid is needed to SELL.
                        </p>
                      )}
                    </div>

                  </div>

                </div>
              ) : (
                <div className="py-14 text-center">
                  <p className="text-slate-400 text-sm">Waiting for live queue lots.</p>
                  <p className="text-xs text-slate-550 mt-1 max-w-sm mx-auto text-slate-500">
                    Select any eligible player listed in the available pool on the right and click "Gavel Up" to initiate the bidding counters.
                  </p>
                </div>
              )}
            </div>

            {/* Bidding Ticker Ledger Stream */}
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-5">
              <h3 className="font-display font-medium text-white text-sm mb-4">
                Active Bidding Ledger
              </h3>

              {bidHistory.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
                  {bidHistory.map((bid) => (
                    <div key={bid.id} className="flex justify-between items-center bg-[#050507] p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-yellow-500 text-black text-[9px] font-bold rounded">
                          {bid.paddleNumber}
                        </span>
                        <span className="font-semibold text-white">{bid.teamName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[10px]">{bid.timestamp}</span>
                        <span className="text-yellow-400 font-bold">{formatMoney(bid.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-6 text-center">No bids received during this catalog slot yet.</p>
              )}
            </div>

          </div>

          {/* Catalog list section */}
          <div className="lg:col-span-4">
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 space-y-3">
              <div>
                <h3 className="font-display font-bold text-white text-sm">Available Draft Catalog</h3>
                <p className="text-[10px] text-slate-400">Available player files waiting for moderation.</p>
              </div>

              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {draftPool.map(p => (
                  <div key={p.id} className="bg-[#050507]/90 border border-white/5 hover:border-[#0f62fe]/30 p-3 rounded-xl flex items-center justify-between gap-3 transition">
                    <div className="flex items-center gap-2">
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{p.name}</h4>
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest block mt-0.5">
                          {p.category} • {p.isOverseas ? '✈' : '🇮🇳'} • ★ {p.rating}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-yellow-500 font-semibold block">{formatMoney(p.basePrice)}</span>
                      <button
                        id={`start-lot-${p.id}`}
                        onClick={() => handleStartAuction(p.id)}
                        className="mt-1 px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] font-extrabold uppercase rounded transition flex items-center gap-0.5 cursor-pointer"
                      >
                        <Play className="w-2.5 h-2.5 fill-black" />
                        Gavel Up
                      </button>
                    </div>
                  </div>
                ))}

                {draftPool.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-12">All players selected or sold. Pool empty.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- SUB-TAB 2: USER LOGINS, ROLES, AND TEAMS OVERRIDES --- */}
      {activeSubTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Block: Active User Override System */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="pb-3 border-b border-white/5">
                <h3 className="text-base font-display font-bold text-white flex items-center gap-1.5">
                  <Coins className="w-5 h-5 text-[#0f62fe]" />
                  Internal Override Settings
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Override authentication settings directly inside this emulator.</p>
              </div>

              {/* Edit Current Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">Your Login Name</label>
                <input 
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Guest Username"
                  className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                />
              </div>

              {/* Edit Current Role */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">Override System Role</label>
                <select 
                  value={userRole}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                >
                  <option value={UserRole.SPECTATOR}>Spectator View (Read-Only)</option>
                  <option value={UserRole.TEAM_MANAGER}>Team Franchise Manager (Allowed Bidding)</option>
                  <option value={UserRole.AUCTION_ADMIN}>Moderator Room Admin</option>
                  <option value={UserRole.PLATFORM_ADMIN}>Super Platform Admin</option>
                </select>
              </div>

              {/* Representing franchise team selector for Bidding page assignment */}
              {userRole === UserRole.TEAM_MANAGER && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Assigned Franchise Board</label>
                  <select
                    value={userTeamId || ''}
                    onChange={(e) => setUserTeamId(e.target.value || null)}
                    className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                  >
                    <option value="">-- No Franchise Representative Account --</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Budget: {formatMoney(t.maxBudget)})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Switch currency format */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block">App Currency Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCurrencyMode('INR')}
                    className={`py-2 text-xs rounded-xl font-bold cursor-pointer transition ${
                      currencyMode === 'INR' 
                        ? 'bg-[#0f62fe]/15 text-[#0f62fe] border border-[#0f62fe]/40' 
                        : 'bg-white/5 text-slate-400 border border-transparent'
                    }`}
                  >
                    INR (₹ Lacs/Cr)
                  </button>
                  <button
                    onClick={() => setCurrencyMode('CREDITS')}
                    className={`py-2 text-xs rounded-xl font-bold cursor-pointer transition ${
                      currencyMode === 'CREDITS' 
                        ? 'bg-[#0f62fe]/15 text-[#0f62fe] border border-[#0f62fe]/40' 
                        : 'bg-white/5 text-slate-400 border border-transparent'
                    }`}
                  >
                    Virtual Credits
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <button
                  onClick={triggerReset}
                  className="w-full py-2.5 bg-red-650 bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-bold rounded-xl transition uppercase tracking-wider cursor-pointer"
                >
                  Factory Reset Simulation
                </button>
              </div>

            </div>

          </div>

          {/* Right Block: Franchise Teams & Active Managers config */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Franchise Registry Display */}
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                <div>
                  <h3 className="text-base font-display font-bold text-white flex items-center gap-1.5">
                    <Users className="w-5 h-5 text-[#0f62fe]" />
                    Franchise Sports Teams Roster
                  </h3>
                  <p className="text-[11px] text-slate-400">Configure managers, board profiles, and spending limit caps.</p>
                </div>
              </div>

              <div className="space-y-3.5">
                {teams.map(t => {
                  const isEditing = editingTeamId === t.id;
                  return (
                    <div 
                      key={t.id} 
                      className={`p-4 rounded-xl border transition ${
                        isEditing ? 'bg-[#151522] border-[#0f62fe]/60' : 'bg-[#050507] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={t.logoUrl} 
                            alt={t.name} 
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider">
                              {t.shortName}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1">{t.name}</h4>
                          </div>
                        </div>

                        {/* Inline delete team */}
                        <button
                          onClick={() => deleteTeam(t.id, t.name)}
                          className="p-1 px-1.5 text-red-550 text-red-400 hover:text-red-500 hover:bg-white/5 rounded transition cursor-pointer text-xs"
                          title="Delete team roster"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Editing Block inside Card */}
                      {isEditing ? (
                        <div className="mt-4 pt-3 border-t border-white/5 space-y-3 animate-in slide-in-from-top-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 font-mono block">MANAGER NAME</label>
                              <input 
                                type="text"
                                value={editManagerName}
                                onChange={(e) => setEditManagerName(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 font-mono block">LIMIT BUDGET (INR)</label>
                              <input 
                                type="number"
                                value={editMaxBudget}
                                onChange={(e) => setEditMaxBudget(Number(e.target.value))}
                                className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 text-xs pt-1">
                            <button
                              onClick={() => setEditingTeamId(null)}
                              className="px-3 py-1.5 bg-white/5 text-slate-300 rounded hover:bg-white/10 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveTeamEdits(t.id)}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition cursor-pointer font-bold flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" /> Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                            <div>
                              <span className="text-slate-500 text-[10px] uppercase">Manager Assigned</span>
                              <p className="text-slate-300 font-semibold">{t.managerName}</p>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] uppercase">Budget Limit</span>
                              <p className="text-yellow-500 font-bold">{formatMoney(t.maxBudget)}</p>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] uppercase">Spent Funds</span>
                              <p className="text-slate-300">{formatMoney(t.budgetSpent)}</p>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] uppercase">Roster slots</span>
                              <p className="text-slate-300">{t.squadSize} players</p>
                            </div>
                          </div>

                          <button
                            onClick={() => startEditingTeam(t.id, t.managerName, t.maxBudget)}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center gap-1 border border-white/10 hover:border-slate-400 transition cursor-pointer shrink-0 self-end sm:self-center"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit Profile
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form card to append a new Sports franchise team */}
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
              <div className="pb-3 border-b border-white/5 mb-4">
                <h3 className="text-base font-display font-bold text-white flex items-center gap-1.5">
                  <UserPlus className="w-5 h-5 text-[#0f62fe]" />
                  Register Custom Franchise Team
                </h3>
                <p className="text-[11px] text-slate-400">Append custom franchises to the real-time simulation draft pool.</p>
              </div>

              {formError && (
                <div className="p-3 bg-red-650 bg-red-600/10 border border-red-500/20 rounded-xl mb-4 text-xs text-red-400 flex items-center gap-1.5 select-none">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-mono block">TEAM NAME *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Bangalore Fireballs"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-mono block">ABBREVIATION (MAX 5 CHARS) *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. BFB"
                      value={newTeamShort}
                      onChange={(e) => setNewTeamShort(e.target.value)}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-mono block">MANAGER NAME *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Sourav Ganguly"
                      value={newTeamManager}
                      onChange={(e) => setNewTeamManager(e.target.value)}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-mono block">FRANCHISE BUDGET LIMIT (INR) *</label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 1000000000"
                      value={newTeamBudget}
                      onChange={(e) => setNewTeamBudget(Number(e.target.value))}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-mono block">TEAM LOGO ARCHIVE RESOURSE URL (OPTIONAL)</label>
                  <input 
                    type="url"
                    placeholder="e.g. https://images.unsplash.com/your-image-url"
                    value={newTeamLogo}
                    onChange={(e) => setNewTeamLogo(e.target.value)}
                    className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0f62fe] hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  Register Franchise
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* --- SUB-TAB 3: TOURNAMENT REQUESTS APPROVAL PANELS --- */}
      {activeSubTab === 'requests' && (
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-display font-bold text-white uppercase flex items-center gap-2 select-none">
              <RefreshCw className="w-4.5 h-4.5 text-[#0f62fe]" />
              Tournament Gavel Authorization Center
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Review, authorize, or reject sports franchise draft lobbys. Approved requests will automatically spawn active tournament slots.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: pending requests */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-white tracking-widest border-b border-white/5 pb-2 select-none">
                Pending Requests Queue ({tournamentRequests.filter(r => r.status === 'PENDING').length})
              </h4>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {tournamentRequests.filter(r => r.status === 'PENDING').map(r => (
                  <div key={r.id} className="bg-[#050507] border border-white/5 rounded-xl p-4.5 space-y-3.5 hover:border-white/10 transition">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h5 className="text-xs font-bold text-white uppercase">{r.name}</h5>
                        <span className="text-[9px] text-[#0f62fe] block font-mono uppercase mt-0.5">Proposed By: {r.requestedBy}</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 font-mono rounded select-none">
                        Awaiting Action
                      </span>
                    </div>

                    <div className="bg-[#111118] p-3 rounded border border-white/5 text-[10px] leading-relaxed italic text-slate-450 text-slate-400">
                      "{r.customRules}"
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] select-none text-slate-350">
                      <div>Limit: <strong className="text-white">{r.teamsCount} Teams</strong></div>
                      <div>Initial Budget: <strong className="text-white font-mono">{formatMoney(r.baseBudget)}</strong></div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex gap-2 justify-end">
                      <button
                        onClick={() => rejectTournamentRequest(r.id)}
                        className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 text-[9px] font-bold rounded uppercase tracking-wider cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          approveTournamentRequest(r.id);
                          alert(`Success: Approved "${r.name}". A corresponding active tournament has been registered!`);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold rounded uppercase tracking-wider cursor-pointer font-sans"
                      >
                        Approve & Create
                      </button>
                    </div>
                  </div>
                ))}

                {tournamentRequests.filter(r => r.status === 'PENDING').length === 0 && (
                  <div className="py-14 text-center select-none border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                    <span className="text-2xl block">🎉</span>
                    <p className="text-xs text-slate-500 italic mt-1">All pending registration requests cleared!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: history/authorized list */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-white tracking-widest border-b border-white/5 pb-2 select-none">
                Processed Requests History ({tournamentRequests.filter(r => r.status !== 'PENDING').length})
              </h4>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {tournamentRequests.filter(r => r.status !== 'PENDING').map(r => (
                  <div key={r.id} className="bg-[#050507]/60 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <h5 className="text-[11px] font-extrabold text-white uppercase">{r.name}</h5>
                      <span className="text-[9px] text-slate-500 block mt-0.5">By: {r.requestedBy} • {r.teamsCount} Teams</span>
                    </div>

                    <div className="select-none">
                      {r.status === 'APPROVED' ? (
                        <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded uppercase font-mono">
                          Approved
                        </span>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded uppercase font-mono">
                          Declined
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {tournamentRequests.filter(r => r.status !== 'PENDING').length === 0 && (
                  <p className="py-14 text-center select-none text-xs text-slate-500 italic">No processed requests history available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
