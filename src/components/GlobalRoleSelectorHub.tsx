import React, { useState } from 'react';
import { useStore } from '../store';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Users, 
  Tv, 
  Gavel, 
  Settings, 
  ChevronRight, 
  X, 
  Check, 
  Shield, 
  UserCheck, 
  Sparkles,
  Info
} from 'lucide-react';

export const RoleSwitcherHub: React.FC = () => {
  const { 
    userRole, 
    setRole, 
    userName, 
    setUserName, 
    userTeamId, 
    setUserTeamId, 
    teams,
    isAuthenticated,
    setAuthenticated,
    addSystemLog
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  // Quick helper to fetch color accents per role
  const getRoleTheme = (role: UserRole) => {
    switch (role) {
      case UserRole.PLATFORM_ADMIN:
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/35',
          text: 'text-indigo-400',
          accent: 'bg-indigo-500',
          hoverBg: 'hover:bg-indigo-500/20',
          pulse: 'shadow-indigo-500/30'
        };
      case UserRole.AUCTION_ADMIN:
        return {
          bg: 'bg-amber-500/10 border-amber-500/35',
          text: 'text-amber-400',
          accent: 'bg-amber-500',
          hoverBg: 'hover:bg-amber-500/20',
          pulse: 'shadow-amber-500/30'
        };
      case UserRole.TEAM_MANAGER:
        return {
          bg: 'bg-pink-500/10 border-pink-500/35',
          text: 'text-pink-400',
          accent: 'bg-pink-500',
          hoverBg: 'hover:bg-pink-500/20',
          pulse: 'shadow-pink-500/30'
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/35',
          text: 'text-slate-400',
          accent: 'bg-slate-500',
          hoverBg: 'hover:bg-slate-500/20',
          pulse: 'shadow-slate-500/30'
        };
    }
  };

  const activeTheme = getRoleTheme(userRole);

  const handleRoleTransition = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setAuthenticated(true);
    addSystemLog(`RBAC ELEVATION: User reclassified as [${selectedRole}]`, 'SUCCESS');
  };

  const activeTeam = teams.find(t => t.id === userTeamId);

  return (
    <>
      {/* 🚀 FIXED FLOATING HUD TRIGGER PILL (Sits beautifully in bottom-right corner) */}
      <div 
        id="rbac-session-floating-hud"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 select-none"
      >
        <button
          type="button"
          id="toggle-rbac-hub-hud"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4.5 py-2.5 bg-[#111118]/95 border border-white/10 hover:border-white/20 rounded-full text-xs font-mono font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer`}
        >
          {/* Pulsing indicator corresponding to clearance level */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeTheme.accent}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeTheme.accent}`} />
          </span>

          <span className="text-slate-400 font-light translate-y-[-0.5px]">Clearance:</span>
          <span className={`${activeTheme.text} font-black uppercase tracking-tight`}>
            {userRole.replace('_', ' ')}
          </span>
        </button>
      </div>

      {/* 🔮 IMMERSIVE ROLE CONTROL CENTER DRAWER OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <div 
            id="rbac-config-drawer-overlay"
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-end select-none"
          >
            {/* Click backdrop to exit */}
            <div 
              id="rbac-config-drawer-dismiss-space"
              onClick={() => setIsOpen(false)} 
              className="absolute inset-0"
            />

            {/* Content Panel slide in from Right */}
            <motion.div
              id="rbac-config-drawer-panel"
              initial={{ x: '100%', opacity: 0.95 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.95 }}
              transition={{ type: 'spring', damping: 24, stiffness: 140 }}
              className="relative w-full max-w-md h-full bg-[#11111a] border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0f62fe]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-6">
                
                {/* Drawer Header block */}
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#0f62fe] font-mono font-bold uppercase tracking-widest block">
                      Security &amp; RBAC Control Panel
                    </span>
                    <h3 className="text-base font-display font-black text-white tracking-tight uppercase">
                      Select Active Clearance Role
                    </h3>
                  </div>
                  <button
                    id="close-rbac-hub-drawer"
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Micro info advice banner */}
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-start gap-2.5">
                  <Info className="w-4.5 h-4.5 text-[#0f62fe] shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    Switching roles instantly updates authorization scopes across the entire workspace. Use this to simulate different user experiences: Team Manager, Auction Moderator, or Super Admin context.
                  </p>
                </div>

                {/* CURRENT ACTIVE SECURITY CLEARANCE PREVIEW */}
                <div className="bg-black/60 border border-white/10 p-4 rounded-2xl relative">
                  <span className="block text-[8px] text-slate-500 uppercase font-mono tracking-wider">Active Authorized Account</span>
                  
                  <div className="flex justify-between items-center mt-2.5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-white ${activeTheme.bg}`}>
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-tight font-mono">{userName}</h4>
                        <span className="block text-[9px] text-[#0f62fe] uppercase font-mono mt-0.5 tracking-wide">
                          Status: Active Sandbox Auth Flow ✅
                        </span>
                      </div>
                    </div>

                    <span className="inline-block text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                      {userRole}
                    </span>
                  </div>

                  {userRole === UserRole.TEAM_MANAGER && (
                    <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-sans">
                      <span className="text-slate-400">Represented franchise board:</span>
                      <strong className="text-white flex items-center gap-1.5">
                        {activeTeam ? (
                          <>
                            <img src={activeTeam.logoUrl} alt={activeTeam.name} referrerPolicy="no-referrer" className="w-4 h-4 rounded-sm object-cover" />
                            {activeTeam.name} ({activeTeam.shortName})
                          </>
                        ) : 'None Selected'}
                      </strong>
                    </div>
                  )}
                </div>

                {/* ROLE CHOOSING DIRECTORY CARDS (Consistent prompts anywhere) */}
                <div className="space-y-3">
                  <span className="block text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider mb-2.5">
                    Clearance Selector Nodes
                  </span>

                  {/* Node 1: SUPER PLATFORM ADMIN */}
                  <div 
                    id="clearance-node-platform-admin"
                    onClick={() => handleRoleTransition(UserRole.PLATFORM_ADMIN)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex justify-between items-start ${
                      userRole === UserRole.PLATFORM_ADMIN 
                        ? 'bg-indigo-500/10 border-indigo-500/50' 
                        : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${userRole === UserRole.PLATFORM_ADMIN ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white uppercase tracking-tight">Super Platform Admin</h4>
                          <span className="text-[7.5px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 rounded uppercase font-mono">Platform level</span>
                        </div>
                        <p className="text-[9.5px] text-slate-400 leading-normal font-sans">
                          Aprove / reject tournament requests, customize financial limits, adjust base increments, registered squad sizes.
                        </p>
                      </div>
                    </div>
                    {userRole === UserRole.PLATFORM_ADMIN && <Check className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />}
                  </div>

                  {/* Node 2: AUCTION MODERATOR ADMIN */}
                  <div 
                    id="clearance-node-auction-admin"
                    onClick={() => handleRoleTransition(UserRole.AUCTION_ADMIN)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex justify-between items-start ${
                      userRole === UserRole.AUCTION_ADMIN 
                        ? 'bg-amber-500/10 border-amber-500/50' 
                        : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${userRole === UserRole.AUCTION_ADMIN ? 'bg-amber-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                        <Gavel className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white uppercase tracking-tight">Auction Moderator</h4>
                          <span className="text-[7.5px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded uppercase font-mono">Moderator level</span>
                        </div>
                        <p className="text-[9.5px] text-slate-400 leading-normal font-sans">
                          Control countdown clocks, start bidding sessions, hammer lots sold or unsold, trigger active simulation bot bids.
                        </p>
                      </div>
                    </div>
                    {userRole === UserRole.AUCTION_ADMIN && <Check className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />}
                  </div>

                  {/* Node 3: FRANCHISE MANAGER BOARD */}
                  <div 
                    id="clearance-node-team-manager"
                    onClick={() => handleRoleTransition(UserRole.TEAM_MANAGER)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex justify-between items-start ${
                      userRole === UserRole.TEAM_MANAGER 
                        ? 'bg-pink-500/10 border-pink-500/50' 
                        : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${userRole === UserRole.TEAM_MANAGER ? 'bg-pink-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white uppercase tracking-tight">Franchise Board</h4>
                          <span className="text-[7.5px] bg-pink-500/20 text-pink-400 px-1.5 py-0.2 rounded uppercase font-mono">Franchise level</span>
                        </div>
                        <p className="text-[9.5px] text-slate-400 leading-normal font-sans">
                          Participate in active bidding inside War Room, place premium specific valuations, track real-time franchise purse levels.
                        </p>
                      </div>
                    </div>
                    {userRole === UserRole.TEAM_MANAGER && <Check className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />}
                  </div>

                  {/* Node 4: BROADCAST SPECTATOR */}
                  <div 
                    id="clearance-node-spectator"
                    onClick={() => handleRoleTransition(UserRole.SPECTATOR)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex justify-between items-start ${
                      userRole === UserRole.SPECTATOR 
                        ? 'bg-slate-500/10 border-slate-500/50 border-emerald-400/30' 
                        : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${userRole === UserRole.SPECTATOR ? 'bg-slate-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                        <Tv className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white uppercase tracking-tight">Global Broadcast Spectator</h4>
                          <span className="text-[7.5px] bg-slate-500/20 text-slate-400 px-1.5 py-0.2 rounded uppercase font-mono">Public level</span>
                        </div>
                        <p className="text-[9.5px] text-slate-400 leading-normal font-sans">
                          Watch the active live auction room ledger, discover players registry stats, browse current draft roster results.
                        </p>
                      </div>
                    </div>
                    {userRole === UserRole.SPECTATOR && <Check className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />}
                  </div>

                </div>

                {/* SUB DIAGNOSTIC FOR TEAM_MANAGER SPECIAL REPRESENT SELECTION */}
                {userRole === UserRole.TEAM_MANAGER && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-pink-500/5 border border-pink-500/15 rounded-2xl space-y-3 font-sans"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-pink-400" />
                      <span className="text-[10px] text-pink-400 font-mono font-bold uppercase tracking-wider block">
                        Select Active Franchise to Bid As
                      </span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 leading-relaxed font-light">
                      Choose which brand franchise board is linking commands on your tactical screen. Each team has a separate remaining budget cap.
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {teams.map(t => {
                        const isSelected = t.id === userTeamId;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setUserTeamId(t.id)}
                            className={`p-2 rounded-lg border text-[10px] font-bold uppercase tracking-tight transition flex items-center gap-2 cursor-pointer ${
                              isSelected 
                                ? 'bg-pink-500/15 border-pink-500/40 text-white' 
                                : 'bg-black/40 hover:bg-black/60 border-white/5 text-slate-350 hover:text-white'
                            }`}
                          >
                            <img src={t.logoUrl} alt={t.name} referrerPolicy="no-referrer" className="w-4.5 h-4.5 object-cover rounded shrink-0 border border-white/5" />
                            <span className="truncate">{t.shortName}</span>
                            {isSelected && <span className="w-1.5 h-1.5 bg-pink-400 rounded-full shrink-0 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Footer and Security Signature */}
              <div className="pt-4 border-t border-white/5 space-y-1.5 font-sans text-center text-[9px] text-slate-600 block font-mono">
                <span>AUTHENTICATION ENGINE V3.4 (RBAC STABILIZED)</span>
                <p>© CRICKETFEVER CO.</p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
