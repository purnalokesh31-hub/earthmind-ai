import { IIncidentRepository, IncidentEntity, IncidentSearchFilter, PaginatedSearchResult } from '../../lib/server/repositories/incident.repository';
import { PaginatedResult, FindAllOptions } from '../../lib/server/repositories/base.repository';

export class MockIncidentRepository implements IIncidentRepository {
  private incidents = new Map<string, IncidentEntity>();
  private idCounter = 1;

  async findById(id: string): Promise<IncidentEntity | null> {
    return this.incidents.get(id) || null;
  }

  async findAll(options?: FindAllOptions): Promise<IncidentEntity[]> {
    return this.findMany(options);
  }

  async findMany(options?: FindAllOptions): Promise<IncidentEntity[]> {
    let result = Array.from(this.incidents.values());
    if (options?.offset) result = result.slice(options.offset);
    if (options?.limit) result = result.slice(0, options.limit);
    return result;
  }

  async create(data: Omit<IncidentEntity, 'id' | 'incidentCode' | 'createdAt' | 'updatedAt'>): Promise<IncidentEntity> {
    const id = `INC-mock-${Date.now()}-${this.idCounter++}`;
    const incident: IncidentEntity = {
      id,
      incidentCode: `EM-MOCK-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.incidents.set(id, incident);
    return incident;
  }

  async update(id: string, data: Partial<Omit<IncidentEntity, 'id' | 'incidentCode' | 'createdAt'>>): Promise<IncidentEntity> {
    const existing = this.incidents.get(id);
    if (!existing) throw new Error(`Incident ${id} not found`);
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.incidents.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.incidents.delete(id);
  }

  async count(): Promise<number> {
    return this.incidents.size;
  }

  async search(query: string, filter?: IncidentSearchFilter): Promise<IncidentEntity[]> {
    return Array.from(this.incidents.values()).filter((i) => {
      const matchesQuery = !query || i.title.includes(query) || i.description.includes(query);
      const matchesStatus = !filter?.status || i.status === filter.status;
      return matchesQuery && matchesStatus;
    });
  }

  async searchPaginated(query: string, filter?: IncidentSearchFilter): Promise<PaginatedSearchResult> {
    const items = await this.search(query, filter);
    const page = filter?.page || 1;
    const pageSize = filter?.pageSize || 20;
    const total = items.length;
    const paginated = items.slice((page - 1) * pageSize, page * pageSize);
    return {
      incidents: paginated,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async assignOfficer(incidentId: string, officerId: string, _assignedByUserId?: string, _note?: string): Promise<IncidentEntity> {
    const inc = this.incidents.get(incidentId);
    if (!inc) throw new Error(`Incident ${incidentId} not found`);
    inc.assignedOfficerId = officerId;
    inc.status = 'DISPATCHED';
    inc.updatedAt = new Date();
    return inc;
  }

  async changeStatus(incidentId: string, newStatus: string, _changedByUserId?: string, _note?: string): Promise<IncidentEntity> {
    const inc = this.incidents.get(incidentId);
    if (!inc) throw new Error(`Incident ${incidentId} not found`);
    inc.status = newStatus;
    inc.updatedAt = new Date();
    return inc;
  }

  async addTimelineEvent(_incidentId: string, _previousStatus: string, _newStatus: string, _changedByUserId?: string, _note?: string): Promise<void> {}

  async archive(incidentId: string, _archivedByUserId?: string, _note?: string): Promise<IncidentEntity> {
    return this.changeStatus(incidentId, 'ARCHIVED');
  }

  async restore(incidentId: string): Promise<IncidentEntity> {
    return this.changeStatus(incidentId, 'ACTIVE');
  }

  async findByStatus(status: string): Promise<IncidentEntity[]> {
    return Array.from(this.incidents.values()).filter((i) => i.status === status);
  }

  async findBySeverity(severity: string): Promise<IncidentEntity[]> {
    return Array.from(this.incidents.values()).filter((i) => i.severity === severity);
  }

  async findByDepartment(department: string): Promise<IncidentEntity[]> {
    return Array.from(this.incidents.values()).filter((i) => i.department === department);
  }

  async findCriticalIncidents(): Promise<IncidentEntity[]> {
    return Array.from(this.incidents.values()).filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH' || i.severity === 'critical' || i.severity === 'high');
  }

  async findByDateRange(from: Date, to: Date): Promise<IncidentEntity[]> {
    return Array.from(this.incidents.values()).filter(
      (i) => i.createdAt >= from && i.createdAt <= to
    );
  }

  async findPaginated(page: number, pageSize: number): Promise<PaginatedResult<IncidentEntity>> {
    const all = Array.from(this.incidents.values());
    const start = (page - 1) * pageSize;
    const data = all.slice(start, start + pageSize);
    return { data, total: all.length, page, pageSize };
  }
}
