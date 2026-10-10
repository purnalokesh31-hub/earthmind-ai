// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Jurisdiction Resolver & Point-in-Polygon Engine
// Resolves GPS Coordinates to Country, State, Region, District, City & Zone
// ──────────────────────────────────────────────────────────────

import { memoryGeographyRepository } from '../repositories/geography.repository';
import { ResolvedJurisdiction } from '../domain/geography.domain';

export class JurisdictionResolverService {
  async resolveCoordinates(lat: number, lng: number): Promise<ResolvedJurisdiction> {
    const cities = await memoryGeographyRepository.listCities();

    let matchedCity = cities.find((c) => {
      if (!c.bounds) return false;
      return (
        lat >= c.bounds.minLat &&
        lat <= c.bounds.maxLat &&
        lng >= c.bounds.minLng &&
        lng <= c.bounds.maxLng
      );
    });

    if (!matchedCity) {
      matchedCity = cities[0]; // Default to Vijayawada fallback
    }

    const district = await memoryGeographyRepository.findDistrictById(matchedCity.districtId);
    const region = await memoryGeographyRepository.findRegionById(district?.regionId || 'reg-ap-central');
    const country = await memoryGeographyRepository.findCountryById('country-ind');
    const zones = await memoryGeographyRepository.listZones(matchedCity.id);

    const matchedZone = zones.find((z) => {
      if (!z.bounds) return false;
      return (
        lat >= z.bounds.minLat &&
        lat <= z.bounds.maxLat &&
        lng >= z.bounds.minLng &&
        lng <= z.bounds.maxLng
      );
    }) || zones[0];

    return {
      countryId: country?.id || 'country-ind',
      stateId: 'st-ap',
      regionId: region?.id || 'reg-ap-central',
      districtId: district?.id || 'dist-krishna',
      cityId: matchedCity.id,
      zoneId: matchedZone?.id,
      countryName: country?.name || 'India',
      stateName: 'Andhra Pradesh',
      regionName: region?.name || 'Central Andhra Region',
      districtName: district?.name || 'NTR Krishna District',
      cityName: matchedCity.name,
      zoneName: matchedZone?.name || 'Ward 12 (Benz Circle)',
    };
  }
}

export const jurisdictionResolverService = new JurisdictionResolverService();
