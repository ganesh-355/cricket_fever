import React from 'react';
import { useStore } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import { Shield, AlertTriangle, Coins, TrendingUp, Users, Smartphone, Clock } from 'lucide-react';

export const LiveBiddingDashboard: React.FC = () => {
  const { 
    teams, 
    userTeamId, 
    setUserTeamId,
    activeAuction, 
    placeBid, 
    bidHistory,
    currencyMode,
    addSystemLog
  } = useStore();

  const { sendMessage } = useWebSocket();

  const myTeam = teams.find(t => t.id === userTeamId);

  const formatMoney = (val: number) => {
    if (currencyMode === 'INR') {
      const cr = val / 10000000;
      if (cr >= 1) return `₹${cr.toFixed(2)} Cr`;
      const lakhs = val / 100000;
      return `₹${lakhs.toFixed(0)} Lakhs`;
    }
    return `${(val / 10000).toFixed(0)} Credits`;
  };

  const handleQuickBid = () => {
    if (!myTeam || !activeAuction) return;
    
    // Calculate standard increment
    const nextAmount = activeAuction.highestBidderTeamId 
      ? activeAuction.currentBid + activeAuction.minIncrement 
      : activeAuction.player.basePrice;

    const res = placeBid(myTeam.id, nextAmount);
    if (!res.success) {
      addSystemLog(`FRANCHISE ALERT: ${res.message}`, 'WARNING');
    } else {
      // Stream bid over live web socket channel
      sendMessage(JSON.stringify({
        event: 'BID_SUBMITTED',
        franchise: myTeam.name,
        short: myTeam.shortName,
        bidValue: nextAmount,
        targetPlayer: activeAuction.player.name,
        timestamp: new Date().toLocaleTimeString()
      }));
    }
  };

  const remainingBudget = myTeam ? myTeam.maxBudget - myTeam.budgetSpent : 0;
  const overseasSpentPerc = myTeam ? (myTeam.overseasCount / 6) * 100 : 0;
  const squadSizePerc = myTeam ? (myTeam.squadSize / 20) * 100 : 0;

  return (
    <div id="live-bidding-dashboard" className="space-y-6">
      
      {/* Team selection fast trigger */}
      <div className="bg-[#0b101d] border border-board-border p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span className="text-[10px] text-gray-500 font-mono font-bold block uppercase">Active Franchise Control node</span>
          <h3 className="text-sm font-semibold text-white">
            {myTeam ? `Selected Team: ${myTeam.name} (${myTeam.shortName})` : 'No franchisee assigned.'}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Switch represent:</span>
          <select 
            id="bidder-team-selector"
            value={userTeamId || ''} 
            onChange={(e) => setUserTeamId(e.target.value || null)}
            className="bg-black border border-board-border text-yellow-550 font-mono text-xs rounded px-2.5 py-1.5 text-yellow-400"
          >
            <option value="">-- View all teams --</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
            ))}
          </select>
        </div>
      </div>

      {!myTeam ? (
        <div className="bg-board-card border border-board-border p-8 rounded-2xl text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="font-display font-bold text-white tracking-tight">Access Restricted</h3>
          <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">Please assign or switch your Represent Franchise using the select box above to submit actual bid transactions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main bidder interaction panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Massive Gavel display for active bid */}
            <div className="bg-board-card border border-board-border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-red-950/40 text-red-400 px-2 py-0.5 border border-red-500/20 rounded font-mono font-bold uppercase tracking-wider">
                    ⚡ Live Bid Room Terminal
                  </span>
                  <p className="text-xs text-gray-400 mt-2">Click to register quick paddle triggers</p>
                </div>

                {activeAuction && (
                  <div className="px-3 py-1.5 bg-[#0f62fe]/10 border border-[#0f62fe]/30 rounded-lg flex items-center gap-2 text-white">
                    <Clock className="w-4 h-4 animate-spin text-[#0f62fe]" />
                    <span className="font-mono font-bold text-sm tracking-widest">{activeAuction.timerSeconds}s Remaining</span>
                  </div>
                )}
              </div>

              {activeAuction ? (
                <div className="my-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={activeAuction.player.imageUrl} 
                      alt={activeAuction.player.name} 
                      className="w-16 h-16 rounded-xl object-cover border border-board-border"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-xs text-[#0f62fe] font-semibold">{activeAuction.player.category}</span>
                      <h4 className="text-2xl font-display font-black text-white">{activeAuction.player.name}</h4>
                      <p className="text-xs text-gray-400">{activeAuction.player.isOverseas ? '✈ Overseas Player' : '🇮🇳 Domestic Roster'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-board-dark/80 p-4 rounded-xl border border-board-border">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase">Current Winning Bid</span>
                      <span className="text-xl font-display font-black text-white font-mono">
                        {formatMoney(activeAuction.currentBid)}
                      </span>
                      {activeAuction.currentBidderTeamId ? (
                        <span className="text-[10px] text-gray-400 block mt-1">
                          Held by: <strong className="text-white">{teams.find(t => t.id === activeAuction.currentBidderTeamId)?.name || 'An franchise'}</strong>
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-400 block mt-1">No bids submitted yet</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase">Next Required Paddle Valuation</span>
                      <span className="text-xl font-display font-black text-white font-mono">
                        {formatMoney(activeAuction.highestBidderTeamId ? activeAuction.currentBid + activeAuction.minIncrement : activeAuction.player.basePrice)}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-1">Standard increment: +{formatMoney(activeAuction.minIncrement)}</span>
                    </div>
                  </div>

                  {/* GIANT PADDLE TRIGGERS */}
                  <div className="mt-6 flex flex-col gap-3">
                    <button
                      id="place-bid-primary-paddle"
                      onClick={handleQuickBid}
                      className="w-full py-4 bg-[#0f62fe] hover:bg-[#0d52d4] text-white text-sm font-black uppercase tracking-widest rounded-2xl transition duration-150 transform active:scale-[0.98] shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2"
                    >
                      <Coins className="w-5 h-5" />
                      SUBMIT BID TRIGGER PADDLE: {formatMoney(activeAuction.highestBidderTeamId ? activeAuction.currentBid + activeAuction.minIncrement : activeAuction.player.basePrice)}
                    </button>
                    <span className="text-[10px] text-gray-500 text-center font-mono">
                      PRESS [SPACEBAR] OR [B] KEY TARGET SHORTCUT TO TRIGGER PADDLE NUMBER IN IFRAME ACTIVE TERMINAL
                    </span>
                  </div>

                </div>
              ) : (
                <div className="py-12 text-center my-auto">
                  <p className="text-gray-500 text-sm">Please wait... The Gavel Moderator has not opened any live lot draft yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Navigate to the "Moderator Room" tab to start a draft sequence if you are testing.</p>
                </div>
              )}

            </div>

            {/* Franchise warnings block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-board-card/80 border border-board-border p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Overseas Limits Monitor</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Maximum overseas count of 6 slots. Your current roster count: <strong>{myTeam.overseasCount} / 6</strong>.</p>
                  <div className="w-full bg-board-dark h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#0f62fe] h-1.5 rounded-full" style={{ width: `${overseasSpentPerc}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-board-card/80 border border-board-border p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Roster Slots Capacity</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Min 10 / Max 20 squads. Current drafting size: <strong>{myTeam.squadSize} slots</strong>.</p>
                  <div className="w-full bg-board-dark h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${squadSizePerc}%` }} />
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Financial breakdown and remaining purse */}
          <div className="space-y-6">
            
            <div className="bg-board-card border border-board-border rounded-xl p-5">
              <h3 className="font-display font-bold text-white text-sm pb-2 border-b border-board-border mb-4">
                Franchise Purse & Ledger
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-gray-400 font-mono block uppercase">Allocated Purse Limit</span>
                  <span className="text-2xl font-display font-bold text-white font-mono">{formatMoney(myTeam.maxBudget)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-board-dark/60 p-3 rounded border border-board-border">
                    <span className="text-[10px] text-red-400 block uppercase font-mono">Expenses Spent</span>
                    <span className="text-xs font-bold text-white font-mono">{formatMoney(myTeam.budgetSpent)}</span>
                  </div>
                  <div className="bg-board-dark/60 p-3 rounded border border-board-border">
                    <span className="text-[10px] text-emerald-400 block uppercase font-mono">purse Remaining</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{formatMoney(remainingBudget)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 block mb-2 uppercase">Roster categories count</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="flex justify-between p-2 bg-board-dark/40 rounded border border-board-border/40">
                      <span className="text-gray-400">🏏 Batsmen</span>
                      <span className="font-bold text-white">{myTeam.filledRoles.batsman}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-board-dark/40 rounded border border-board-border/40">
                      <span className="text-gray-400">🥎 Bowlers</span>
                      <span className="font-bold text-white">{myTeam.filledRoles.bowler}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-board-dark/40 rounded border border-board-border/40">
                      <span className="text-gray-400">🌟 All-Round</span>
                      <span className="font-bold text-white">{myTeam.filledRoles.allRounder}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-board-dark/40 rounded border border-board-border/40">
                      <span className="text-gray-400">🧤 Keepers</span>
                      <span className="font-bold text-white">{myTeam.filledRoles.wicketKeeper}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Live activity logs */}
            <div className="bg-board-card border border-board-border rounded-xl p-5">
              <h3 className="font-display font-medium text-white text-sm mb-3">Recent bids ledger</h3>
              {bidHistory.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[10px]">
                  {bidHistory.slice(0, 5).map(b => (
                    <div key={b.id} className="flex justify-between text-gray-400 border-b border-board-border/40 pb-1">
                      <span>{b.teamName}</span>
                      <span className="text-[#0f62fe] font-bold">{formatMoney(b.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-500">Waiting for live lot bidding triggers...</p>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
