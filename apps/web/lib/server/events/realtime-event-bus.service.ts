// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Real-Time Operational Event Bus & Transport Engine
// Deduplicated, Ordered Event Dispatcher for Command Center Streaming
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export type RealTimeEventType =
  | 'INCIDENT_CREATED'
  | 'INCIDENT_STATUS_CHANGED'
  | 'AI_ANALYSIS_COMPLETED'
  | 'RISK_SCORE_UPDATED'
  | 'DISPATCH_ASSIGNED'
  | 'DISPATCH_ACKNOWLEDGED'
  | 'OFFICER_EN_ROUTE'
  | 'OFFICER_ON_SCENE'
  | 'SLA_WARNING'
  | 'SLA_BREACH'
  | 'DISPATCH_ESCALATED'
  | 'INCIDENT_RESOLVED'
  | 'NOTIFICATION_DELIVERED';

export interface RealTimeEventPayload {
  eventId: string;
  eventType: RealTimeEventType;
  incidentId: string;
  incidentCode: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  actor: string;
  message: string;
  timestamp: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

export type RealTimeEventCallback = (event: RealTimeEventPayload) => void;

export class RealTimeEventBusService {
  private subscribers: Set<RealTimeEventCallback> = new Set();
  private processedKeys: Set<string> = new Set();
  private eventHistory: RealTimeEventPayload[] = [];
  private connectionState: 'CONNECTED' | 'RECONNECTING' | 'OFFLINE' = 'CONNECTED';

  constructor() {
    this.seedInitialHistory();
  }

  private seedInitialHistory(): void {
    const mockEvents: Array<Omit<RealTimeEventPayload, 'eventId' | 'timestamp' | 'idempotencyKey'>> = [
      {
        eventType: 'INCIDENT_CREATED',
        incidentId: 'inc-101',
        incidentCode: 'EM-INC-2026-001',
        severity: 'CRITICAL',
        actor: 'Sentinel-2B Drone AI',
        message: 'Severe Road Subsidence detected at NH-9 Junction',
      },
      {
        eventType: 'DISPATCH_ASSIGNED',
        incidentId: 'inc-101',
        incidentCode: 'EM-INC-2026-001',
        severity: 'CRITICAL',
        actor: 'Autonomous Dispatch Engine',
        message: 'Assigned to Capt. Rajesh Varma (Score: 94/100)',
      },
      {
        eventType: 'DISPATCH_ACKNOWLEDGED',
        incidentId: 'inc-102',
        incidentCode: 'EM-INC-2026-002',
        severity: 'HIGH',
        actor: 'Insp. Ananya Rao',
        message: 'Officer acknowledged Water Main Breach dispatch',
      },
      {
        eventType: 'SLA_WARNING',
        incidentId: 'inc-101',
        incidentCode: 'EM-INC-2026-001',
        severity: 'CRITICAL',
        actor: 'SLA Engine',
        message: 'Ack SLA Warning: 5 minutes remaining before L1 escalation',
      },
    ];

    for (const raw of mockEvents) {
      const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      this.eventHistory.push({
        ...raw,
        eventId: id,
        timestamp: new Date().toISOString(),
        idempotencyKey: `idemp-${id}`,
      });
    }
  }

  subscribe(callback: RealTimeEventCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  publish(event: Omit<RealTimeEventPayload, 'eventId' | 'timestamp' | 'idempotencyKey'>, key?: string): RealTimeEventPayload {
    const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const idempotencyKey = key || `key-${id}`;

    if (this.processedKeys.has(idempotencyKey)) {
      logger.warn(`[RealTimeEventBus] Duplicate event blocked by key '${idempotencyKey}'`);
      return this.eventHistory.find((e) => e.idempotencyKey === idempotencyKey)!;
    }

    const payload: RealTimeEventPayload = {
      ...event,
      eventId: id,
      timestamp: new Date().toISOString(),
      idempotencyKey,
    };

    this.processedKeys.add(idempotencyKey);
    this.eventHistory.unshift(payload);

    if (this.eventHistory.length > 100) {
      this.eventHistory.pop();
    }

    Array.from(this.subscribers).forEach((callback) => {
      try {
        callback(payload);
      } catch (err) {
        logger.error(`[RealTimeEventBus] Subscriber error:`, err);
      }
    });

    logger.info(`[RealTimeEventBus] Published real-time event '${payload.eventType}' for incident '${payload.incidentCode}'`);
    return payload;
  }

  getRecentEvents(limit = 20): RealTimeEventPayload[] {
    return this.eventHistory.slice(0, limit);
  }

  getConnectionState(): 'CONNECTED' | 'RECONNECTING' | 'OFFLINE' {
    return this.connectionState;
  }
}

export const realTimeEventBusService = new RealTimeEventBusService();
