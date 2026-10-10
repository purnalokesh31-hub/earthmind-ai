// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Incident Repository Interface & Implementation
// Pure Data Access Layer (Zero Business Logic)
// ──────────────────────────────────────────────────────────────

import { PrismaClient, IncidentStatus as PrismaStatus, Severity as PrismaSeverity } from '@prisma/client';
import { prisma as defaultPrisma } from '../database/prisma';
import type { IBaseRepository, FindAllOptions, PaginatedResult } from './base.repository';

// ── Entity Shape ──────────────────────────────────────────────
export interface IncidentEntity {
  id: string;
  incidentCode: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  category: string;
  subcategory?: string | null;
  department: string;
  departmentId?: string | null;
  riskScore: number;
  locationName: string;
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  createdById?: string | null;
  assignedOfficerId?: string | null;
  aiSummary?: string | null;
  repairCostEstimate?: number | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentSearchFilter {
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'riskScore' | 'severity' | 'status' | 'title' | string;
  sortOrder?: 'asc' | 'desc';
  status?: string | string[];
  severity?: string | string[];
  category?: string | string[];
  department?: string;
  departmentId?: string;
  assignedOfficerId?: string;
  createdById?: string;
  from?: Date;
  to?: Date;
  minRiskScore?: number;
  maxRiskScore?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface PaginatedSearchResult {
  incidents: IncidentEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Interface Contract ─────────────────────────────────────────
export interface IIncidentRepository extends IBaseRepository<IncidentEntity> {
  findById(id: string): Promise<IncidentEntity | null>;
  findMany(options?: FindAllOptions): Promise<IncidentEntity[]>;
  create(data: Omit<IncidentEntity, 'id' | 'incidentCode' | 'createdAt' | 'updatedAt'>): Promise<IncidentEntity>;
  update(id: string, data: Partial<Omit<IncidentEntity, 'id' | 'incidentCode' | 'createdAt'>>): Promise<IncidentEntity>;
  delete(id: string): Promise<boolean>;
  search(query: string, filter?: IncidentSearchFilter): Promise<IncidentEntity[]>;
  searchPaginated(query: string, filter?: IncidentSearchFilter): Promise<PaginatedSearchResult>;
  assignOfficer(incidentId: string, officerId: string, assignedByUserId?: string, note?: string): Promise<IncidentEntity>;
  changeStatus(incidentId: string, newStatus: string, changedByUserId?: string, note?: string): Promise<IncidentEntity>;
  addTimelineEvent(incidentId: string, previousStatus: string, newStatus: string, changedByUserId?: string, note?: string): Promise<void>;
  archive(incidentId: string, archivedByUserId?: string, note?: string): Promise<IncidentEntity>;
  restore(incidentId: string): Promise<IncidentEntity>;
  findByStatus(status: string): Promise<IncidentEntity[]>;
  findBySeverity(severity: string): Promise<IncidentEntity[]>;
  findByDepartment(department: string): Promise<IncidentEntity[]>;
  findCriticalIncidents(): Promise<IncidentEntity[]>;
  findByDateRange(from: Date, to: Date): Promise<IncidentEntity[]>;
  findPaginated(page: number, pageSize: number): Promise<PaginatedResult<IncidentEntity>>;
}

// ── Prisma Implementation ─────────────────────────────────────
export class PrismaIncidentRepository implements IIncidentRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  private mapPrismaStatus(status: string): PrismaStatus {
    const s = status.toUpperCase();
    if (s in PrismaStatus) {
      return PrismaStatus[s as keyof typeof PrismaStatus];
    }
    return PrismaStatus.ACTIVE;
  }

  private mapPrismaSeverity(severity: string): PrismaSeverity {
    const s = severity.toUpperCase();
    if (s in PrismaSeverity) {
      return PrismaSeverity[s as keyof typeof PrismaSeverity];
    }
    return PrismaSeverity.MEDIUM;
  }

  private mapToEntity(inc: any): IncidentEntity {
    return {
      id: inc.id,
      incidentCode: inc.incidentCode,
      title: inc.title,
      description: inc.description,
      status: inc.status,
      severity: inc.severity,
      category: inc.category,
      subcategory: inc.subcategory,
      department: inc.department,
      departmentId: inc.departmentId,
      riskScore: inc.riskScore,
      locationName: inc.locationName,
      lat: inc.latitude,
      lng: inc.longitude,
      address: inc.address,
      createdById: inc.createdById,
      assignedOfficerId: inc.assignedOfficerId,
      aiSummary: inc.aiSummary,
      repairCostEstimate: inc.repairCostEstimate,
      deletedAt: inc.deletedAt,
      createdAt: inc.createdAt,
      updatedAt: inc.updatedAt,
    };
  }

  async findById(id: string): Promise<IncidentEntity | null> {
    const inc = await this.client.incident.findUnique({
      where: { id },
      include: {
        timeline: { orderBy: { createdAt: 'desc' } },
        assignments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!inc || inc.deletedAt) return null;
    return this.mapToEntity(inc);
  }

  async findAll(options?: FindAllOptions): Promise<IncidentEntity[]> {
    return this.findMany(options);
  }

  async findMany(options?: FindAllOptions): Promise<IncidentEntity[]> {
    const incidents = await this.client.incident.findMany({
      where: { deletedAt: null },
      take: options?.limit,
      skip: options?.offset,
      orderBy: { createdAt: 'desc' },
    });
    return incidents.map((i) => this.mapToEntity(i));
  }

  async create(data: Omit<IncidentEntity, 'id' | 'incidentCode' | 'createdAt' | 'updatedAt'>): Promise<IncidentEntity> {
    const inc = await this.client.incident.create({
      data: {
        title: data.title,
        description: data.description,
        status: this.mapPrismaStatus(data.status),
        severity: this.mapPrismaSeverity(data.severity),
        category: data.category,
        subcategory: data.subcategory || undefined,
        department: data.department || 'GENERAL',
        departmentId: data.departmentId || undefined,
        riskScore: data.riskScore || 0,
        locationName: data.locationName,
        latitude: data.lat || undefined,
        longitude: data.lng || undefined,
        address: data.address || undefined,
        createdById: data.createdById || undefined,
        assignedOfficerId: data.assignedOfficerId || undefined,
        aiSummary: data.aiSummary || undefined,
        repairCostEstimate: data.repairCostEstimate || undefined,
      },
    });
    return this.mapToEntity(inc);
  }

  async update(id: string, data: Partial<Omit<IncidentEntity, 'id' | 'incidentCode' | 'createdAt'>>): Promise<IncidentEntity> {
    const inc = await this.client.incident.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.status ? { status: this.mapPrismaStatus(data.status) } : {}),
        ...(data.severity ? { severity: this.mapPrismaSeverity(data.severity) } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.subcategory !== undefined ? { subcategory: data.subcategory } : {}),
        ...(data.department ? { department: data.department } : {}),
        ...(data.departmentId !== undefined ? { departmentId: data.departmentId } : {}),
        ...(data.riskScore !== undefined ? { riskScore: data.riskScore } : {}),
        ...(data.locationName ? { locationName: data.locationName } : {}),
        ...(data.lat !== undefined ? { latitude: data.lat } : {}),
        ...(data.lng !== undefined ? { longitude: data.lng } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.aiSummary !== undefined ? { aiSummary: data.aiSummary } : {}),
        ...(data.repairCostEstimate !== undefined ? { repairCostEstimate: data.repairCostEstimate } : {}),
        ...(data.assignedOfficerId !== undefined ? { assignedOfficerId: data.assignedOfficerId } : {}),
      },
    });
    return this.mapToEntity(inc);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.client.incident.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }

  async count(): Promise<number> {
    return this.client.incident.count({ where: { deletedAt: null } });
  }

  private buildWhereClause(query: string, filter?: IncidentSearchFilter) {
    const where: any = {
      deletedAt: null,
      AND: [],
    };

    if (query && query.trim().length > 0) {
      const q = query.trim();
      where.AND.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { locationName: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { incidentCode: { contains: q, mode: 'insensitive' } },
          { aiSummary: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    if (filter?.status) {
      if (Array.isArray(filter.status)) {
        where.AND.push({ status: { in: filter.status.map((s) => this.mapPrismaStatus(s)) } });
      } else {
        where.AND.push({ status: this.mapPrismaStatus(filter.status) });
      }
    }

    if (filter?.severity) {
      if (Array.isArray(filter.severity)) {
        where.AND.push({ severity: { in: filter.severity.map((s) => this.mapPrismaSeverity(s)) } });
      } else {
        where.AND.push({ severity: this.mapPrismaSeverity(filter.severity) });
      }
    }

    if (filter?.category) {
      if (Array.isArray(filter.category)) {
        where.AND.push({ category: { in: filter.category } });
      } else {
        where.AND.push({ category: filter.category });
      }
    }

    if (filter?.department) {
      where.AND.push({ department: filter.department });
    }

    if (filter?.departmentId) {
      where.AND.push({ departmentId: filter.departmentId });
    }

    if (filter?.assignedOfficerId) {
      where.AND.push({ assignedOfficerId: filter.assignedOfficerId });
    }

    if (filter?.createdById) {
      where.AND.push({ createdById: filter.createdById });
    }

    if (filter?.from || filter?.to) {
      where.AND.push({
        createdAt: {
          ...(filter.from ? { gte: filter.from } : {}),
          ...(filter.to ? { lte: filter.to } : {}),
        },
      });
    }

    if (filter?.minRiskScore !== undefined || filter?.maxRiskScore !== undefined) {
      where.AND.push({
        riskScore: {
          ...(filter.minRiskScore !== undefined ? { gte: filter.minRiskScore } : {}),
          ...(filter.maxRiskScore !== undefined ? { lte: filter.maxRiskScore } : {}),
        },
      });
    }

    // High-performance Bounding Box Spatial Index Query (lat/lng)
    if (filter?.lat !== undefined && filter?.lng !== undefined && filter?.radiusKm) {
      const radiusKm = filter.radiusKm;
      const latDelta = radiusKm / 111.0;
      const lngDelta = radiusKm / (111.0 * Math.cos((filter.lat * Math.PI) / 180.0));

      where.AND.push({
        latitude: { gte: filter.lat - latDelta, lte: filter.lat + latDelta },
        longitude: { gte: filter.lng - lngDelta, lte: filter.lng + lngDelta },
      });
    }

    return where;
  }

  async search(query: string, filter?: IncidentSearchFilter): Promise<IncidentEntity[]> {
    const where = this.buildWhereClause(query, filter);
    const incidents = await this.client.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return incidents.map((i) => this.mapToEntity(i));
  }

  async searchPaginated(query: string, filter?: IncidentSearchFilter): Promise<PaginatedSearchResult> {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const pageSize = filter?.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;
    const skip = (page - 1) * pageSize;
    const sortField = filter?.sortBy || 'createdAt';
    const sortOrder = filter?.sortOrder === 'asc' ? 'asc' : 'desc';

    const where = this.buildWhereClause(query, filter);

    const [items, total] = await Promise.all([
      this.client.incident.findMany({
        where,
        take: pageSize,
        skip,
        orderBy: { [sortField]: sortOrder },
      }),
      this.client.incident.count({ where }),
    ]);

    return {
      incidents: items.map((i) => this.mapToEntity(i)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async assignOfficer(
    incidentId: string,
    officerId: string,
    assignedByUserId?: string,
    note?: string
  ): Promise<IncidentEntity> {
    return this.client.$transaction(async (tx) => {
      const updated = await tx.incident.update({
        where: { id: incidentId },
        data: {
          assignedOfficerId: officerId,
          status: PrismaStatus.DISPATCHED,
        },
      });

      if (assignedByUserId) {
        await tx.assignment.create({
          data: {
            incidentId,
            assigneeId: officerId,
            assignedById: assignedByUserId,
            role: 'FIELD_OFFICER',
            status: 'ASSIGNED',
            notes: note || undefined,
          },
        });
      }

      await tx.incidentTimeline.create({
        data: {
          incidentId,
          action: 'OFFICER_ASSIGNED',
          actorId: assignedByUserId || officerId,
          newStatus: PrismaStatus.DISPATCHED,
          note: note || `Assigned to officer ${officerId}`,
        },
      });

      return this.mapToEntity(updated);
    });
  }

  async changeStatus(
    incidentId: string,
    newStatus: string,
    changedByUserId?: string,
    note?: string
  ): Promise<IncidentEntity> {
    return this.client.$transaction(async (tx) => {
      const current = await tx.incident.findUnique({ where: { id: incidentId } });
      const targetStatus = this.mapPrismaStatus(newStatus);

      const updated = await tx.incident.update({
        where: { id: incidentId },
        data: { status: targetStatus },
      });

      await tx.incidentTimeline.create({
        data: {
          incidentId,
          action: 'STATUS_CHANGED',
          actorId: changedByUserId || undefined,
          previousStatus: current?.status,
          newStatus: targetStatus,
          note: note || `Status updated to ${newStatus}`,
        },
      });

      return this.mapToEntity(updated);
    });
  }

  async addTimelineEvent(
    incidentId: string,
    previousStatus: string,
    newStatus: string,
    changedByUserId?: string,
    note?: string
  ): Promise<void> {
    await this.client.incidentTimeline.create({
      data: {
        incidentId,
        action: 'TIMELINE_EVENT',
        actorId: changedByUserId || undefined,
        previousStatus: previousStatus || undefined,
        newStatus: newStatus || undefined,
        note: note || undefined,
      },
    });
  }

  async archive(incidentId: string, archivedByUserId?: string, note?: string): Promise<IncidentEntity> {
    return this.changeStatus(incidentId, 'ARCHIVED', archivedByUserId, note || 'Incident archived');
  }

  async restore(incidentId: string): Promise<IncidentEntity> {
    return this.client.$transaction(async (tx) => {
      const restored = await tx.incident.update({
        where: { id: incidentId },
        data: {
          deletedAt: null,
          status: PrismaStatus.ACTIVE,
        },
      });

      await tx.incidentTimeline.create({
        data: {
          incidentId,
          action: 'INCIDENT_RESTORED',
          newStatus: PrismaStatus.ACTIVE,
          note: 'Incident restored from archive/deletion',
        },
      });

      return this.mapToEntity(restored);
    });
  }

  async findByStatus(status: string): Promise<IncidentEntity[]> {
    const incidents = await this.client.incident.findMany({
      where: { status: this.mapPrismaStatus(status), deletedAt: null },
    });
    return incidents.map((i) => this.mapToEntity(i));
  }

  async findBySeverity(severity: string): Promise<IncidentEntity[]> {
    const incidents = await this.client.incident.findMany({
      where: { severity: this.mapPrismaSeverity(severity), deletedAt: null },
    });
    return incidents.map((i) => this.mapToEntity(i));
  }

  async findByDepartment(department: string): Promise<IncidentEntity[]> {
    const incidents = await this.client.incident.findMany({
      where: { department, deletedAt: null },
    });
    return incidents.map((i) => this.mapToEntity(i));
  }

  async findCriticalIncidents(): Promise<IncidentEntity[]> {
    const incidents = await this.client.incident.findMany({
      where: { severity: { in: ['CRITICAL', 'HIGH'] }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return incidents.map((i) => this.mapToEntity(i));
  }

  async findByDateRange(from: Date, to: Date): Promise<IncidentEntity[]> {
    const incidents = await this.client.incident.findMany({
      where: { createdAt: { gte: from, lte: to }, deletedAt: null },
    });
    return incidents.map((i) => this.mapToEntity(i));
  }

  async findPaginated(page: number, pageSize: number): Promise<PaginatedResult<IncidentEntity>> {
    const res = await this.searchPaginated('', { page, pageSize });
    return {
      data: res.incidents,
      total: res.total,
      page: res.page,
      pageSize: res.pageSize,
    };
  }
}
