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
  const { activeTab, contextPanelOpen, isReportModalOpen, closeReportModal, selectedIncident } = useAppStore();

  const renderWorkspace = useMemo(() => {
    switch (activeTab) {
      case 'login':
      case 'auth':
        return <LoginView />;
      case 'home':
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
        return <CityLiveIntelligenceWorkspace />;
    }
  }, [activeTab]);

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
