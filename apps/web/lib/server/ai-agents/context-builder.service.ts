// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Unified Operational Context Builder Service
// ──────────────────────────────────────────────────────────────

import { situationAwarenessService } from '../services/situation-awareness.service';
import { knowledgeRetrievalService } from './knowledge-retrieval.service';
import { KnowledgeCitationDto } from '../domain/ai-agent.domain';

export interface UnifiedOperationalContext {
  timestamp: string;
  scopeName: string;
  activeIncidentsCount: number;
  criticalIncidentsCount: number;
  regionalRiskScore: number;
  citations: KnowledgeCitationDto[];
}

export class ContextBuilderService {
  async buildContext(query: string, scopeId = 'city-vja'): Promise<UnifiedOperationalContext> {
    const snapshot = await situationAwarenessService.getSnapshot('CITY', scopeId);
    const citations = await knowledgeRetrievalService.retrieveCitations(query, scopeId);

    return {
      timestamp: snapshot.timestamp,
      scopeName: snapshot.geographicScope.name,
      activeIncidentsCount: snapshot.activeIncidentCount,
      criticalIncidentsCount: snapshot.criticalIncidentCount,
      regionalRiskScore: snapshot.regionalRiskScore,
      citations,
    };
  }
}

export const contextBuilderService = new ContextBuilderService();
