// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.8 City Intelligence Master Service
// ──────────────────────────────────────────────────────────────

export type { CityIntelligenceSummaryDto } from '../domain/digital-twin/cross-domain.domain';
import {
  CrossDomainSignalDto,
  CityIntelligenceSummaryDto,
} from '../domain/digital-twin/cross-domain.domain';
import { crossDomainCorrelationService } from './cross-domain-correlation.service';
import { citywideCascadeRiskService } from './citywide-cascade-risk.service';
import { urbanPriorityService } from './urban-priority.service';

export class CityIntelligenceService {
  async getCitywideIntelligence(cityId: string, inputSignals?: CrossDomainSignalDto[]): Promise<CityIntelligenceSummaryDto> {
    const signals: CrossDomainSignalDto[] = inputSignals || [
      {
        signalId: 'sig-clm-101',
        domain: 'CLIMATE',
        entityId: 'ast-clm-flood-01',
        entityName: 'Benz Circle Inundation Zone',
        eventType: 'EXTREME_RAINFALL_FLOOD',
        severity: 'CRITICAL',
        location: { lat: 16.506, lng: 80.648, zoneId: 'zone-w12' },
        value: 145.0,
        unit: 'mm/hr',
        timestamp: new Date().toISOString(),
      },
      {
        signalId: 'sig-mob-102',
        domain: 'MOBILITY',
        entityId: 'ast-mob-road-04',
        entityName: 'MG Road Arterial Corridor',
        eventType: 'TRAFFIC_CONGESTION_REROUTE',
        severity: 'HIGH',
        location: { lat: 16.508, lng: 80.645, zoneId: 'zone-w12' },
        value: 88.5,
        unit: 'Congestion Index',
        timestamp: new Date().toISOString(),
      },
      {
        signalId: 'sig-trn-103',
        domain: 'TRANSIT',
        entityId: 'ast-trn-route-12',
        entityName: 'BRT Route 12 City Circular',
        eventType: 'TRANSIT_DELAY',
        severity: 'HIGH',
        location: { lat: 16.510, lng: 80.642, zoneId: 'zone-w12' },
        value: 45.0,
        unit: 'Delay Minutes',
        timestamp: new Date().toISOString(),
      },
      {
        signalId: 'sig-utl-104',
        domain: 'UTILITY',
        entityId: 'ast-pow-tx-102',
        entityName: 'Ward 12 Substation Transformer TX-4',
        eventType: 'TRANSFORMER_THERMAL_RUNAWAY',
        severity: 'CRITICAL',
        location: { lat: 16.505, lng: 80.650, zoneId: 'zone-w12' },
        value: 92.4,
        unit: 'Celsius',
        timestamp: new Date().toISOString(),
      },
    ];

    const activeCorrelations = crossDomainCorrelationService.correlateSignals(signals);
    const overallCascadeRisk = citywideCascadeRiskService.calculateCascadeRisk(activeCorrelations);
    const priorityQueue = urbanPriorityService.calculatePriorityQueue(cityId, activeCorrelations);

    return {
      cityId,
      cityName: cityId === 'city-vja' ? 'Vijayawada Municipal Corporation' : 'Visakhapatnam Metropolitan Region',
      overallCascadeRisk,
      activeCorrelations,
      priorityQueue,
      timestamp: new Date().toISOString(),
    };
  }
}

export const cityIntelligenceService = new CityIntelligenceService();
