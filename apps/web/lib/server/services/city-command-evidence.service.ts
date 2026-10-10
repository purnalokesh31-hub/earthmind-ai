// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 2/6
// City Command Evidence Request Workflow Service
// ──────────────────────────────────────────────────────────────

import { CityCommandEvidenceDto } from '../domain/digital-twin/city-command.domain';
import { memoryCityCommandRepository } from '../repositories/city-command.repository';
import { logger } from '../logger';

export interface CreateEvidenceRequestInput {
  caseId: string;
  requestedBy: string;
  reason: string;
  requiredEvidence: string[];
}

export class CityCommandEvidenceService {
  private repo = memoryCityCommandRepository;

  public requestEvidence(input: CreateEvidenceRequestInput): CityCommandEvidenceDto {
    const caseEntity = this.repo.getCase(input.caseId);
    if (!caseEntity) {
      throw new Error(`Command case '${input.caseId}' not found.`);
    }

    const evidenceRequestId = `evd-req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const reqDto: CityCommandEvidenceDto = {
      evidenceRequestId,
      caseId: input.caseId,
      requestedBy: input.requestedBy,
      reason: input.reason,
      requiredEvidence: input.requiredEvidence,
      timestamp: now,
      status: 'OPEN',
    };

    this.repo.recordEvidenceRequest(reqDto);
    this.repo.updateCaseStatus(input.caseId, 'EVIDENCE_REQUESTED', input.requestedBy, input.reason);

    logger.info(`[CityCommandEvidenceService] Evidence requested for case '${input.caseId}' by '${input.requestedBy}'.`);
    return reqDto;
  }
}

export const cityCommandEvidenceService = new CityCommandEvidenceService();
