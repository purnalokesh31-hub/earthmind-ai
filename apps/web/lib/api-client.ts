// ──────────────────────────────────────────────────────────────
// EarthMind PIOS v1.0 — Enterprise Incident Intelligence API Client Interface
// Clean service abstraction hooks prepared for future backend integration.
// ──────────────────────────────────────────────────────────────

import type { Incident, IncidentStatus, Category, Severity } from '../types';
import { DEMO_INCIDENTS } from './demo-data';

export interface IncidentQueryParams {
  category?: Category;
  severity?: Severity;
  status?: IncidentStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IncidentStageTransitionPayload {
  incidentId: string;
  newStatus: IncidentStatus;
  remarks?: string;
  actor?: string;
}

export interface EvidenceUploadPayload {
  incidentId: string;
  fileType: 'image' | 'video' | 'audio' | 'document';
  fileUrl: string;
  gpsCoordinates?: { lat: number; lng: number; alt?: number };
}

class IncidentIntelligenceService {
  private localIncidents: Incident[] = DEMO_INCIDENTS;

  // 1. Fetch Incidents (Abstracted Endpoint: GET /api/v1/incidents)
  async getIncidents(params?: IncidentQueryParams): Promise<{ data: Incident[]; total: number }> {
    let result = [...this.localIncidents];

    if (params?.category && params.category !== ('all' as any)) {
      result = result.filter((i) => i.category === params.category);
    }
    if (params?.severity && params.severity !== ('all' as any)) {
      result = result.filter((i) => i.severity === params.severity);
    }
    if (params?.status && params.status !== ('all' as any)) {
      result = result.filter((i) => i.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((i) => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }

    return {
      data: result,
      total: result.length,
    };
  }

  // 2. Transition Incident Workflow Stage (Abstracted Endpoint: POST /api/v1/incidents/transition)
  async transitionStage(payload: IncidentStageTransitionPayload): Promise<Incident> {
    const inc = this.localIncidents.find((i) => i.id === payload.incidentId);
    if (!inc) throw new Error(`Incident ${payload.incidentId} not found`);

    inc.status = payload.newStatus;
    inc.updatedAt = new Date().toISOString();

    if (payload.remarks) {
      inc.timeline.push({
        id: `evt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: `Workflow transitioned to ${payload.newStatus.toUpperCase()}: ${payload.remarks}`,
        icon: '⚡',
        actor: payload.actor || 'System Engine',
      });
    }

    return { ...inc };
  }

  // 3. Trigger AI Processing (Abstracted Endpoint: POST /api/v1/ai/pre-scan)
  async triggerAIProcessing(incidentId: string): Promise<Incident> {
    const inc = this.localIncidents.find((i) => i.id === incidentId);
    if (!inc) throw new Error(`Incident ${incidentId} not found`);

    inc.status = 'ai_processing';
    inc.aiAnalysis = {
      confidence: 94.2,
      classification: `AUTOMATED_HAZARD_PRESCAN_${inc.category.toUpperCase()}`,
      severity: inc.severity,
      summary: `AI pre-scan completed. Neural model confirmed high confidence hazard in ${inc.location?.name || 'Vijayawada'}.`,
      recommendations: [
        'Dispatch primary sector squad',
        'Deploy drone unit 01 for high-res aerial scan',
        'Notify department head',
      ],
    };
    inc.status = 'created';
    inc.updatedAt = new Date().toISOString();

    return { ...inc };
  }

  // 4. Upload Evidence Package (Abstracted Endpoint: POST /api/v1/evidence/upload)
  async uploadEvidence(payload: EvidenceUploadPayload): Promise<{ success: boolean; hash: string }> {
    return {
      success: true,
      hash: `SHA-256-${Math.random().toString(36).substring(2, 10)}`,
    };
  }
}

export const incidentService = new IncidentIntelligenceService();
