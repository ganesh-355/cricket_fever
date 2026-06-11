import React, { useState } from 'react';
import { useStore } from '../store';
import { UserRole } from '../types';
import { 
  Lock, 
  Unlock, 
  Mail, 
  KeySquare, 
  LogOut, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  ArrowRight,
  Shield,
  Hammer,
  Play,
  Menu,
  X,
  Compass,
  Users,
  TrendingUp,
  Coins,
  Tv
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Secure Testing Credentials (Provided in final response only, hidden from page UI)
const TEST_USERS = [
  {
    email: 'admin@saasauction.com',
    password: 'AdminPassword123',
    name: 'Chief Platform Administrator',
    role: UserRole.PLATFORM_ADMIN,
    teamId: null
  },
  {
    email: 'moderator@saasauction.com',
    password: 'ModeratorPassword123',
    name: 'Lead Gavel Moderator',
    role: UserRole.AUCTION_ADMIN,
    teamId: null
  },
  {
    email: 'mumbai.manager@saasauction.com',
    password: 'MumbaiPassword123',
    name: 'Mumbai Franchise Director',
    role: UserRole.TEAM_MANAGER,
    teamId: 'team-1' // Mumbai Franchise
  },
  {
    email: 'chennai.manager@saasauction.com',
    password: 'ChennaiPassword123',
    name: 'Chennai Franchise Director',
    role: UserRole.TEAM_MANAGER,
    teamId: 'team-2' // Chennai Super Kings Franchise
  },
  {
    email: 'spectator@saasauction.com',
    password: 'SpectatorPassword123',
    name: 'Global Broadcast Spectator',
    role: UserRole.SPECTATOR,
    teamId: null
  }
];

export const Home: React.FC = () => {
  const { 
    userRole, 
    setRole, 
    userName, 
    setUserName, 
    userTeamId, 
    setUserTeamId, 
    teams,
    isAuthenticated,
    setAuthenticated
  } = useStore();
  
  const navigate = useNavigate();

  // Dialog, Sidebar & Form states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Registration Sandbox fields
  const [regName, setRegName] = useState('');
  const [regCategory, setRegCategory] = useState('BATSMAN');
  const [regSuccess, setRegSuccess] = useState(false);

  const [loggedInEmail, setLoggedInEmail] = useState(() => localStorage.getItem('logged_in_email') || '');

  // Main navigation helper depending on active role of logged-in user
  const handleEnterArena = () => {
    if (!isAuthenticated) {
      setIsModalOpen(true);
      return;
    }
    
    if (userRole === UserRole.PLATFORM_ADMIN || userRole === UserRole.AUCTION_ADMIN) {
      navigate('/admin');
    } else if (userRole === UserRole.TEAM_MANAGER) {
      navigate('/bid');
    } else {
      navigate('/spectator');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const matchedUser = TEST_USERS.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (matchedUser) {
      setRole(matchedUser.role);
      setUserName(matchedUser.name);
      setUserTeamId(matchedUser.teamId);
      setAuthenticated(true);
      setLoggedInEmail(matchedUser.email);
      localStorage.setItem('logged_in_email', matchedUser.email);

      // Reset
      setIsModalOpen(false);
      setEmail('');
      setPassword('');
    } else {
      setErrorMsg('Unauthorized credentials. Check the active response text for test accounts.');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setRole(UserRole.SPECTATOR);
    setUserName('Guest Spectator');
    setUserTeamId(null);
    setLoggedInEmail('');
    localStorage.removeItem('logged_in_email');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setIsRegisterModalOpen(false);
      setRegName('');
    }, 2200);
  };

  return (
    <div id="lobby-viewport" className="min-h-screen bg-gradient-to-b from-[#111115] via-[#09090b] to-black flex flex-col justify-between font-sans">
      
      {/* 🧭 NAVIGATION HEADER BAR (Matches image screenshot design exactly, black themed, seamless borderless) */}
      <header className="bg-transparent py-4.5 px-6 md:px-12 flex items-center justify-between gap-4 select-none">
        
        {/* Left Side: Brand Logo and Hamburger menu */}
        <div className="flex items-center gap-4">
          <button
            id="hamburger-menu-toggle"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-slate-400 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
            title="Open Menu Options"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>

          <div onClick={() => navigate('/')} className="cursor-pointer flex items-center">
            <span className="text-xl font-black tracking-tight text-white">Cricket</span>
            <span className="text-xl font-normal text-[#0f62fe]">Fever</span>
          </div>
        </div>

        {/* Right Side: Rectangular CTA Login Button */}
        <div className="flex items-center gap-3.5">
          {!isAuthenticated ? (
            <button
              id="header-login-btn"
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-[#0f62fe] hover:bg-[#0d52d4] text-white text-xs font-bold uppercase tracking-widest rounded transition cursor-pointer"
            >
              Login/Signup
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium font-mono hidden md:inline">
                ({userName})
              </span>
              <button
                id="header-logout-btn"
                onClick={handleLogout}
                className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold uppercase tracking-wider rounded transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

      </header>

      {/* 🏟️ MAIN HERO AREA (Dark stadium design matches image screenshot perfectly) */}
      <main className="flex-1 bg-transparent relative flex flex-col justify-center px-6 sm:px-12 md:px-24 py-16 overflow-hidden">
        
        {/* Glowing cosmic floodlight arcs in corner background */}
        <div className="absolute right-0 bottom-0 top-0 w-full md:w-3/5 bg-[radial-gradient(circle_at_75%_35%,rgba(15,98,254,0.14),transparent_65%)] pointer-events-none" />
        <div className="absolute left-10 top-1/4 w-72 h-72 bg-blue-900/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl z-10 space-y-6">
          
          <span className="text-xs font-bold text-[#0f62fe] uppercase tracking-widest block">
            The arena is yours.
          </span>

          <h2 className="text-5xl md:text-7xl font-sans font-medium text-white tracking-tight leading-tight select-none">
            Where Legends are <br /> Drafted.
          </h2>

          <p className="text-base sm:text-lg text-slate-400 font-light max-w-lg leading-relaxed pt-1">
            Precision Drafting. Pro-Level Intensity.
          </p>

          {/* Quick micro status indicator for logged-in user profile, adding real utility */}
          {isAuthenticated && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded max-w-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Logged In as {userName} [Role: {userRole}]</span>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-4">
            
            {/* Primary Action */}
            <button
              id="hero-find-tournament-btn"
              onClick={handleEnterArena}
              className="px-8 py-3.5 bg-[#0f62fe] hover:bg-[#0d52d4] text-white text-xs font-bold uppercase tracking-widest rounded inline-flex items-center gap-2 transition cursor-pointer shadow-lg shadow-blue-950/20 active:scale-95"
            >
              Find a Tournament
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            {/* Secondary Action */}
            <button
              id="hero-register-player-btn"
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-8 py-3.5 border border-white/60 text-white hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest rounded bg-transparent transition active:scale-95"
            >
              Register as a Player
            </button>

          </div>

          {/* Tournament Hosting Banner */}
          <div className="mt-8 p-5 bg-[#111118]/80 border border-white/10 rounded-2xl max-w-xl relative overflow-hidden group select-none">
            <div className="absolute top-0 right-0 h-16 w-16 bg-[#0f62fe]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-[#0f62fe] font-mono uppercase font-black tracking-widest block">Custom Draft Rooms</span>
                <h3 className="text-white font-bold font-sans text-sm">Host Your Custom Tournament Auction</h3>
                <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                  Compete with 2 to 25 teams, configure custom spending rules, and unlock your private draft board dashboard upon admin clearance.
                </p>
              </div>
              <button
                id="hero-host-tournament-banner"
                onClick={() => navigate('/register-auction')}
                className="px-4 py-2.5 bg-[#0f62fe] hover:bg-blue-500 text-white text-[10px] font-extrabold uppercase tracking-widest rounded transition cursor-pointer shrink-0 self-start sm:self-center font-sans"
              >
                Host Gavel
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* 📝 FOOTER BAR (Matches image screenshot footer style exactly, black themed, seamless borderless) */}
      <footer className="bg-transparent py-6 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs tracking-tight select-none">
        
        {/* Left Side: Trademark */}
        <div className="text-white font-bold font-sans">
          CricketFever
        </div>

        {/* Right Side: Links */}
        <div className="flex items-center gap-8 text-slate-400 font-medium font-sans">
          <button className="hover:text-[#0f62fe] transition uppercase text-[10px] tracking-wider">Privacy</button>
          <button className="hover:text-[#0f62fe] transition uppercase text-[10px] tracking-wider">Terms</button>
          <button className="hover:text-[#0f62fe] transition uppercase text-[10px] tracking-wider">Contact</button>
         </div>

      </footer>

      {/* 🔐 AUTH PORTAL MODAL (Secure dialogue viewport) */}
      {isModalOpen && (
        <div id="login-modal-overlay" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div id="login-modal-panel" className="bg-[#111118] border border-white/10 rounded-2xl p-6.5 w-full max-w-sm relative overflow-hidden shadow-2xl animate-in fade-in duration-200">
            
            {/* Top digital accent indicator line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#0f62fe]" />

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-display font-medium text-xs uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0f62fe]" />
                Cricket Fever Auth Gateway
              </h3>
              <button 
                id="login-close-button"
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMsg('');
                }}
                className="text-slate-400 hover:text-white text-xs font-bold font-mono transition"
              >
                [ESC]
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded p-3 flex items-start gap-2.5 text-red-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-snug font-sans">{errorMsg}</p>
              </div>
            )}

            <form id="login-dialog-form" onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email credentials */}
              <div className="space-y-1.5 font-sans">
                <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter auth email (e.g. spectator@saasauction.com)"
                    className="w-full bg-[#050507] border border-white/10 rounded pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#0f62fe] font-mono"
                  />
                </div>
              </div>

              {/* Password credentials */}
              <div className="space-y-1.5 font-sans">
                <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Passphrase Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <KeySquare className="w-3.5 h-3.5" />
                  </span>
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#050507] border border-white/10 rounded pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#0f62fe] font-mono"
                  />
                </div>
              </div>

              {/* Submit token trigger */}
              <button
                id="login-submit-button"
                type="submit"
                className="w-full py-2.5 bg-[#0f62fe] hover:bg-[#0d52d4] text-white text-xs font-bold uppercase tracking-widest rounded transition flex items-center justify-center gap-1.5 cursor-pointer font-sans"
              >
                Authenticate Token
              </button>
            </form>

            <div className="mt-5 pt-3.5 border-t border-white/5 text-center">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Cricket Fever Security Protocol</span>
            </div>
          </div>
        </div>
      )}

      {/* 🏏 REGISTRATION DIALOG MODAL */}
      {isRegisterModalOpen && (
        <div id="register-modal-overlay" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div id="register-modal-panel" className="bg-[#111118] border border-white/10 rounded-2xl p-6.5 w-full max-w-sm relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-display font-medium text-xs uppercase tracking-wider">
                Register as a Draft Player
              </h3>
              <button 
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold font-mono"
              >
                [ESC]
              </button>
            </div>

            {regSuccess ? (
              <div className="text-center py-6 space-y-3 font-sans">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 font-mono">
                  ✓
                </div>
                <h4 className="text-white text-xs font-bold uppercase">Registration Connected!</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                  Player [<strong>{regName}</strong>] successfully injected into the unassigned draft pool database. Real-time lists updated.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 font-sans">
                
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-450 font-bold uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Jasprit Bumrah"
                    className="w-full bg-[#050507] border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-450 font-bold uppercase">Category Role Specialist</label>
                  <select
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value)}
                    className="w-full bg-[#050507] border border-white/10 rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BATSMAN">Batsman</option>
                    <option value="BOWLER">Bowler</option>
                    <option value="ALL_ROUNDER">All-Rounder Specialist</option>
                    <option value="WICKET_KEEPER">Wicket Keeper</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#050507] text-xs font-bold uppercase tracking-widest rounded transition"
                >
                  Submit Registration
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🍔 HAMBURGER SIDEBAR OVERLAY DRAWER */}
      {isSidebarOpen && (
        <div id="hamburger-sidebar-overlay" className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Backdrop Blur overlay */}
          <div 
            id="hamburger-sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Actual menu panel */}
          <div 
            id="hamburger-sidebar-panel"
            className="absolute top-0 left-0 h-full w-80 bg-[#111118]/95 border-r border-[#ffffff]/10 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300"
          >
            {/* Top header block */}
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">Cricket</span>
                  <span className="text-lg font-normal text-[#0f62fe]">Fever</span>
                </div>
                <button 
                  id="hamburger-sidebar-close"
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
                  Menu Options & Navigation
                </span>

                <nav className="flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      handleEnterArena();
                    }}
                    className="w-full text-left px-4 py-3 bg-[#0f62fe]/10 hover:bg-[#0f62fe]/20 text-[#0f62fe] border border-[#0f62fe]/25 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Compass className="w-4 h-4 shrink-0" />
                    <span>Explore Auctions</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      navigate('/register-auction');
                    }}
                    className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Hammer className="w-4 h-4 shrink-0" />
                    <span>Host a Tournament</span>
                  </button>

                  {/* Other platform shortcuts for outstanding completeness & high fidelity */}
                  <div className="h-px bg-white/5 my-2" />

                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      navigate('/spectator');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Tv className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Live Broadcast</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      navigate('/players');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Player Discovery</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      navigate('/squads');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Squads Builder</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      navigate('/leaderboard');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Leaderboards</span>
                  </button>

                  {isAuthenticated && (
                    <>
                      {userRole === UserRole.TEAM_MANAGER && (
                        <button
                          onClick={() => {
                            setIsSidebarOpen(false);
                            navigate('/bid');
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <Coins className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>Bidding Area</span>
                        </button>
                      )}

                      {(userRole === UserRole.AUCTION_ADMIN || userRole === UserRole.PLATFORM_ADMIN) && (
                        <button
                          onClick={() => {
                            setIsSidebarOpen(false);
                            navigate('/admin');
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-blue-400 hover:text-blue-300 rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-blue-450 text-[#0f62fe] shrink-0" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}
                    </>
                  )}
                </nav>
              </div>
            </div>

            {/* Bottom credential profiles or branding info */}
            <div className="pt-4 border-t border-white/5 space-y-4 font-sans">
              {isAuthenticated ? (
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono">Authenticated User</span>
                  <p className="text-xs font-bold text-white mt-1 truncate">{userName}</p>
                  <span className="inline-block text-[9px] text-yellow-400 bg-yellow-400/15 border border-yellow-400/20 px-2 py-0.5 rounded-full mt-2 font-mono uppercase">
                    {userRole}
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-yellow-500/5 rounded-xl border border-yellow-500/10 text-center">
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Experience deep tactical insights and real-time bid streams.
                  </p>
                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="mt-2 text-[10px] text-yellow-400 hover:text-yellow-300 transition uppercase tracking-wider font-extrabold font-mono"
                  >
                    Authenticate Now &gt;&gt;
                  </button>
                </div>
              )}

              <p className="text-[9px] text-slate-600 text-center uppercase tracking-widest block font-mono pb-2">
                © CricketFever Systems
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
