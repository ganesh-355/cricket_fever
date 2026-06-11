import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  // Fetch authentication status and active role directly from authStore
  const { userRole, setRole, isAuthenticated, setAuthenticated } = useAuthStore();

  const isAllowed = allowedRoles.includes(userRole) && isAuthenticated;

  if (!isAllowed) {
    return (
      <div id="role-guard-fallback" className="min-h-[70vh] flex items-center justify-center p-6 bg-[#050507]">
        <div className="max-w-md w-full bg-[#111118] border border-red-900/40 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Decorative warning accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600" />
          
          <div className="mx-auto w-16 h-16 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert id="shield-alert-icon" className="w-8 h-8 text-red-400" />
          </div>

          <h1 className="text-2xl font-display font-bold text-white tracking-tight mb-2 uppercase italic text-center">
            Restricted Access
          </h1>
          <p className="text-xs text-slate-400 mb-6 font-medium">
            Your current credential session (<span className="text-amber-500 font-mono font-bold">{userRole}</span>) is unauthorized for this terminal node. This page requires elevated authorization.
          </p>

          <div className="bg-[#050507] rounded-2xl p-4 mb-6 border border-white/10 text-left">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">
              Required Clearance Level
            </span>
            <div className="flex flex-wrap gap-2">
              {allowedRoles.map((role) => (
                <span 
                  key={role} 
                  className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded font-bold text-[10px] text-amber-500 font-mono"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Fast testing bypass trigger:</span>
            <div className="grid grid-cols-2 gap-2">
              {allowedRoles.map((role) => (
                <button
                  key={role}
                  id={`elevate-access-${role.toLowerCase()}`}
                  onClick={() => {
                    setRole(role);
                    setAuthenticated(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-[#050507] text-xs font-black rounded-xl transition cursor-pointer"
                >
                  Switch to {role.split('_')[0]}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

