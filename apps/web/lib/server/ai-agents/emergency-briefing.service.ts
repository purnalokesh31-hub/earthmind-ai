// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Emergency Briefing Generator Service
// ──────────────────────────────────────────────────────────────

import { EmergencyBriefingDto } from '../domain/ai-agent.domain';
import { situationAwarenessService } from '../services/situation-awareness.service';
import { knowledgeRetrievalService } from './knowledge-retrieval.service';

export class EmergencyBriefingService {
  async generateBriefing(type: 'INCIDENT' | 'CITY' | 'REGIONAL' | 'DAILY_OPERATIONS' = 'CITY', scopeId = 'city-vja'): Promise<EmergencyBriefingDto> {
    const snapshot = await situationAwarenessService.getSnapshot('CITY', scopeId);
    const citations = await knowledgeRetrievalService.retrieveCitations('Emergency briefing summary', scopeId);

    return {
      briefingId: `brief-${Date.now()}`,
      title: `Vijayawada Emergency Operations Executive Briefing`,
      briefingType: type,
      jurisdictionName: snapshot.geographicScope.name,
      currentSituation: `Active operational status: ${snapshot.activeIncidentCount} active incidents logged across central sector with ${snapshot.criticalIncidentCount} critical P1 structural & hydro hazards.`,
      criticalIncidentsCount: snapshot.criticalIncidentCount,
      activeWarningsCount: snapshot.activeWarningsCount,
      predictedRisksCount: snapshot.activePredictionsCount,
      resourceAvailability: `12 responder units available; Public Works capacity at 88% workload.`,
      topPriorities: [
        'Road Subsidence — NH-9 Junction (P1 Critical)',
        'Transformer Ignition Risk — Ward 8',
        'Hydro Flood Risk Watch — Ward 12 (82/100 Risk Score)',
      ],
      citations,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const emergencyBriefingService = new EmergencyBriefingService();
