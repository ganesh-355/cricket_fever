import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { UserRole } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';
import { 
  Tv, 
  Settings, 
  Compass, 
  Users, 
  UserSquare, 
  TrendingUp, 
  Wifi, 
  Database,
  Coins,
  Shield,
  HelpCircle,
  Brain,
  Home,
  Menu,
  X,
  Hammer
} from 'lucide-react';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { 
    userRole, 
    setRole, 
    currencyMode, 
    setCurrencyMode,
    webSocketStatus,
    setWebSocketStatus,
    activeAuction,
    logs,
    passTimer
  } = useStore();

  const { connect, disconnect } = useWebSocket();

  const [simulatetTime, setSimulateTime] = useState(new Date().toLocaleTimeString());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Local ticker message selector
  const [tickerMsg, setTickerMsg] = useState('LIVE SEED AUCTION ENGINES ONLINE. READY FOR BIDDING.');

  useEffect(() => {
    const timer = setInterval(() => {
      setSimulateTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer loop for active auction lot countdown
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeAuction && (activeAuction.status === 'BIDDING' || activeAuction.status === 'FAIR_PLAY_OVERTIME')) {
        passTimer();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeAuction, passTimer]);

  // Update ticker message dynamically based on recent system logs
  useEffect(() => {
    if (logs.length > 0) {
      // Find the latest sold or bid message
      const urgentMessage = logs.find(l => l.type === 'ALERT' || l.type === 'SUCCESS' || l.type === 'WARNING');
      if (urgentMessage) {
        setTickerMsg(`${urgentMessage.timestamp} [${urgentMessage.type}] >> ${urgentMessage.message.toUpperCase()}`);
      } else {
        setTickerMsg(`${logs[0].timestamp} >> ${logs[0].message.toUpperCase()}`);
      }
    }
  }, [logs]);

  const modeExplanation = currencyMode === 'INR' 
    ? 'Standard Lakhs/Crores (₹1 Cr = 10,000,000 / 100 L)' 
    : 'Virtual Credits mode (Equidistant balance parsing)';

  return (
    <div id="saas-auction-root" className="min-h-screen bg-gradient-to-b from-[#111115] via-[#09090b] to-black text-gray-100 flex flex-col font-sans relative selection:bg-[#0f62fe] selection:text-white">
      
      {/* 🍔 HAMBURGER SIDEBAR OVERLAY DRAWER */}
      {isSidebarOpen && (
        <div id="layout-sidebar-overlay" className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Backdrop Blur overlay */}
          <div 
            id="layout-sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Actual menu panel (Sliding from LEFT) */}
          <div 
            id="layout-sidebar-panel"
            className="absolute top-0 left-0 h-full w-80 bg-[#111118]/95 border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300"
          >
            {/* Top header block */}
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div onClick={() => { setIsSidebarOpen(false); navigate('/'); }} className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-lg font-black tracking-tight text-white">Cricket</span>
                  <span className="text-lg font-normal text-[#0f62fe]">Fever</span>
                </div>
                <button 
                  id="layout-sidebar-close"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Menu List */}
              <div className="space-y-4">
                <span className="block text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                  Menu Options &amp; Navigation
                </span>

                <nav className="flex flex-col gap-2">
                  <NavLink
                    to="/"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      isActive 
                        ? 'bg-[#0f62fe] text-white shadow-lg' 
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Home className="w-4 h-4 shrink-0" />
                    <span>Home</span>
                  </NavLink>

                  <NavLink
                    to="/spectator"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      isActive 
                        ? 'bg-[#0f62fe] text-white shadow-lg' 
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Tv className="w-4 h-4 shrink-0" />
                    <span>Live Broadcast</span>
                  </NavLink>

                  <NavLink
                    to="/players"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      isActive 
                        ? 'bg-[#0f62fe] text-white shadow-lg' 
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Compass className="w-4 h-4 shrink-0" />
                    <span>Player Discovery</span>
                  </NavLink>

                  <NavLink
                    to="/squads"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      isActive 
                        ? 'bg-[#0f62fe] text-white shadow-lg' 
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    <span>Squads</span>
                  </NavLink>

                  <NavLink
                    to="/leaderboard"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      isActive 
                        ? 'bg-[#0f62fe] text-white shadow-lg' 
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 shrink-0" />
                    <span>Leaderboards</span>
                  </NavLink>

                  <NavLink
                    to="/bid"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      isActive 
                        ? 'bg-[#0f62fe] text-white shadow-lg' 
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Coins className="w-4 h-4 shrink-0" />
                    <span>War Room</span>
                  </NavLink>

                  <NavLink
                    to="/register-auction"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      isActive 
                        ? 'bg-[#0f62fe] text-white shadow-lg' 
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Hammer className="w-4 h-4 shrink-0" />
                    <span>Host Tournament</span>
                  </NavLink>

                  {(userRole === UserRole.AUCTION_ADMIN || userRole === UserRole.PLATFORM_ADMIN) && (
                    <NavLink
                      to="/admin"
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) => `flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                        isActive 
                          ? 'bg-[#0f62fe] text-white shadow-lg' 
                          : 'text-[#0f62fe] hover:text-blue-300 hover:bg-white/5 border border-transparent font-medium'
                      }`}
                    >
                      <Shield className="w-4 h-4 shrink-0" />
                      <span>Admin Dashboard</span>
                    </NavLink>
                  )}
                </nav>
              </div>
            </div>

            {/* Bottom credential profiles or branding info */}
            <div className="pt-4 border-t border-white/5 space-y-4 font-sans">
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/5">
                <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono">Platform Identity</span>
                <span className="inline-block text-[9px] text-yellow-400 bg-yellow-400/15 border border-yellow-400/20 px-2.5 py-0.5 rounded-full mt-2 font-mono uppercase font-bold">
                  {userRole}
                </span>
              </div>

              <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest block font-mono">
                © CricketFever Systems
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🧭 NAVIGATION HEADER CONTAINER (Seamless, Borderless, Dark) */}
      <header className="bg-transparent py-5 px-6 md:px-12 max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 select-none z-20">
        
        {/* Left Side: Hamburger & Brand Logo (Exactly as in Lobby/Landing Page) */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            id="layout-hamburger-button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-slate-400 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
            title="Open Menu Options"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <div onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-1">
            <span className="text-xl font-black tracking-tight text-white">Cricket</span>
            <span className="text-xl font-normal text-[#0f62fe]">Fever</span>
          </div>
          {activeAuction && (
            <span className="text-[9px] font-bold uppercase tracking-wider bg-[#0f62fe]/10 text-[#0f62fe] px-2 py-0.5 rounded border border-[#0f62fe]/20">
              Live Arena
            </span>
          )}
        </div>

        {/* Right Side: Sleek Controls Overlay */}
        <div className="flex items-center flex-wrap gap-3 shrink-0">
          
          {/* Currency Toggle */}
          <div className="bg-[#111118]/85 border border-white/5 p-1 rounded-xl flex items-center gap-1" title={modeExplanation}>
            <button
              id="currency-toggle-inr"
              onClick={() => setCurrencyMode('INR')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-tight ${
                currencyMode === 'INR' 
                  ? 'bg-[#0f62fe] text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ₹ INR
            </button>
            <button
              id="currency-toggle-credits"
              onClick={() => setCurrencyMode('CREDITS')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-tight ${
                currencyMode === 'CREDITS' 
                  ? 'bg-[#0f62fe] text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Points Mode
            </button>
          </div>

          {/* WebSocket Status Indicator */}
          <button
            id="ws-status-button"
            onClick={() => {
              if (webSocketStatus === 'CONNECTED') {
                disconnect();
              } else {
                connect();
              }
            }}
            title="Click to toggle real-time connection"
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold flex items-center gap-1.5 transition uppercase duration-200 ${
              webSocketStatus === 'CONNECTED'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-00'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${webSocketStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {webSocketStatus === 'CONNECTED' ? 'LIVE' : 'AUTO'}
          </button>

          {/* Tester Role Switcher */}
          <div className="bg-[#111118]/85 border border-white/5 p-1 rounded-xl">
            <select
              id="global-role-dropdown"
              value={userRole}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-[#0c0c0e] border border-white/10 text-white font-sans text-[10px] rounded focus:outline-none focus:border-[#0f62fe] cursor-pointer font-bold uppercase tracking-tight py-1 px-2.5"
            >
              <option value={UserRole.SPECTATOR}>Spectator View</option>
              <option value={UserRole.TEAM_MANAGER}>Franchise Board</option>
              <option value={UserRole.AUCTION_ADMIN}>Moderation Center</option>
              <option value={UserRole.PLATFORM_ADMIN}>Super Admin</option>
            </select>
          </div>

        </div>
      </header>

      {/* 🔮 MAIN STYLED VIEWPORT */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 md:px-12 py-6 relative z-10">
        {children}
      </main>

      {/* 🎥 LOWER INTEGRATED SEAMLESS FOOTER BAR (Blended seamlessly, 0 borders) */}
      <footer className="bg-transparent py-6 px-6 md:px-12 max-w-7xl w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs tracking-tight select-none">
        
        {/* Left Side: Trademark */}
        <div className="text-white font-bold font-sans">
          CricketFever
        </div>

        {/* Center: Integrated Real-Time Live Ticker */}
        <div className="max-w-xl flex-1 mx-4 overflow-hidden hidden lg:block text-slate-400 font-mono text-[10px] uppercase text-center relative py-1.5 bg-white/5 rounded-full px-6 border border-white/5">
          <span className="text-[#0f62fe] font-black mr-2">LIVE LOGS &gt;&gt;</span>
          {tickerMsg}
        </div>

        {/* Right Side: Links */}
        <div className="flex items-center gap-6 text-slate-400 font-medium font-sans">
          <button className="hover:text-[#0f62fe] transition uppercase text-[10px] tracking-wider">Privacy</button>
          <button className="hover:text-[#0f62fe] transition uppercase text-[10px] tracking-wider">Terms</button>
          <button className="hover:text-[#0f62fe] transition uppercase text-[10px] tracking-wider">Contact</button>
        </div>
      </footer>
    </div>
  );
};
