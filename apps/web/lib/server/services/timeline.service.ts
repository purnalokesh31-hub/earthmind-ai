// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Immutable Incident Timeline Engine
// Automatically generates and records timeline events for incident lifecycle
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../database/prisma';
import { logger } from '../logger';

export type TimelineEventType =
  | 'INCIDENT_CREATED'
  | 'INCIDENT_VERIFIED'
  | 'OFFICER_ASSIGNED'
  | 'INVESTIGATION_STARTED'
  | 'EVIDENCE_ADDED'
  | 'AI_ANALYSIS_COMPLETED'
  | 'INCIDENT_RESOLVED'
  | 'INCIDENT_ARCHIVED'
  | 'INCIDENT_RESTORED'
  | 'INCIDENT_MERGED'
  | string;

export interface CreateTimelineEventDto {
  incidentId: string;
  action: TimelineEventType;
  actorId?: string;
  previousStatus?: string;
  newStatus?: string;
  note?: string;
  metadata?: Record<string, any>;
}

export interface TimelineEventDto {
  id: string;
  incidentId: string;
  action: TimelineEventType;
  actorId?: string | null;
  previousStatus?: string | null;
  newStatus?: string | null;
  note?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface ITimelineService {
  recordEvent(dto: CreateTimelineEventDto): Promise<TimelineEventDto>;
  getTimelineForIncident(incidentId: string): Promise<TimelineEventDto[]>;
}

export class TimelineService implements ITimelineService {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  /**
   * Appends an immutable timeline event to the incident timeline log.
   * Immutable design: Events are append-only. No update/delete logic exists.
   */
  async recordEvent(dto: CreateTimelineEventDto): Promise<TimelineEventDto> {
    const formattedNote = dto.metadata
      ? `${dto.note || ''} [meta:${JSON.stringify(dto.metadata)}]`.trim()
      : dto.note;

    const created = await this.prisma.incidentTimeline.create({
      data: {
        incidentId: dto.incidentId,
        action: dto.action,
        actorId: dto.actorId || undefined,
        previousStatus: dto.previousStatus || undefined,
        newStatus: dto.newStatus || undefined,
        note: formattedNote || undefined,
      },
    });

    logger.info(
      `[TimelineEngine] Immutable event recorded: ${dto.action} for Incident ${dto.incidentId} by Actor ${dto.actorId || 'SYSTEM'}`
    );

    return {
      id: created.id,
      incidentId: created.incidentId,
      action: created.action as TimelineEventType,
      actorId: created.actorId,
      previousStatus: created.previousStatus,
      newStatus: created.newStatus,
      note: created.note,
      metadata: dto.metadata || null,
      createdAt: created.createdAt.toISOString(),
    };
  }

  /**
   * Fetches the complete chronological history of immutable timeline events for an incident.
   */
  async getTimelineForIncident(incidentId: string): Promise<TimelineEventDto[]> {
    const events = await this.prisma.incidentTimeline.findMany({
      where: { incidentId },
      orderBy: { createdAt: 'asc' },
      include: { actor: { select: { id: true, fullName: true, email: true, role: true } } },
    });

    return events.map((event) => {
      let metadata: Record<string, any> | null = null;
      let cleanNote = event.note;

      if (cleanNote && cleanNote.includes('[meta:')) {
        const metaMatch = cleanNote.match(/\[meta:(.*)\]/);
        if (metaMatch) {
          try {
            metadata = JSON.parse(metaMatch[1]);
            cleanNote = cleanNote.replace(/\[meta:.*\]/, '').trim();
          } catch {
            // fallback if JSON parse fails
          }
        }
      }

      return {
        id: event.id,
        incidentId: event.incidentId,
        action: event.action as TimelineEventType,
        actorId: event.actorId,
        previousStatus: event.previousStatus,
        newStatus: event.newStatus,
        note: cleanNote,
        metadata,
        createdAt: event.createdAt.toISOString(),
      };
    });
  }
}
