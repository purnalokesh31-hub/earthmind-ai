// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Dispatch Repository Interface Contract
// ──────────────────────────────────────────────────────────────

import { DispatchEntityProps, DispatchStatusType } from '../../domain/dispatch/dispatch.types';

export interface IDispatchRepository {
  create(props: Omit<DispatchEntityProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<DispatchEntityProps>;
  findById(id: string): Promise<DispatchEntityProps | null>;
  findByIncidentId(incidentId: string): Promise<DispatchEntityProps[]>;
  findActive(): Promise<DispatchEntityProps[]>;
  findByOfficer(officerId: string): Promise<DispatchEntityProps[]>;
  findByDepartment(departmentId: string): Promise<DispatchEntityProps[]>;
  updateStatus(id: string, status: DispatchStatusType): Promise<DispatchEntityProps>;
  assign(id: string, officerId: string, departmentId?: string): Promise<DispatchEntityProps>;
  reassign(id: string, newOfficerId: string, reason?: string): Promise<DispatchEntityProps>;
  escalate(id: string, newLevel: number, reason?: string): Promise<DispatchEntityProps>;
  countActive(): Promise<number>;
  searchPaginated(page?: number, limit?: number): Promise<{ data: DispatchEntityProps[]; total: number }>;
}
