'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS v1.0 — Main App Router & Shell Layout
// ──────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../stores/app-store';

// Layout Components
import Sidebar from '../components/layout/Sidebar';
import TopNav from '../components/layout/TopNav';
import NewContextPanel from '../components/layout/NewContextPanel';
import MobileNav from '../components/layout/MobileNav';
import CommandPalette from '../components/layout/CommandPalette';
import ToastProvider from '../components/ui/ToastProvider';
import { ExecutiveReportingEngineModal } from '../components/ui/ExecutiveReportingEngineModal';

// Workspace Pages
import HomePage from '../components/workspaces/HomePage';
import IncidentsPage from '../components/workspaces/IncidentsPage';
import MapPage from '../components/workspaces/MapPage';
import InsightsPage from '../components/workspaces/InsightsPage';
import AIPage from '../components/workspaces/AIPage';
import ReportsPage from '../components/workspaces/ReportsPage';
import SettingsPage from '../components/workspaces/SettingsPage';
import AuditHistory from '../components/workspaces/AuditHistory';
import DomainWorkspacePage from '../components/workspaces/DomainWorkspacePage';
import EvidenceWorkspace from '../components/workspaces/EvidenceWorkspace';
import ComputerVisionWorkspace from '../components/workspaces/ComputerVisionWorkspace';
import AdminPanelWorkspace from '../components/workspaces/AdminPanelWorkspace';
import { CityInterventionWorkspace } from '../components/command-center/CityInterventionWorkspace';
import { CityGovernanceWorkspace } from '../components/command-center/CityGovernanceWorkspace';
import { CityHumanCommandWorkspace } from '../components/command-center/CityHumanCommandWorkspace';
import { CityResponseReadinessWorkspace } from '../components/command-center/CityResponseReadinessWorkspace';
import { CityResilienceReadinessWorkspace } from '../components/command-center/CityResilienceReadinessWorkspace';
import { CityOperationalIntelligenceWorkspace } from '../components/command-center/CityOperationalIntelligenceWorkspace';
import { CityLiveIntelligenceWorkspace } from '../components/command-center/CityLiveIntelligenceWorkspace';
import LoginView from '../components/auth/LoginView';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export default function EarthMindApp() {
  const { activeTab, contextPanelOpen, isReportModalOpen, closeReportModal, selectedIncident, adminPanelAccessIds, currentUser } = useAppStore();

  const hasAdminAccess = adminPanelAccessIds.includes(currentUser?.id ?? '') || currentUser?.role === 'Administrator' || (currentUser?.role as string) === 'SUPER_ADMIN';

  const renderWorkspace = useMemo(() => {
    switch (activeTab) {
      case 'login':
      case 'auth':
        return <LoginView />;
      case 'home':
      case 'mission-control':
      case 'overview':
        return <HomePage />;
      case 'live-command':
      case 'live-intelligence':
      case 'city-live':
        return <CityLiveIntelligenceWorkspace />;
      case 'incidents':
      case 'command-center':
        return <IncidentsPage />;
      case 'map':
      case 'gis':
        return <MapPage />;
      case 'insights':
      case 'analytics':
        return <InsightsPage />;
      case 'evidence':
      case 'evidence-studio':
        return <EvidenceWorkspace />;
      case 'cv-studio':
      case 'vision-studio':
        return <ComputerVisionWorkspace />;
      case 'ai':
      case 'copilot':
        return <AIPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'audit':
      case 'audit-ledger':
        return <AuditHistory />;
      case 'admin':
      case 'admin-panel':
      case 'administration':
        if (!hasAdminAccess) {
          return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
              <div className="text-5xl">🔒</div>
              <h2 className="text-xl font-semibold text-gray-200">Access Restricted</h2>
              <p className="text-gray-400 max-w-sm">
                You do not have permission to access the Admin Panel.
                Contact your system administrator to request access.
              </p>
              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                Insufficient Privileges
              </span>
            </div>
          );
        }
        return <AdminPanelWorkspace />;
      case 'interventions':
      case 'intervention-planning':
      case 'city-interventions':
      case 'city-intervention':
        return <CityInterventionWorkspace />;
      case 'governance':
      case 'city-governance':
      case 'policy-engine':
        return <CityGovernanceWorkspace />;
      case 'human-command':
      case 'command-center-cases':
      case 'authorization-center':
        return <CityHumanCommandWorkspace />;
      case 'response-readiness':
      case 'execution-readiness':
      case 'operational-handoff':
        return <CityResponseReadinessWorkspace />;
      case 'resilience-readiness':
      case 'preparedness-intelligence':
      case 'operational-preparedness':
        return <CityResilienceReadinessWorkspace />;
      case 'operational-intelligence':
      case 'city-resilience':
      case 'continuous-feedback':
        return <CityOperationalIntelligenceWorkspace />;
      case 'infrastructure':
      case 'water':
      case 'disaster':
      case 'environment':
      case 'agriculture':
      case 'energy':
      case 'urban':
      case 'climate':
      case 'wildlife':
        return <DomainWorkspacePage domain={activeTab} />;
      default:
        return <HomePage />;
    }
  }, [activeTab, hasAdminAccess]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f1419] text-gray-200 font-sans antialiased">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopNav />
        <MobileNav />

        <div className="relative flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-[#0f1419]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="h-full w-full"
              >
                {renderWorkspace}
              </motion.div>
            </AnimatePresence>
          </main>

          {contextPanelOpen && <NewContextPanel />}
        </div>
      </div>

      <CommandPalette />
      <ToastProvider />
      <ExecutiveReportingEngineModal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        incident={selectedIncident}
      />
    </div>
  );
}
