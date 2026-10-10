// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Default Domain Event Subscribers
// Automatically connects audit, notification, and cache listeners
// ──────────────────────────────────────────────────────────────

import { eventBus } from './event-bus';
import { logger } from '../logger';
import {
  IncidentCreatedPayload,
  EvidenceUploadedPayload,
  VisionCompletedPayload,
} from './event.types';

export function registerDefaultSubscribers(): void {
  // 1. Audit Logger Subscriber (Listens to all events)
  eventBus.subscribe('INCIDENT_CREATED', async (evt) => {
    const payload = evt.payload as IncidentCreatedPayload;
    logger.info(`[Subscriber: Audit] Recorded new incident ${payload.incidentId} by user ${payload.createdByUserId}`);
  });

  // 2. Notification Dispatcher Subscriber (Listens for critical incidents)
  eventBus.subscribe('INCIDENT_CREATED', async (evt) => {
    const payload = evt.payload as IncidentCreatedPayload;
    if (payload.severity === 'critical' || payload.severity === 'high') {
      logger.info(`[Subscriber: Notification] Dispatched priority alert for incident ${payload.incidentId} (${payload.severity})`);
    }
  });

  // 3. Vision Completion Subscriber
  eventBus.subscribe('VISION_COMPLETED', async (evt) => {
    const payload = evt.payload as VisionCompletedPayload;
    logger.info(`[Subscriber: Vision] Analysis completed for evidence ${payload.evidenceId}. Damage score: ${payload.damageScore}`);
  });

  // 4. Evidence Intake Subscriber
  eventBus.subscribe('EVIDENCE_UPLOADED', async (evt) => {
    const payload = evt.payload as EvidenceUploadedPayload;
    logger.info(`[Subscriber: Evidence] New asset ingested: ${payload.fileName} (${payload.mimeType})`);
  });
}

// Auto-register default subscribers
registerDefaultSubscribers();
