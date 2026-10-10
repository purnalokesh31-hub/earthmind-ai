// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Multi-Agency Coordination Domain Entity
// ──────────────────────────────────────────────────────────────

import { AgencyParticipationProps, MultiAgencyCoordinationProps } from './coordination.types';

export class CoordinationEntity {
  private props: MultiAgencyCoordinationProps;

  constructor(props: MultiAgencyCoordinationProps) {
    this.props = { ...props };
  }

  get coordinationId(): string { return this.props.coordinationId; }
  get incidentId(): string { return this.props.incidentId; }
  get primaryDepartmentId(): string { return this.props.primaryDepartmentId; }
  get participatingAgencies(): AgencyParticipationProps[] { return this.props.participatingAgencies; }
  get isSynchronized(): boolean { return this.props.isSynchronized; }

  addAgency(agency: AgencyParticipationProps): void {
    const exists = this.props.participatingAgencies.some((a) => a.departmentId === agency.departmentId);
    if (!exists) {
      this.props.participatingAgencies.push(agency);
    }
  }

  acknowledgeAgency(departmentId: string): boolean {
    const agency = this.props.participatingAgencies.find((a) => a.departmentId === departmentId);
    if (agency) {
      agency.status = 'ACKNOWLEDGED';
      agency.acknowledgedAt = new Date();
      return true;
    }
    return false;
  }

  completeAgency(departmentId: string): boolean {
    const agency = this.props.participatingAgencies.find((a) => a.departmentId === departmentId);
    if (agency) {
      agency.status = 'COMPLETED';
      agency.completedAt = new Date();
      return true;
    }
    return false;
  }

  toProps(): MultiAgencyCoordinationProps {
    return { ...this.props };
  }
}
