import React, { useState } from 'react';
import { useStore } from '../store';
import { Users, Info, ShieldCheck, Award, CreditCard, Sparkles } from 'lucide-react';

export const SquadBuilderDraft: React.FC = () => {
  const { teams, players, currencyMode } = useStore();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('team-1');

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const teamSquad = players.filter(p => p.soldToTeamId === selectedTeam.id);

  const formatMoney = (val: number) => {
    if (currencyMode === 'INR') {
      const cr = val / 10000000;
      if (cr >= 1) return `₹${cr.toFixed(2)} Cr`;
      const lakhs = val / 100000;
      return `₹${lakhs.toFixed(0)} Lakhs`;
    }
    return `${(val / 10000).toFixed(0)} Credits`;
  };

  const remainingPurse = selectedTeam.maxBudget - selectedTeam.budgetSpent;

  return (
    <div id="squad-builder-draft-node" className="space-y-6">
      
      {/* Visual Roster Selector Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-board-border/60">
        <div>
          <h2 className="text-2xl font-display font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0f62fe]" />
            Squad Board Draft Visualizer
          </h2>
          <p className="text-xs text-gray-400">
            Inspect squad compositions, track available team slots, and drill into overseas allocation matrices.
          </p>
        </div>
      </div>

      {/* Roster cards selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {teams.map(t => (
          <div 
            key={t.id}
            onClick={() => setSelectedTeamId(t.id)}
            className={`cursor-pointer rounded-xl border p-3.5 transition flex flex-col justify-between ${
              selectedTeam.id === t.id 
                ? 'bg-[#0f62fe]/10 border-[#0f62fe] text-white shadow-lg' 
                : 'bg-board-card border-board-border text-gray-400 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <img src={t.logoUrl} alt={t.name} className="w-7 h-7 rounded-md object-cover" />
              <span className="text-xs font-bold whitespace-nowrap overflow-ellipsis overflow-hidden">{t.shortName}</span>
            </div>
            <div>
              <span className="text-[10px] block text-gray-500 font-mono uppercase">Purse Left</span>
              <span className="text-xs font-bold font-mono text-white">{formatMoney(t.maxBudget - t.budgetSpent)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1 & 2: Grid-style layout containing visual slots */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-board-card border border-board-border rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-board-border mb-6">
              Roster Squad Matrices: {selectedTeam.name}
            </h3>

            {/* Categorized drafting grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* BATSMEN ROLE SLOT */}
              <div className="bg-board-dark/60 border border-board-border p-4.5 rounded-xl space-y-3">
                <div className="border-b border-board-border pb-1">
                  <span className="text-xs font-bold text-white uppercase font-sans">🏏 Batsmen</span>
                  <span className="text-[10px] text-gray-500 float-right font-mono font-bold">{teamSquad.filter(p => p.category === 'BATSMAN').length} Drafted</span>
                </div>
                <div className="space-y-2">
                  {teamSquad.filter(p => p.category === 'BATSMAN').map(p => (
                    <div key={p.id} className="p-2 bg-board-card border border-board-border/80 rounded flex items-center gap-1.5 text-xs">
                      <span>{p.isOverseas ? '✈' : '🇮🇳'}</span>
                      <span className="font-semibold text-white tracking-tight">{p.name}</span>
                    </div>
                  ))}
                  {teamSquad.filter(p => p.category === 'BATSMAN').length === 0 && (
                    <span className="text-[11px] text-gray-600 italic block py-2">No batsman drafted yet</span>
                  )}
                </div>
              </div>

              {/* BOWLER ROLE SLOT */}
              <div className="bg-board-dark/60 border border-board-border p-4.5 rounded-xl space-y-3">
                <div className="border-b border-board-border pb-1">
                  <span className="text-xs font-bold text-white uppercase font-sans">🥎 Bowlers</span>
                  <span className="text-[10px] text-gray-500 float-right font-mono font-bold">{teamSquad.filter(p => p.category === 'BOWLER').length} Drafted</span>
                </div>
                <div className="space-y-2">
                  {teamSquad.filter(p => p.category === 'BOWLER').map(p => (
                    <div key={p.id} className="p-2 bg-board-card border border-board-border/80 rounded flex items-center gap-1.5 text-xs">
                      <span>{p.isOverseas ? '✈' : '🇮🇳'}</span>
                      <span className="font-semibold text-white tracking-tight">{p.name}</span>
                    </div>
                  ))}
                  {teamSquad.filter(p => p.category === 'BOWLER').length === 0 && (
                    <span className="text-[11px] text-gray-600 italic block py-2">No bowler drafted yet</span>
                  )}
                </div>
              </div>

              {/* ALL ROUNDERS ROLE SLOT */}
              <div className="bg-board-dark/60 border border-board-border p-4.5 rounded-xl space-y-3">
                <div className="border-b border-board-border pb-1">
                  <span className="text-xs font-bold text-white uppercase font-sans">🌟 All-Round</span>
                  <span className="text-[10px] text-gray-500 float-right font-mono font-bold">{teamSquad.filter(p => p.category === 'ALL_ROUNDER').length} Drafted</span>
                </div>
                <div className="space-y-2">
                  {teamSquad.filter(p => p.category === 'ALL_ROUNDER').map(p => (
                    <div key={p.id} className="p-2 bg-board-card border border-board-border/80 rounded flex items-center gap-1.5 text-xs">
                      <span>{p.isOverseas ? '✈' : '🇮🇳'}</span>
                      <span className="font-semibold text-white tracking-tight">{p.name}</span>
                    </div>
                  ))}
                  {teamSquad.filter(p => p.category === 'ALL_ROUNDER').length === 0 && (
                    <span className="text-[11px] text-gray-600 italic block py-2">No all-rounder drafted yet</span>
                  )}
                </div>
              </div>

              {/* WICKET KEEPERS */}
              <div className="bg-board-dark/60 border border-board-border p-4.5 rounded-xl space-y-3">
                <div className="border-b border-board-border pb-1">
                  <span className="text-xs font-bold text-white uppercase font-sans">🧤 Keepers</span>
                  <span className="text-[10px] text-gray-500 float-right font-mono font-bold">{teamSquad.filter(p => p.category === 'WICKET_KEEPER').length} Drafted</span>
                </div>
                <div className="space-y-2">
                  {teamSquad.filter(p => p.category === 'WICKET_KEEPER').map(p => (
                    <div key={p.id} className="p-2 bg-board-card border border-board-border/80 rounded flex items-center gap-1.5 text-xs">
                      <span>{p.isOverseas ? '✈' : '🇮🇳'}</span>
                      <span className="font-semibold text-white tracking-tight">{p.name}</span>
                    </div>
                  ))}
                  {teamSquad.filter(p => p.category === 'WICKET_KEEPER').length === 0 && (
                    <span className="text-[11px] text-gray-600 italic block py-2">No keeper drafted yet</span>
                  )}
                </div>
              </div>

            </div>

            {/* Overtime or rules briefing footnotes */}
            <div className="mt-8 bg-[#0b0f19] border border-board-border rounded-xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                As per regulatory limits, squads must consist of at least <strong>10 players</strong> and at most <strong>20 players</strong>. Up to <strong>6 overseas players</strong> are allowed in the squad roster. Warnings will trigger upon breach.
              </p>
            </div>

          </div>
        </div>

        {/* Financial health card */}
        <div className="space-y-6">
          <div className="bg-board-card border border-board-border rounded-2xl p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-board-border mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0f62fe]" />
              Roster Audit Index
            </h3>

            <div className="space-y-4">
              
              <div>
                <span className="text-[10px] text-gray-500 block font-mono uppercase">Available Purse balance</span>
                <span className="text-2xl font-display font-bold text-emerald-400 font-mono">
                  {formatMoney(remainingPurse)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-400">
                <div className="bg-board-dark/60 p-3 rounded border border-board-border">
                  <span className="text-[11px] block text-gray-500">Purse Utilized</span>
                  <span className="font-semibold text-white font-mono mt-1 block">{formatMoney(selectedTeam.budgetSpent)}</span>
                </div>
                <div className="bg-board-dark/60 p-3 rounded border border-board-border">
                  <span className="text-[11px] block text-gray-500">Draft Cap Limit</span>
                  <span className="font-semibold text-white font-mono mt-1 block">{formatMoney(selectedTeam.maxBudget)}</span>
                </div>
              </div>

              {/* Roster counts */}
              <div className="space-y-3.5 pt-2 border-t border-board-border">
                <div>
                  <div className="flex justify-between text-xs mb-1 text-gray-400">
                    <span>Squad Size Limit</span>
                    <span className="text-white font-bold">{selectedTeam.squadSize} / 20</span>
                  </div>
                  <div className="bg-board-dark/80 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0f62fe] h-1.5 rounded-full" style={{ width: `${(selectedTeam.squadSize / 20) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 text-gray-400">
                    <span>Overseas Slot Allocation</span>
                    <span className="text-white font-bold">{selectedTeam.overseasCount} / 6</span>
                  </div>
                  <div className="bg-board-dark/80 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0f62fe] h-1.5 rounded-full" style={{ width: `${(selectedTeam.overseasCount / 6) * 100}%` }} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
