import React from 'react';
import { useStore } from '../store';
import { Award, TrendingUp, Users, Activity, Globe, Sparkles, Shield, IndianRupee, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

export const AnalyticsLeaderboardDashboard: React.FC = () => {
  const { teams, players, currencyMode } = useStore();

  const formatMoney = (val: number) => {
    if (currencyMode === 'INR') {
      const cr = val / 10000000;
      if (cr >= 1) return `₹${cr.toFixed(2)} Cr`;
      const lakhs = val / 100000;
      return `₹${lakhs.toFixed(0)} Lakhs`;
    }
    return `${(val / 10000).toFixed(0)} Credits`;
  };

  // 1. Calculate general SaaS KPIs
  const soldPlayers = players.filter(p => p.auctionStatus === 'SOLD');
  const totalSpent = teams.reduce((acc, curr) => acc + curr.budgetSpent, 0);
  const averagePrice = soldPlayers.length > 0 ? totalSpent / soldPlayers.length : 0;
  
  const highestLot = soldPlayers.reduce((max, p) => {
    return (p.soldPrice || 0) > (max.soldPrice || 0) ? p : max;
  }, { name: 'None', soldPrice: 0, imageUrl: '' });

  // 2. Format custom dataset for the purse budget spent chart
  const purseChartData = teams.map(t => {
    const remaining = t.maxBudget - t.budgetSpent;
    return {
      name: t.shortName,
      fullName: t.name,
      Spent: t.budgetSpent,
      Remaining: remaining,
      SpentFormatted: formatMoney(t.budgetSpent),
      RemainingFormatted: formatMoney(remaining)
    };
  });

  // 3. Squad role breakdown datasets
  const squadRoleData = teams.map(t => ({
    name: t.shortName,
    fullName: t.name,
    Batsman: t.filledRoles.batsman || 0,
    Bowler: t.filledRoles.bowler || 0,
    AllRounder: t.filledRoles.allRounder || 0,
    WicketKeeper: t.filledRoles.wicketKeeper || 0
  }));

  // Sort teams based on remaining purse
  const teamsSortedByPurse = [...teams].sort((a,b) => (b.maxBudget - b.budgetSpent) - (a.maxBudget - a.budgetSpent));

  // Category composition across the entire tournament for Pie Chart
  const categoryChartData = [
    { name: 'Batsman', value: players.filter(p => p.category === 'BATSMAN' && p.auctionStatus === 'SOLD').length, color: '#f59e0b' },
    { name: 'Bowler', value: players.filter(p => p.category === 'BOWLER' && p.auctionStatus === 'SOLD').length, color: '#3b82f6' },
    { name: 'All-Rounder', value: players.filter(p => p.category === 'ALL_ROUNDER' && p.auctionStatus === 'SOLD').length, color: '#10b981' },
    { name: 'Wicket-Keeper', value: players.filter(p => p.category === 'WICKET_KEEPER' && p.auctionStatus === 'SOLD').length, color: '#ec4899' }
  ].filter(item => item.value > 0);

  return (
    <div id="analytics-leaderboard-viewport" className="space-y-6">
      
      {/* Dynamic Statistics Deck Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase tracking-wider">Tournament Average Lot Cost</span>
              <p className="text-xl font-display font-black text-amber-500 mt-1 font-mono">{formatMoney(averagePrice)}</p>
              <span className="text-[9px] text-slate-400 block mt-1">Weighted by {soldPlayers.length} sold lots</span>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase tracking-wider">Marquee Draft Highest Lot</span>
              <p className="text-xl font-display font-black text-emerald-400 mt-1 truncate max-w-[160px]">
                {highestLot.soldPrice ? highestLot.name : 'N/A'}
              </p>
              <span className="text-[9px] text-slate-400 block mt-1 font-mono">
                {highestLot.soldPrice ? formatMoney(highestLot.soldPrice) : 'No player sold yet'}
              </span>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase tracking-wider">Total Capital Mobilised</span>
              <p className="text-xl font-display font-black text-blue-400 mt-1 font-mono">{formatMoney(totalSpent)}</p>
              <span className="text-[9px] text-slate-400 block mt-1">Max capacity ₹500 Crores</span>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase tracking-wider">Total Slots Occupied</span>
              <p className="text-xl font-display font-black text-pink-500 mt-1 font-mono">
                {soldPlayers.length} / {teams.length * 20}
              </p>
              <span className="text-[9px] text-slate-400 block mt-1">Avg squad depth {(soldPlayers.length / teams.length).toFixed(1)} slots</span>
            </div>
            <div className="p-2 bg-pink-500/10 rounded-xl border border-pink-500/20 text-pink-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* Visual Analytics Hub with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Purse Distribution Bar Visualizer & Squad stacked chart */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Chart 1: Budget Bar Graph */}
          <div className="bg-[#111118] border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  Budget Purse distribution Matrix
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Compiles Spent capital vs Remaining purse for each registered franchise.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[9px] font-bold">LIVE UPDATE</span>
            </div>

            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={purseChartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" />
                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#050507', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#ffffff', fontFamily: 'Inter', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ fontFamily: 'JetBrains Mono', fontSize: '10px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="Spent" stackId="purse" fill="#e11d48" name="Spent Budget" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Remaining" stackId="purse" fill="#10b981" name="Remaining Budget" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Stacked Squad Composition Bar */}
          <div className="bg-[#111118] border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-400" />
                  Squad Composition stacked series
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Proportion of Batsmen, Bowlers, Wicket-Keepers, and All-Rounders drafted so far.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[9px] font-bold">LIVE UPDATE</span>
            </div>

            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={squadRoleData}
                  margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
                >
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#050507', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#ffffff', fontFamily: 'Inter', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="Batsman" stackId="roles" fill="#f59e0b" name="🏏 Batsmen" />
                  <Bar dataKey="Bowler" stackId="roles" fill="#3b82f6" name="🥎 Bowlers" />
                  <Bar dataKey="AllRounder" stackId="roles" fill="#10b981" name="🌟 All-Rounders" />
                  <Bar dataKey="WicketKeeper" stackId="roles" fill="#ec4899" name="🧤 Keepers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Side: Tabular Purse Leaderboard & Category Pie Distribution */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Purse Scale Leaderboard with Live progress limits */}
          <div className="bg-[#111118] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white pb-2 border-b border-white/10 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              Purse Remaining Leaderboard
            </h3>

            <div className="space-y-4 pt-1">
              {teamsSortedByPurse.map((t, idx) => {
                const remaining = t.maxBudget - t.budgetSpent;
                const remainingPerc = (remaining / t.maxBudget) * 100;
                return (
                  <div key={t.id} className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                        <strong className="text-white font-sans">{t.name}</strong>
                      </div>
                      <span className="text-emerald-400 font-bold">{formatMoney(remaining)}</span>
                    </div>
                    <div className="w-full bg-[#050507] h-2 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${remainingPerc}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Pie Chart */}
          <div className="bg-[#111118] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white pb-2 border-b border-white/10 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-pink-500" />
              Lot Volume Category Distribution
            </h3>

            {categoryChartData.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-12 text-center text-[11px]">No player sales completed to create category index distribution maps.</p>
            ) : (
              <div className="space-y-4">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#050507', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '10px', color: '#fff', fontFamily: 'JetBrains Mono' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend index ledger */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  {categoryChartData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 bg-[#050507] border border-white/5 py-1.5 px-2 rounded-lg">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-slate-400">{entry.name}:</span>
                      <strong className="text-white ml-auto">{entry.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
