import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RoleGuard } from './components/RoleGuard';
import { UserRole } from './types';

// Page Imports
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import { WarRoom } from './pages/WarRoom';
import { RealTimeSpectatorBoard } from './pages/SpectatorBoard';
import { SquadBuilderDraft } from './pages/SquadBuilder';
import { PlayerAnalyticsSearch } from './pages/PlayerSearch';
import { AnalyticsLeaderboardDashboard } from './pages/Leaderboard';
import { RegisterAuction } from './pages/RegisterAuction';
import { RoleSwitcherHub } from './components/GlobalRoleSelectorHub';

export default function App() {
  return (
    <HashRouter>
      <RoleSwitcherHub />
      <Routes>
        {/* Home page sits raw without global HUD to permit credentials assignment first */}
        <Route path="/" element={<Home />} />

        {/* HUD Guarded Shell Routes */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                {/* Public Spectator and Directory pages */}
                <Route path="spectator" element={<RealTimeSpectatorBoard />} />
                <Route path="register-auction" element={<RegisterAuction />} />
                <Route path="players" element={<PlayerAnalyticsSearch />} />
                <Route path="squads" element={<SquadBuilderDraft />} />
                <Route path="leaderboard" element={<AnalyticsLeaderboardDashboard />} />

                {/* Team Manager Guided Bid Panel (Guard constraint) */}
                <Route
                  path="bid"
                  element={
                    <RoleGuard allowedRoles={[UserRole.TEAM_MANAGER, UserRole.AUCTION_ADMIN, UserRole.PLATFORM_ADMIN]}>
                      <WarRoom />
                    </RoleGuard>
                  }
                />

                {/* Unified Administrator Dashboard (Guard constraint) */}
                <Route
                  path="admin"
                  element={
                    <RoleGuard allowedRoles={[UserRole.AUCTION_ADMIN, UserRole.PLATFORM_ADMIN]}>
                      <AdminDashboard />
                    </RoleGuard>
                  }
                />

                {/* Default fallback redirects within HUD shell */}
                <Route path="*" element={<Navigate to="/spectator" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </HashRouter>
  );
}
