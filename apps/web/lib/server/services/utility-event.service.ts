// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Utility Event Engine
// ──────────────────────────────────────────────────────────────

import { UtilityEventDto, UtilityType } from '../domain/digital-twin/utility.domain';
import { memoryUtilityRepository } from '../repositories/utility.repository';

export class UtilityEventService {
  async logUtilityEvent(
    assetId: string,
    assetName: string,
    utilityType: UtilityType,
    eventType: UtilityEventDto['eventType'],
    severity: UtilityEventDto['severity'],
    description: string
  ): Promise<UtilityEventDto> {
    const event: UtilityEventDto = {
      eventId: `evt-utl-${Date.now()}`,
      assetId,
      assetName,
      utilityType,
      eventType,
      severity,
      description,
      timestamp: new Date().toISOString(),
    };

    return memoryUtilityRepository.logEvent(event);
  }
}

export const utilityEventService = new UtilityEventService();
