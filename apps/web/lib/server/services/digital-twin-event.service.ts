// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Digital Twin Event Engine
// Generates Immutable Audit Events for Twin Entities
// ──────────────────────────────────────────────────────────────

import { TwinEventDto } from '../domain/digital-twin/digital-twin.domain';

export class DigitalTwinEventService {
  private events: TwinEventDto[] = [
    {
      eventId: 'evt-dt-1',
      entityId: 'ast-rd-101',
      eventType: 'ASSET_DAMAGED',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      source: 'AI_VISION_ENGINE',
      details: 'Road deformation detected by AI Vision drone telemetry.',
    },
    {
      eventId: 'evt-dt-2',
      entityId: 'ast-drn-102',
      eventType: 'TELEMETRY_UPDATED',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      source: 'IOT_WATER_SENSOR',
      details: 'Water level exceeded 4.5m threshold in Ward 12 Culvert.',
    },
  ];

  async emitEvent(entityId: string, eventType: TwinEventDto['eventType'], details: string, source = 'SYSTEM'): Promise<TwinEventDto> {
    const evt: TwinEventDto = {
      eventId: `evt-dt-${Date.now()}`,
      entityId,
      eventType,
      timestamp: new Date().toISOString(),
      source,
      details,
    };

    this.events.push(evt);
    return evt;
  }

  async listEvents(entityId?: string): Promise<TwinEventDto[]> {
    if (entityId) return this.events.filter((e) => e.entityId === entityId);
    return this.events;
  }
}

export const digitalTwinEventService = new DigitalTwinEventService();
