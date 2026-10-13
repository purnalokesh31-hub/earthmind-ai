// ──────────────────────────────────────────────────────────────
// EarthMind PIOS v1.0 — Global UI Store (Zustand)
// ──────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Incident, User, Notification, Category, Severity, IncidentStatus, AuditLogEntry, UndoAction, UndoableActionType, EvidenceItem, EvidenceMediaType, AIVisionAnalysis } from '../types';
import { DEMO_INCIDENTS, DEMO_USERS, DEMO_NOTIFICATIONS } from '../lib/demo-data';
import { runVisionInference } from '../lib/services/ai.service';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Context Panel
  contextPanelOpen: boolean;
  contextPanelTab: 'ai' | 'case' | 'activity';
  toggleContextPanel: () => void;
  setContextPanelOpen: (open: boolean) => void;
  setContextPanelTab: (tab: 'ai' | 'case' | 'activity') => void;

  // Selected incident (for context panel)
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;

  // Incidents
  incidents: Incident[];
  setIncidents: (incidents: Incident[]) => void;

  // Notifications
  notifications: Notification[];

  // AI Chat
  chatMessages: Array<{ sender: 'user' | 'ai'; text: string }>;
  addChatMessage: (sender: 'user' | 'ai', text: string) => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategoryFilter: Category | 'all';
  setActiveCategoryFilter: (category: Category | 'all') => void;
  activeSearchFilter: string;
  setActiveSearchFilter: (search: string) => void;
  // Domain Specific Workspace Command Center
  activeDomainWorkspace: Category | null;
  setActiveDomainWorkspace: (domain: Category | null) => void;

  // Enterprise Navigation Architecture
  breadcrumbs: Array<{ label: string; href?: string }>;
  setBreadcrumbs: (crumbs: Array<{ label: string; href?: string }>) => void;
  recentPages: Array<{ id: string; label: string; emoji: string }>;
  addRecentPage: (id: string, label: string, emoji: string) => void;
  favoritePages: string[];
  toggleFavoritePage: (id: string) => void;

  // Global Report Modal
  isReportModalOpen: boolean;
  reportCategory: Category;
  reportInitialTitle: string;
  openReportModal: (category?: Category, initialTitle?: string) => void;
  closeReportModal: () => void;

  // Enterprise Interaction Patterns State
  toasts: Array<{ id: string; title: string; message?: string; type?: 'success' | 'error' | 'info' | 'warning'; durationMs?: number; action?: { label: string; onClick: () => void } }>;
  addToast: (toast: { id?: string; title: string; message?: string; type?: 'success' | 'error' | 'info' | 'warning'; durationMs?: number; action?: { label: string; onClick: () => void } }) => void;
  removeToast: (id: string) => void;

  pinnedIncidentIds: string[];
  togglePinIncident: (id: string) => void;

  savedFilters: Array<{ id: string; name: string; category?: Category | 'all'; severity?: Severity | 'all'; status?: IncidentStatus | 'all' }>;
  addSavedFilter: (filter: { name: string; category?: Category | 'all'; severity?: Severity | 'all'; status?: IncidentStatus | 'all' }) => void;
  removeSavedFilter: (id: string) => void;

  confirmDialog: { isOpen: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void } | null;
  openConfirmDialog: (dialog: { title: string; message: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void }) => void;
  closeConfirmDialog: () => void;

  // Incidents actions
  addIncident: (incident: Incident) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;

  // Notification actions
  addNotification: (notification: Notification) => void;

  // Mobile
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Command Palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Audit Logs Slice
  auditLogs: AuditLogEntry[];
  logAuditEvent: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

  // Undo & Recovery Slice (Max 10 items)
  undoStack: UndoAction[];
  recordUndoAction: (action: Omit<UndoAction, 'id' | 'timestamp'>) => void;
  undoLastAction: () => boolean;
  undoSpecificAction: (actionId: string) => boolean;

  // Operational Actions supporting Undo
  archiveIncident: (id: string) => void;
  deleteIncident: (id: string) => void;
  resolveIncident: (id: string) => void;
  mergeIncidents: (sourceId: string, targetId: string) => void;

  // Incident lifecycle helpers
  transitionIncidentStage: (id: string, status: IncidentStatus) => void;
  dispatch: (incidentId: string, action: string) => void;

  // Admin Panel Access Control (RBAC delegation)
  adminPanelAccessIds: string[];
  grantAdminAccess: (userId: string) => void;
  revokeAdminAccess: (userId: string) => void;

  // Evidence & AI Vision Platform Slice
  evidenceList: EvidenceItem[];
  selectedEvidenceId: string | null;
  setSelectedEvidenceId: (id: string | null) => void;
  uploadEvidence: (item: Partial<EvidenceItem>) => Promise<EvidenceItem>;
  deleteEvidence: (id: string) => void;
  analyzeEvidence: (id: string) => Promise<AIVisionAnalysis>;
  linkEvidenceToIncident: (evidenceId: string, incidentId: string) => void;
  createIncidentFromEvidence: (evidenceId: string) => string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
  isAuthenticated: false,
  currentUser: null,
  login: (user) => set({ isAuthenticated: true, currentUser: user }),
  logout: () => set({ isAuthenticated: false, currentUser: null }),
  updateCurrentUser: (updates) => set((s) => ({
    currentUser: s.currentUser ? { ...s.currentUser, ...updates } : null,
  })),

  // Navigation
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Context Panel
  contextPanelOpen: false,
  contextPanelTab: 'ai',
  toggleContextPanel: () => set((s) => ({ contextPanelOpen: !s.contextPanelOpen })),
  setContextPanelOpen: (open) => set({ contextPanelOpen: open }),
  setContextPanelTab: (tab) => set({ contextPanelTab: tab, contextPanelOpen: true }),

  // Selected incident
  selectedIncident: null,
  setSelectedIncident: (incident) => set({
    selectedIncident: incident,
    contextPanelOpen: incident !== null,
    contextPanelTab: incident ? 'case' : 'ai',
  }),

  // Incidents
  incidents: DEMO_INCIDENTS,
  setIncidents: (incidents) => set({ incidents }),
  addIncident: (incident) => set((s) => ({ incidents: [incident, ...s.incidents] })),
  updateIncident: (id, updates) => set((s) => ({
    incidents: s.incidents.map((inc) => inc.id === id ? { ...inc, ...updates, updatedAt: new Date().toISOString() } : inc),
    selectedIncident: s.selectedIncident?.id === id ? { ...s.selectedIncident, ...updates, updatedAt: new Date().toISOString() } : s.selectedIncident
  })),
  transitionIncidentStage: (id, status) => set((s) => ({
    incidents: s.incidents.map((inc) => inc.id === id ? { ...inc, status, updatedAt: new Date().toISOString() } : inc),
    selectedIncident: s.selectedIncident?.id === id ? { ...s.selectedIncident, status, updatedAt: new Date().toISOString() } : s.selectedIncident,
  })),
  dispatch: (incidentId, action) => {
    // Placeholder for future dispatch logic
    console.log(`Dispatch ${action} for incident ${incidentId}`);
  },

  // Notifications
  notifications: DEMO_NOTIFICATIONS,
  addNotification: (notification) => set((s) => ({ notifications: [notification, ...s.notifications] })),

  // AI Chat
  chatMessages: [
    { sender: 'ai', text: "Welcome to EarthMind PIOS. I can help you analyze incidents, generate reports, find patterns, or navigate the system. What would you like to do?" },
  ],
  addChatMessage: (sender, text) => set((s) => ({
    chatMessages: [...s.chatMessages, { sender, text }],
  })),

  // Search & Filters
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  activeCategoryFilter: 'all',
  setActiveCategoryFilter: (category) => set({ activeCategoryFilter: category }),
  activeSearchFilter: '',
  setActiveSearchFilter: (search) => set({ activeSearchFilter: search }),

  // Domain Specific Workspace Command Center
  activeDomainWorkspace: null,
  setActiveDomainWorkspace: (domain) => set({ activeDomainWorkspace: domain }),

  // Enterprise Navigation Architecture
  breadcrumbs: [{ label: 'Mission Control' }],
  setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),
  recentPages: [
    { id: 'home', label: 'Mission Control', emoji: '🎯' },
    { id: 'incidents', label: 'Operations', emoji: '⚡' },
    { id: 'map', label: 'Intelligence', emoji: '🛰️' }
  ],
  addRecentPage: (id, label, emoji) => set((state) => {
    const filtered = state.recentPages.filter(p => p.id !== id);
    return { recentPages: [{ id, label, emoji }, ...filtered].slice(0, 5) };
  }),
  favoritePages: ['home', 'incidents', 'map'],
  toggleFavoritePage: (id) => set((state) => {
    const exists = state.favoritePages.includes(id);
    return {
      favoritePages: exists
        ? state.favoritePages.filter(f => f !== id)
        : [...state.favoritePages, id]
    };
  }),

  // Global Report Modal
  isReportModalOpen: false,
  reportCategory: 'infrastructure',
  reportInitialTitle: '',
  openReportModal: (category = 'infrastructure', initialTitle = '') => set({
    isReportModalOpen: true,
    reportCategory: category,
    reportInitialTitle: initialTitle,
  }),
  closeReportModal: () => set({ isReportModalOpen: false, reportInitialTitle: '' }),

  // Enterprise Interaction Patterns Implementation
  toasts: [],
  addToast: (toast) => set((state) => {
    const id = toast.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast = { type: 'info' as const, ...toast, id };
    return { toasts: [...state.toasts, newToast] };
  }),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id),
  })),

  pinnedIncidentIds: ['EM-208', 'EM-211'],
  togglePinIncident: (id) => set((state) => {
    const exists = state.pinnedIncidentIds.includes(id);
    const updated = exists ? state.pinnedIncidentIds.filter(i => i !== id) : [...state.pinnedIncidentIds, id];
    return { pinnedIncidentIds: updated };
  }),

  savedFilters: [
    { id: 'sf-1', name: 'Critical PWD Hazards', category: 'infrastructure', severity: 'critical' },
    { id: 'sf-2', name: 'Active Agri Blights', category: 'agriculture', status: 'investigating' }
  ],
  addSavedFilter: (filter) => set((state) => ({
    savedFilters: [...state.savedFilters, { id: `sf-${Date.now()}`, ...filter }]
  })),
  removeSavedFilter: (id) => set((state) => ({
    savedFilters: state.savedFilters.filter(sf => sf.id !== id)
  })),

  confirmDialog: null,
  openConfirmDialog: (dialog) => set({ confirmDialog: { ...dialog, isOpen: true } }),
  closeConfirmDialog: () => set({ confirmDialog: null }),

  // Audit Logs Initial Seed & Action
  auditLogs: [
    {
      id: 'audit-101',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      event: 'RESOURCE_DISPATCHED',
      actor: 'Supervisor Rao',
      department: 'Public Works Department',
      incidentId: 'EM-208',
      details: 'Dispatched Squad L3 & Heavy Excavator EX-02 to Ward 12 Main Drain burst.',
    },
    {
      id: 'audit-102',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      event: 'AI_PRESCTUATIONAL_SCAN',
      actor: 'Neural Model v4.2',
      department: 'Water Supply Board',
      incidentId: 'EM-208',
      details: 'AI Vision Engine detected 94.2% confidence structural pipe fracture from uploaded drone video.',
    },
    {
      id: 'audit-103',
      timestamp: new Date(Date.now() - 86400000 * 1.2).toISOString(),
      event: 'CASE_STAGE_TRANSITION',
      actor: 'Control Lead Sravan',
      department: 'Agriculture Cell',
      incidentId: 'EM-211',
      details: 'Advanced incident status from REPORTED to INVESTIGATING.',
    },
    {
      id: 'audit-104',
      timestamp: new Date(Date.now() - 86400000 * 1.8).toISOString(),
      event: 'EVIDENCE_DOSSIER_ATTACHED',
      actor: 'Officer Lokesh',
      department: 'Environmental Protection',
      incidentId: 'EM-211',
      details: 'Attached high-res multispectral telemetry file Crop_Blight_Sector4.json.',
    },
    {
      id: 'audit-105',
      timestamp: new Date(Date.now() - 86400000 * 4.5).toISOString(),
      event: 'EXECUTIVE_REPORT_COMPILED',
      actor: 'Chief Administrator',
      department: 'Executive Command',
      incidentId: 'EM-204',
      details: 'Generated formal Situation Report PDF & updated Earth Health Impact Score (+4.2 pts).',
    },
    {
      id: 'audit-106',
      timestamp: new Date(Date.now() - 86400000 * 7.0).toISOString(),
      event: 'SYSTEM_INTAKE_INITIALIZED',
      actor: 'Citizen Intake Portal',
      department: 'Multi-Domain Command',
      incidentId: 'EM-201',
      details: 'Citizen report received via WhatsApp bot, mapped geocoordinates to Ward 4.',
    },
  ],

  logAuditEvent: (entry) => set((state) => ({
    auditLogs: [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...entry,
      },
      ...state.auditLogs,
    ],
  })),

  // Undo & Recovery Implementation (Max 10 items)
  undoStack: [],

  recordUndoAction: (action) => {
    const newAction: UndoAction = {
      id: `undo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ...action,
    };

    set((state) => ({
      undoStack: [newAction, ...state.undoStack].slice(0, 10),
    }));

    // Display Toast: "Action completed. Undo?" (Auto-expire after 10s = 10000ms)
    get().addToast({
      title: `${action.description}`,
      message: 'Action completed. Undo?',
      type: 'warning',
      durationMs: 10000,
      action: {
        label: 'Undo',
        onClick: () => get().undoSpecificAction(newAction.id),
      },
    });
  },

  undoSpecificAction: (actionId) => {
    const state = get();
    const actionIndex = state.undoStack.findIndex((a) => a.id === actionId);
    if (actionIndex === -1) return false;

    const action = state.undoStack[actionIndex];
    const remainingStack = state.undoStack.filter((a) => a.id !== actionId);

    if (action.type === 'archive' || action.type === 'resolve') {
      if (action.previousState.status) {
        state.updateIncident(action.incidentId, { status: action.previousState.status });
      }
    } else if (action.type === 'delete') {
      if (action.previousState.incident) {
        state.addIncident(action.previousState.incident);
      }
    } else if (action.type === 'merge') {
      if (action.previousState.status) {
        state.updateIncident(action.incidentId, { status: action.previousState.status });
      }
    }

    set({ undoStack: remainingStack });

    // Record Undo event in persistent Audit History
    state.logAuditEvent({
      event: 'UNDO_ACTION_EXECUTED',
      actor: state.currentUser?.name || 'Control Room Duty Officer',
      incidentId: action.incidentId,
      details: `Reverted action "${action.description}" for incident ${action.incidentId}.`,
    });

    state.addToast({
      title: 'Action Undone',
      message: `Reverted "${action.description}" for case ${action.incidentId}.`,
      type: 'success',
    });

    return true;
  },

  undoLastAction: () => {
    const stack = get().undoStack;
    if (stack.length === 0) return false;
    return get().undoSpecificAction(stack[0].id);
  },

  // Operational Actions supporting Undo
  archiveIncident: (id) => {
    const state = get();
    const inc = state.incidents.find((i) => i.id === id);
    if (!inc) return;

    const previousStatus = inc.status;
    state.updateIncident(id, { status: 'archived' });

    state.logAuditEvent({
      event: 'INCIDENT_ARCHIVED',
      actor: state.currentUser?.name || 'Control Room Officer',
      incidentId: id,
      details: `Archived incident record ${id}.`,
    });

    state.recordUndoAction({
      type: 'archive',
      description: `Archive Case ${id}`,
      incidentId: id,
      previousState: { status: previousStatus },
    });
  },

  deleteIncident: (id) => {
    const state = get();
    const inc = state.incidents.find((i) => i.id === id);
    if (!inc) return;

    set((s) => ({ incidents: s.incidents.filter((i) => i.id !== id) }));

    state.logAuditEvent({
      event: 'INCIDENT_DELETED',
      actor: state.currentUser?.name || 'Control Room Officer',
      incidentId: id,
      details: `Deleted incident record ${id}.`,
    });

    state.recordUndoAction({
      type: 'delete',
      description: `Delete Case ${id}`,
      incidentId: id,
      previousState: { incident: inc },
    });
  },

  resolveIncident: (id) => {
    const state = get();
    const inc = state.incidents.find((i) => i.id === id);
    if (!inc) return;

    const previousStatus = inc.status;
    state.updateIncident(id, { status: 'resolved' });

    state.logAuditEvent({
      event: 'INCIDENT_RESOLVED',
      actor: state.currentUser?.name || 'Field Officer',
      incidentId: id,
      details: `Marked incident ${id} as RESOLVED.`,
    });

    state.recordUndoAction({
      type: 'resolve',
      description: `Resolve Case ${id}`,
      incidentId: id,
      previousState: { status: previousStatus },
    });
  },

  mergeIncidents: (sourceId, targetId) => {
    const state = get();
    const sourceInc = state.incidents.find((i) => i.id === sourceId);
    if (!sourceInc) return;

    const previousStatus = sourceInc.status;
    state.updateIncident(sourceId, { status: 'archived' });

    state.logAuditEvent({
      event: 'INCIDENTS_MERGED',
      actor: 'AI Vision Engine & Operator',
      incidentId: targetId,
      details: `Merged duplicate case ${sourceId} into primary record ${targetId}.`,
    });

    state.recordUndoAction({
      type: 'merge',
      description: `Merge ${sourceId} → ${targetId}`,
      incidentId: sourceId,
      previousState: { status: previousStatus, mergedWithId: targetId },
    });
  },

  // Evidence & AI Vision Platform Implementation
  selectedEvidenceId: 'ev-101',
  setSelectedEvidenceId: (id) => set({ selectedEvidenceId: id }),

  evidenceList: [
    {
      id: 'ev-101',
      name: 'Benz_Circle_Road_Deformation_Drone.jpg',
      url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
      type: 'image',
      mimeType: 'image/jpeg',
      sizeBytes: 3450000,
      uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      uploadedBy: 'Drone Patrol Alpha-4',
      linkedIncidentId: 'EM-208',
      status: 'analyzed',
      aiAnalysis: {
        objectsDetected: ['Pothole Subsurface Breach', 'High-Pressure Main Crack', 'Debris Accumulation'],
        overallConfidence: 96.4,
        damageScore: 84.5,
        classification: 'Critical Infrastructure Deformation',
        recommendedDepartment: 'Public Works Department',
        processingTimeMs: 420,
        boundingBoxes: [
          {
            id: 'bbox-1',
            label: 'Primary Road Surface Subsidence',
            confidence: 97.2,
            severity: 'critical',
            x: 18,
            y: 22,
            width: 44,
            height: 38,
          },
          {
            id: 'bbox-2',
            label: 'Cast-Iron Water Main Shearing',
            confidence: 94.8,
            severity: 'high',
            x: 52,
            y: 48,
            width: 32,
            height: 28,
          },
        ],
      },
    },
    {
      id: 'ev-102',
      name: 'Sector_4_Substation_Thermal_Feed.mp4',
      url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&auto=format&fit=crop&q=80',
      type: 'video',
      mimeType: 'video/mp4',
      sizeBytes: 18400000,
      uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      uploadedBy: 'CCTV Feed #42',
      linkedIncidentId: 'EM-202',
      status: 'analyzed',
      aiAnalysis: {
        objectsDetected: ['Fluid Surge Flow', 'Thermal Anomaly', 'Structural Vibration'],
        overallConfidence: 93.8,
        damageScore: 78.0,
        classification: 'Hydraulic Surge & Optical Anomaly',
        recommendedDepartment: 'Urban Hydro Division',
        processingTimeMs: 650,
        keyframes: ['Frame #042: Initial Leak Spike', 'Frame #128: Pressure Peak'],
        boundingBoxes: [
          {
            id: 'bbox-v1',
            label: 'Hydro Burst Velocity Vector',
            confidence: 95.1,
            severity: 'high',
            x: 25,
            y: 30,
            width: 50,
            height: 45,
          },
        ],
      },
    },
  ],

  uploadEvidence: async (item) => {
    const state = get();
    const newId = `ev-${Date.now()}`;
    const newEvidence: EvidenceItem = {
      id: newId,
      name: item.name || 'Uploaded_Evidence_Asset.jpg',
      url: item.url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
      type: item.type || 'image',
      mimeType: item.mimeType || 'image/jpeg',
      sizeBytes: item.sizeBytes || 2400000,
      uploadedAt: new Date().toISOString(),
      uploadedBy: state.currentUser?.name || 'Control Room Duty Officer',
      linkedIncidentId: item.linkedIncidentId,
      status: 'processing',
    };

    set((s) => ({ evidenceList: [newEvidence, ...s.evidenceList], selectedEvidenceId: newId }));

    state.logAuditEvent({
      event: 'EVIDENCE_UPLOADED',
      actor: newEvidence.uploadedBy,
      incidentId: item.linkedIncidentId || 'UNLINKED',
      details: `Uploaded evidence file "${newEvidence.name}" (${newEvidence.type.toUpperCase()}).`,
    });

    state.addToast({
      title: 'Evidence Uploaded',
      message: `Analyzing "${newEvidence.name}" with AI Vision Engine...`,
      type: 'info',
    });

    // Auto-trigger AI Vision Inference
    const analysis = await state.analyzeEvidence(newId);
    return { ...newEvidence, aiAnalysis: analysis, status: 'analyzed' };
  },

  deleteEvidence: (id) => {
    const state = get();
    const item = state.evidenceList.find((e) => e.id === id);
    if (!item) return;

    set((s) => ({
      evidenceList: s.evidenceList.filter((e) => e.id !== id),
      selectedEvidenceId: s.selectedEvidenceId === id ? null : s.selectedEvidenceId,
    }));

    state.logAuditEvent({
      event: 'EVIDENCE_DELETED',
      actor: state.currentUser?.name || 'Duty Officer',
      details: `Deleted evidence item ${id} (${item.name}).`,
    });

    state.addToast({
      title: 'Evidence Deleted',
      message: `Removed evidence asset ${item.name}.`,
      type: 'warning',
    });
  },

  analyzeEvidence: async (id) => {
    const state = get();
    const item = state.evidenceList.find((e) => e.id === id);
    if (!item) throw new Error(`Evidence ${id} not found`);

    const analysis = await runVisionInference(item);

    set((s) => ({
      evidenceList: s.evidenceList.map((e) =>
        e.id === id ? { ...e, aiAnalysis: analysis, status: 'analyzed' } : e
      ),
    }));

    state.logAuditEvent({
      event: 'AI_VISION_INFERENCE_COMPLETED',
      actor: 'EarthMind Vision Engine v4.2',
      incidentId: item.linkedIncidentId || 'UNLINKED',
      details: `Completed neural vision analysis for ${item.name}. Confidence: ${analysis.overallConfidence}%, Damage Score: ${analysis.damageScore}%.`,
    });

    state.addToast({
      title: 'AI Vision Analysis Complete',
      message: `Detected ${analysis.objectsDetected.length} hazard objects in ${item.name}.`,
      type: 'success',
    });

    return analysis;
  },

  linkEvidenceToIncident: (evidenceId, incidentId) => {
    const state = get();
    set((s) => ({
      evidenceList: s.evidenceList.map((e) =>
        e.id === evidenceId ? { ...e, linkedIncidentId: incidentId } : e
      ),
    }));

    state.logAuditEvent({
      event: 'EVIDENCE_LINKED_TO_INCIDENT',
      actor: state.currentUser?.name || 'Duty Officer',
      incidentId,
      details: `Linked evidence asset ${evidenceId} to incident record ${incidentId}.`,
    });

    state.addToast({
      title: 'Evidence Linked',
      message: `Linked asset ${evidenceId} to Incident ${incidentId}.`,
      type: 'success',
    });
  },

  createIncidentFromEvidence: (evidenceId) => {
    const state = get();
    const item = state.evidenceList.find((e) => e.id === evidenceId);
    if (!item || !item.aiAnalysis) return '';

    const damageScore = item.aiAnalysis.damageScore || 75;
    const confidence = item.aiAnalysis.overallConfidence || 95;

    // 1. Calculate Risk Score (0 - 100)
    const riskScore = Math.min(100, Math.max(0, Math.round(damageScore * 0.7 + confidence * 0.3)));

    // 2. Recommend Severity
    const severity: Severity = damageScore >= 80 ? 'critical' : damageScore >= 60 ? 'high' : damageScore >= 40 ? 'medium' : 'low';

    // 3. Recommend Category
    const cls = (item.aiAnalysis.classification || '').toLowerCase();
    let category: Category = 'infrastructure';
    if (cls.includes('water') || cls.includes('flood') || cls.includes('leak')) category = 'water';
    else if (cls.includes('energy') || cls.includes('pole') || cls.includes('electric')) category = 'energy';
    else if (cls.includes('fire') || cls.includes('ignition') || cls.includes('disaster')) category = 'disaster';
    else if (cls.includes('crop') || cls.includes('leaf') || cls.includes('blight')) category = 'agriculture';
    else if (cls.includes('tree') || cls.includes('waste') || cls.includes('dumping')) category = 'environment';
    else if (cls.includes('building') || cls.includes('masonry')) category = 'urban';

    // 4. Recommend Department
    const department = item.aiAnalysis.recommendedDepartment || 'Public Works Department';

    // 5. Generate AI Summary
    const aiSummary = `AI Neural Vision (${item.aiAnalysis.classification}): Detected ${item.aiAnalysis.objectsDetected.join(', ')} with ${confidence}% confidence. Risk Score: ${riskScore}/100. Automated dispatch recommended to ${department}.`;

    const newIncId = `EM-${Math.floor(210 + Math.random() * 80)}`;
    const newIncident: Incident = {
      id: newIncId,
      title: `${item.aiAnalysis.classification} (${item.name.split('.')[0]})`,
      description: `AI Vision Engine ingested asset ${item.name}. ${aiSummary}`,
      category,
      severity,
      status: 'investigating',
      assignedTo: 'Commander Sarah Jenkins',
      department,
      location: {
        name: 'Vijayawada Central Ward 12',
        lat: 16.5062,
        lng: 80.648,
        ward: 'Ward 12',
      },
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reportedBy: item.uploadedBy || 'AI Autonomous Vision Sensor',
      // 6. Create Timeline Event
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          event: 'INCIDENT_INTAKE_VIA_VISION_ENGINE',
          icon: '👁️',
          actor: 'AI Vision Engine v4.2',
          stage: 'investigating',
          department,
          remarks: `Incident created automatically from AI Vision asset ${item.name} (${confidence}% confidence, ${riskScore}/100 risk score).`,
        },
      ],
      aiAnalysis: {
        confidence,
        classification: item.aiAnalysis.classification,
        severity,
        summary: aiSummary,
        recommendations: [
          `Deploy ${department} emergency response unit immediately`,
          `Isolate localized hazard boundary within 50m radius`,
          `Sync visual telemetry with Digital Twin GIS map`,
        ],
        estimatedCost: damageScore >= 80 ? '₹4,50,000' : '₹1,85,000',
      },
    };

    // 7. Synchronize through Zustand SSOT
    state.addIncident(newIncident);
    state.linkEvidenceToIncident(evidenceId, newIncId);

    // 8. Generate Audit Entry
    state.logAuditEvent({
      event: 'INCIDENT_DISPATCHED_FROM_VISION',
      actor: 'EarthMind AI Vision Engine',
      incidentId: newIncId,
      department,
      details: `Dispatched Incident ${newIncId} (${newIncident.title}). Risk Score: ${riskScore}/100, Department: ${department}.`,
    });

    // 9. Dispatch Operations Notification
    state.addNotification({
      id: `notif-${Date.now()}`,
      eventType: 'evidence_uploaded',
      priorityGroup: severity === 'critical' ? 'P1_CRITICAL' : 'P2_HIGH',
      title: `Vision AI Auto-Dispatched ${newIncId}`,
      message: `Created Incident ${newIncId} from evidence ${item.name}. Assigned to ${department}.`,
      timestamp: 'Just now',
      status: 'unread',
      incidentId: newIncId,
      actor: 'AI Vision Engine',
      type: severity === 'critical' ? 'critical' : 'warning',
      read: false,
    });

    // 10. Show Interactive Toast
    state.addToast({
      title: 'Vision AI Incident Created',
      message: `Dispatched ${newIncId} to ${department}. Risk Score: ${riskScore}/100.`,
      type: 'success',
    });

    return newIncId;
  },

  // Admin Panel Access Control (RBAC delegation)
  // Seeded with the two demo Administrator user IDs
  adminPanelAccessIds: ['usr-1', 'usr-4'],
  grantAdminAccess: (userId) => {
    set((s) => ({
      adminPanelAccessIds: s.adminPanelAccessIds.includes(userId)
        ? s.adminPanelAccessIds
        : [...s.adminPanelAccessIds, userId],
    }));
    get().logAuditEvent({
      event: 'ADMIN_ACCESS_GRANTED',
      actor: get().currentUser?.name || 'Administrator',
      details: `Granted Admin Panel access to user ID ${userId}.`,
    });
    get().addToast({ title: 'Admin Access Granted', message: `User ${userId} now has Admin Panel access.`, type: 'success' });
  },
  revokeAdminAccess: (userId) => {
    set((s) => ({
      adminPanelAccessIds: s.adminPanelAccessIds.filter((id) => id !== userId),
    }));
    get().logAuditEvent({
      event: 'ADMIN_ACCESS_REVOKED',
      actor: get().currentUser?.name || 'Administrator',
      details: `Revoked Admin Panel access from user ID ${userId}.`,
    });
    get().addToast({ title: 'Admin Access Revoked', message: `User ${userId} no longer has Admin Panel access.`, type: 'warning' });
  },

  // Command Palette
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Mobile
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    {
      name: 'earthmind_audit_log',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        auditLogs: state.auditLogs,
        adminPanelAccessIds: state.adminPanelAccessIds,
      }),
    }
  )
);
