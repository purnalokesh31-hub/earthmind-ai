import { IEvidenceRepository, EvidenceEntity } from '../../lib/server/repositories/evidence.repository';

export class MockEvidenceRepository implements IEvidenceRepository {
  private evidence = new Map<string, EvidenceEntity>();

  async findById(id: string): Promise<EvidenceEntity | null> {
    return this.evidence.get(id) || null;
  }

  async findAll(): Promise<EvidenceEntity[]> {
    return Array.from(this.evidence.values());
  }

  async create(data: Omit<EvidenceEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EvidenceEntity> {
    const item: EvidenceEntity = {
      id: `EV-mock-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.evidence.set(item.id, item);
    return item;
  }

  async update(id: string, data: Partial<Omit<EvidenceEntity, 'id' | 'createdAt'>>): Promise<EvidenceEntity> {
    const existing = this.evidence.get(id);
    if (!existing) throw new Error(`Evidence ${id} not found`);
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.evidence.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.evidence.delete(id);
  }

  async count(): Promise<number> {
    return this.evidence.size;
  }

  async findByIncidentId(incidentId: string): Promise<EvidenceEntity[]> {
    return Array.from(this.evidence.values()).filter((e) => e.linkedIncidentId === incidentId);
  }

  async findByStatus(status: EvidenceEntity['status']): Promise<EvidenceEntity[]> {
    return Array.from(this.evidence.values()).filter((e) => e.status === status);
  }

  async findByFileType(fileType: EvidenceEntity['fileType']): Promise<EvidenceEntity[]> {
    return Array.from(this.evidence.values()).filter((e) => e.fileType === fileType);
  }

  async findByUploader(userId: string): Promise<EvidenceEntity[]> {
    return Array.from(this.evidence.values()).filter((e) => e.uploadedByUserId === userId);
  }

  async updateStatus(id: string, status: EvidenceEntity['status']): Promise<void> {
    const item = this.evidence.get(id);
    if (item) item.status = status;
  }

  async linkToIncident(evidenceId: string, incidentId: string): Promise<void> {
    const item = this.evidence.get(evidenceId);
    if (item) item.linkedIncidentId = incidentId;
  }
}
