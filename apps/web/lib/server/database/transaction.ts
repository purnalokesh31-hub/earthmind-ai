// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Transaction Layer & Atomic Helpers
// Ensures all multi-entity mutations execute atomically with ACID rollback
// ──────────────────────────────────────────────────────────────

import { Prisma, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from './prisma';
import { logger } from '../logger';

export type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Generic Transaction Runner — Wraps an operation in a Prisma $transaction.
 * If any error is thrown within the callback, all mutations are automatically rolled back.
 */
export async function executeInTransaction<T>(
  callback: (tx: PrismaTransactionClient) => Promise<T>,
  prismaClient: PrismaClient = defaultPrisma
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await prismaClient.$transaction(async (tx) => {
      return await callback(tx as unknown as PrismaTransactionClient);
    });

    const duration = Date.now() - startTime;
    logger.info(`[Transaction] Executed successfully in ${duration}ms`);
    return result;
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    logger.error(`[Transaction Rollback] Transaction failed after ${duration}ms`, error);
    throw error;
  }
}

// ── 1. Atomic Incident Creation Transaction Input ─────────────
export interface CreateIncidentTxInput {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  department: string;
  departmentId?: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  createdById: string;
  assignedOfficerId?: string;
  actorEmail?: string;
  actorRole?: string;
}

/**
 * Creates Incident, Timeline entry, Notification, and AuditLog atomically.
 */
export async function createIncidentTransaction(
  input: CreateIncidentTxInput,
  prismaClient: PrismaClient = defaultPrisma
) {
  return executeInTransaction(async (tx: any) => {
    // 1. Create Incident
    const incident = await tx.incident.create({
      data: {
        title: input.title,
        description: input.description,
        category: input.category,
        subcategory: input.subcategory,
        severity: input.severity || 'MEDIUM',
        status: 'ACTIVE',
        department: input.department,
        departmentId: input.departmentId,
        locationName: input.locationName,
        latitude: input.latitude,
        longitude: input.longitude,
        createdById: input.createdById,
        assignedOfficerId: input.assignedOfficerId,
      },
    });

    // 2. Add Initial Timeline Entry
    await tx.incidentTimeline.create({
      data: {
        incidentId: incident.id,
        action: 'INCIDENT_CREATED',
        actorId: input.createdById,
        newStatus: 'ACTIVE',
        note: `Incident created: ${input.title}`,
      },
    });

    // 3. Create Notification for Assigned Officer or Department Supervisors
    if (input.assignedOfficerId) {
      await tx.notification.create({
        data: {
          type: 'INCIDENT_DISPATCHED',
          title: 'New Incident Assigned',
          message: `You have been assigned to incident ${incident.incidentCode}: ${incident.title}`,
          severity: input.severity === 'CRITICAL' ? 'critical' : 'high',
          recipientId: input.assignedOfficerId,
          linkedEntityId: incident.id,
          linkedEntityType: 'INCIDENT',
          channelPush: true,
          channelEmail: true,
        },
      });
    }

    // 4. Record Immutable Audit Log
    await tx.auditLog.create({
      data: {
        action: 'CREATE_INCIDENT',
        category: 'INCIDENT',
        actorId: input.createdById,
        actorEmail: input.actorEmail || 'system@earthmind.gov',
        actorRole: input.actorRole || 'FIELD_OFFICER',
        targetId: incident.id,
        targetType: 'INCIDENT',
        description: `Incident ${incident.incidentCode} created successfully`,
        meta: {
          incidentCode: incident.incidentCode,
          severity: incident.severity,
          department: incident.department,
        },
      },
    });

    return incident;
  }, prismaClient);
}

// ── 2. Atomic Evidence Upload Transaction Input ───────────────
export interface UploadEvidenceTxInput {
  fileName: string;
  fileType: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'SENSOR';
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  linkedIncidentId?: string;
  uploadedByUserId: string;
  actorEmail?: string;
  actorRole?: string;
}

/**
 * Creates EvidenceItem, links to Incident, adds Timeline entry, and logs AuditLog atomically.
 */
export async function uploadEvidenceTransaction(
  input: UploadEvidenceTxInput,
  prismaClient: PrismaClient = defaultPrisma
) {
  return executeInTransaction(async (tx: any) => {
    // 1. Create Evidence Item
    const evidence = await tx.evidenceItem.create({
      data: {
        fileName: input.fileName,
        fileType: input.fileType,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        storageUrl: input.storageUrl,
        status: 'PENDING',
        linkedIncidentId: input.linkedIncidentId,
        uploadedByUserId: input.uploadedByUserId,
      },
    });

    // 2. If Linked to Incident, add Timeline entry
    if (input.linkedIncidentId) {
      await tx.incidentTimeline.create({
        data: {
          incidentId: input.linkedIncidentId,
          action: 'EVIDENCE_ATTACHED',
          actorId: input.uploadedByUserId,
          note: `Attached ${input.fileType} evidence: ${input.fileName}`,
        },
      });
    }

    // 3. Record Audit Log
    await tx.auditLog.create({
      data: {
        action: 'UPLOAD_EVIDENCE',
        category: 'EVIDENCE',
        actorId: input.uploadedByUserId,
        actorEmail: input.actorEmail || 'system@earthmind.gov',
        actorRole: input.actorRole || 'FIELD_OFFICER',
        targetId: evidence.id,
        targetType: 'EVIDENCE_ITEM',
        description: `Uploaded evidence file ${input.fileName}`,
        meta: {
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          linkedIncidentId: input.linkedIncidentId,
        },
      },
    });

    return evidence;
  }, prismaClient);
}
