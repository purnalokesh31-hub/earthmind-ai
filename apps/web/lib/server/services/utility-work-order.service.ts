// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Work Order Generation Service
// ──────────────────────────────────────────────────────────────

import { UtilityWorkOrderDto } from '../domain/digital-twin/utility-operations.domain';

export class UtilityWorkOrderService {
  createWorkOrder(recommendationId: string, assetId: string, authorizedByUserId: string): UtilityWorkOrderDto {
    return {
      workOrderId: `wo-utl-${Date.now()}`,
      approvedRecommendationId: recommendationId,
      utilityAssetId: assetId,
      actionType: 'REROUTE_AND_COOLING_OVERRIDE',
      priority: 'HIGH',
      assignedTeam: 'Electrical Grid Operations Team 2',
      requiredEquipment: ['Scada Inter-tie Signal', 'Mobile Radiator Fan Controller'],
      estimatedDurationHours: 1.5,
      estimatedCostUsd: 3200,
      authorizationUser: authorizedByUserId,
      authorizationTimestamp: new Date().toISOString(),
      status: 'AUTHORIZED',
    };
  }
}

export const utilityWorkOrderService = new UtilityWorkOrderService();
