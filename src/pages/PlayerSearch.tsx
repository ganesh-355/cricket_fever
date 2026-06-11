import React, { useState } from 'react';
import { useStore } from '../store';
import { Player, PlayerCategory } from '../types';
import { Search, Filter, Award, ChevronRight, Activity, TrendingUp } from 'lucide-react';

export const PlayerAnalyticsSearch: React.FC = () => {
  const { players, teams, currencyMode } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('p-1');

  const selectedPlayer = players.find(p => p.id === selectedPlayerId) || players[0];

  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  const formatMoney = (val: number) => {
    if (currencyMode === 'INR') {
      const cr = val / 10000000;
      if (cr >= 1) return `₹${cr.toFixed(2)} Cr`;
      const lakhs = val / 100000;
      return `₹${lakhs.toFixed(0)} Lakhs`;
    }
    return `${(val / 10000).toFixed(0)} Credits`;
  };

  // Run the combined filter pipeline
  const filteredPlayers = players.filter(p => {
    const matchesKeyword = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || p.auctionStatus === statusFilter;
    return matchesKeyword && matchesCategory && matchesStatus;
  });

  return (
    <div id="player-analytics-search-viewport" className="space-y-6">
      
      {/* Search Header Banner */}
      <div>
        <h2 className="text-2xl font-display font-black text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-yellow-500" />
          Player Discovery Directory
        </h2>
        <p className="text-xs text-gray-400">
          Search player profiles, explore draft histories, check career comparative indices, and explore statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Search filters and results lookup */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Controls bar */}
          <div className="bg-board-card border border-board-border p-4 rounded-xl space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search player lot names..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-board-dark border border-board-border rounded-lg pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
              />
            </div>

            {/* Quick Filter Caps */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Filter category:</span>
              <div className="flex bg-board-dark p-1 rounded-lg border border-board-border/60">
                {['ALL', 'BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded transition ${
                      categoryFilter === cat ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px] ml-2">Lot status:</span>
              <div className="flex bg-board-dark p-1 rounded-lg border border-board-border/60">
                {['ALL', 'UPCOMING', 'ACTIVE', 'SOLD', 'UNSOLD'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded transition ${
                      statusFilter === st ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Results table matrix */}
          <div className="bg-board-card border border-board-border rounded-xl p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-board-border text-gray-400 uppercase tracking-widest text-[9px]">
                    <th className="pb-3 pt-1">Player Identity</th>
                    <th className="pb-3 pt-1">Category</th>
                    <th className="pb-3 pt-1">Roster</th>
                    <th className="pb-3 pt-1">Base Price</th>
                    <th className="pb-3 pt-1">Lot State</th>
                    <th className="pb-3 pt-1 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-board-border/40 text-gray-300">
                  {filteredPlayers.map(p => (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedPlayerId(p.id)}
                      className={`cursor-pointer hover:bg-[#131d35]/30 ${
                        selectedPlayer.id === p.id ? 'bg-[#131d35]/40 text-white font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 font-sans font-semibold text-white flex items-center gap-2">
                        <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-board-border" referrerPolicy="no-referrer" />
                        <span>{p.name}</span>
                      </td>
                      <td className="py-3 text-[10px] text-gray-400">{p.category}</td>
                      <td className="py-3">{p.isOverseas ? '✈ Overseas' : '🇮🇳 Domestic'}</td>
                      <td className="py-3">{formatMoney(p.basePrice)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          p.auctionStatus === 'SOLD' ? 'bg-emerald-950/60 text-emerald-400'
                          : p.auctionStatus === 'UNSOLD' ? 'bg-red-950/60 text-red-400'
                          : p.auctionStatus === 'ACTIVE' ? 'bg-yellow-950/60 text-yellow-400 animate-pulse'
                          : 'bg-gray-950/60 text-gray-400'
                        }`}>
                          {p.auctionStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                      </td>
                    </tr>
                  ))}

                  {filteredPlayers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 font-sans italic">
                        No players matched your query filters inside draft pool directories.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Detailed Career Stats Board Card */}
        <div className="space-y-6">
          {selectedPlayer ? (
            <div className="bg-gradient-to-br from-board-card via-board-card to-amber-950/10 border border-board-border rounded-2xl p-6 shadow-2xl space-y-6">
              
              <div className="text-center relative">
                <img 
                  src={selectedPlayer.imageUrl} 
                  alt={selectedPlayer.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-yellow-500/30 mx-auto mb-3 shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] px-2 py-0.5 uppercase tracking-wider bg-board-dark border border-board-border rounded text-blue-400 font-mono">
                  ★ rating {selectedPlayer.rating}
                </span>
                <h3 className="text-xl font-display font-black text-white mt-2 leading-tight">{selectedPlayer.name}</h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">{selectedPlayer.category}</p>
              </div>

              {/* Roster career indicators ledger */}
              <div className="bg-board-dark/80 rounded-xl p-4 border border-board-border">
                <span className="text-[10px] font-bold text-gray-500 block uppercase font-mono mb-3">T20 Career Scorecard Analytics</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  {selectedPlayer.stats.matches !== undefined && (
                    <div className="flex justify-between items-center border-b border-board-border/40 pb-1.5">
                      <span className="text-gray-400">Matches</span>
                      <span className="font-bold text-white">{selectedPlayer.stats.matches}</span>
                    </div>
                  )}
                  {selectedPlayer.stats.runs !== undefined && (
                    <div className="flex justify-between items-center border-b border-board-border/40 pb-1.5">
                      <span className="text-gray-400">Total Runs</span>
                      <span className="font-bold text-white">{selectedPlayer.stats.runs}</span>
                    </div>
                  )}
                  {selectedPlayer.stats.strikeRate !== undefined && (
                    <div className="flex justify-between items-center border-b border-board-border/40 pb-1.5">
                      <span className="text-gray-400">Strike Rate</span>
                      <span className="font-bold text-yellow-400">{selectedPlayer.stats.strikeRate}</span>
                    </div>
                  )}
                  {selectedPlayer.stats.wickets !== undefined && (
                    <div className="flex justify-between items-center border-b border-board-border/40 pb-1.5">
                      <span className="text-gray-400">Wickets</span>
                      <span className="font-bold text-white">{selectedPlayer.stats.wickets}</span>
                    </div>
                  )}
                  {selectedPlayer.stats.economy !== undefined && (
                    <div className="flex justify-between items-center border-b border-board-border/40 pb-1.5">
                      <span className="text-gray-400">Economy</span>
                      <span className="font-bold text-white">{selectedPlayer.stats.economy}</span>
                    </div>
                  )}
                  {selectedPlayer.stats.average !== undefined && (
                    <div className="flex justify-between items-center border-b border-board-border/40 pb-1.5">
                      <span className="text-gray-400">Average</span>
                      <span className="font-bold text-white">{selectedPlayer.stats.average}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lot historical status */}
              <div className="space-y-3.5 pt-4 border-t border-board-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Active status:</span>
                  <span className="font-bold text-white font-mono uppercase text-yellow-400 animate-pulse">{selectedPlayer.auctionStatus}</span>
                </div>

                {selectedPlayer.auctionStatus === 'SOLD' && selectedPlayer.soldToTeamId && (
                  <div className="p-3 bg-emerald-950/25 border border-emerald-500/20 rounded-lg text-xs">
                    <span className="text-emerald-400 font-bold font-mono">Hammer Dropped (SOLD)</span>
                    <p className="text-gray-400 mt-1">Drafted to <strong className="text-white">{teams.find(t=>t.id===selectedPlayer.soldToTeamId)?.name}</strong> for <strong>{formatMoney(selectedPlayer.soldPrice || 0)}</strong>.</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-12 bg-board-card border border-board-border rounded-xl">Select a draft card to view their comprehensive career scorecard statistics.</p>
          )}
        </div>

      </div>

    </div>
  );
};
