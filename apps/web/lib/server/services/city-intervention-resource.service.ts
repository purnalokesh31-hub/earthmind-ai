// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 4/6
// City Intervention Resource Allocation Service
// ──────────────────────────────────────────────────────────────

import {
  CityInterventionActionDto,
  CityInterventionResourceDto,
} from '../domain/digital-twin/city-intervention.domain';
import { logger } from '../logger';

export interface ResourceAllocationAnalysisResult {
  resources: CityInterventionResourceDto[];
  totalCostUsd: number;
  hasResourceShortage: boolean;
  shortageDetails: Array<{
    resourceType: string;
    shortageQuantity: number;
    affectedActionId: string;
    advisoryAlternative: string;
  }>;
}

export class CityInterventionResourceService {
  private availableInventory: Record<string, number> = {
    'Heavy Pump Truck': 3,
    'Drainage Crew Alpha': 5,
    'Traffic Police Detail': 6,
    'VMS Display Boards': 8,
    'Electrical Engineering Crew': 3,
    'SCADA Switching Controller': 2,
    'Ambulance Unit': 4,
    'Rescue Boat Crew': 4,
    'Mobile Generator Unit': 2,
    'Road Safety Barrier': 12,
  };

  public allocateResources(actions: CityInterventionActionDto[]): ResourceAllocationAnalysisResult {
    const resources: CityInterventionResourceDto[] = [];
    let totalCostUsd = 0;
    let hasResourceShortage = false;
    const shortageDetails: ResourceAllocationAnalysisResult['shortageDetails'] = [];

    for (const act of actions) {
      for (const req of act.requiredResources) {
        const match = req.match(/^(.*?)\s*\((\d+)\)$/);
        let resourceType = req;
        let requiredQuantity = 1;

        if (match) {
          resourceType = match[1].trim();
          requiredQuantity = parseInt(match[2], 10);
        }

        const available = this.availableInventory[resourceType] ?? 2;
        const shortage = Math.max(0, requiredQuantity - available);
        const constraintStatus = shortage > 0 ? 'SHORTAGE' : available === requiredQuantity ? 'CONSTRAINED' : 'AVAILABLE';

        if (shortage > 0) {
          hasResourceShortage = true;
          shortageDetails.push({
            resourceType,
            shortageQuantity: shortage,
            affectedActionId: act.actionId,
            advisoryAlternative: `Request mutual aid allocation for ${shortage} unit(s) of '${resourceType}' from neighboring municipal district.`,
          });
        }

        const costForResource = Math.round((act.estimatedCostUsd / (act.requiredResources.length || 1)) * 100) / 100;
        totalCostUsd += costForResource;

        let crewCat = 'Engineering';
        if (resourceType.includes('Police') || resourceType.includes('Traffic')) crewCat = 'Public Safety';
        else if (resourceType.includes('Electrical') || resourceType.includes('SCADA')) crewCat = 'Utility';
        else if (resourceType.includes('Ambulance') || resourceType.includes('Rescue')) crewCat = 'Emergency';

        resources.push({
          resourceType,
          requiredQuantity,
          availableQuantity: available,
          shortageQuantity: shortage,
          assignedActionId: act.actionId,
          crewCategory: crewCat,
          constraintStatus,
          estimatedCostUsd: costForResource,
        });
      }
    }

    logger.info(`[CityInterventionResourceService] Evaluated resources for ${actions.length} actions: total cost $${totalCostUsd.toLocaleString()}, shortages detected: ${hasResourceShortage}`);

    return {
      resources,
      totalCostUsd: Math.round(totalCostUsd * 100) / 100,
      hasResourceShortage,
      shortageDetails,
    };
  }
}

export const cityInterventionResourceService = new CityInterventionResourceService();
