// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.9 Geography & Regional Event Repositories
// ──────────────────────────────────────────────────────────────

import {
  CountryDomainEntity,
  StateDomainEntity,
  RegionDomainEntity,
  DistrictDomainEntity,
  CityDomainEntity,
  OperationalZoneDomainEntity,
  RegionalEventDomainEntity,
} from '../domain/geography.domain';

export interface IGeographyRepository {
  findCountryById(id: string): Promise<CountryDomainEntity | null>;
  findRegionById(id: string): Promise<RegionDomainEntity | null>;
  findDistrictById(id: string): Promise<DistrictDomainEntity | null>;
  findCityById(id: string): Promise<CityDomainEntity | null>;
  findZoneById(id: string): Promise<OperationalZoneDomainEntity | null>;
  listRegions(): Promise<RegionDomainEntity[]>;
  listDistricts(regionId?: string): Promise<DistrictDomainEntity[]>;
  listCities(districtId?: string): Promise<CityDomainEntity[]>;
  listZones(cityId?: string): Promise<OperationalZoneDomainEntity[]>;
}

export interface IRegionalEventRepository {
  findById(id: string): Promise<RegionalEventDomainEntity | null>;
  findActiveEvents(): Promise<RegionalEventDomainEntity[]>;
  save(event: RegionalEventDomainEntity): Promise<RegionalEventDomainEntity>;
}

export class MemoryGeographyRepository implements IGeographyRepository {
  private regions: RegionDomainEntity[] = [
    {
      id: 'reg-ap-central',
      stateId: 'st-ap',
      code: 'REG-AP-C',
      name: 'Central Andhra Operational Region',
      bounds: { minLat: 16.2000, maxLat: 16.8000, minLng: 80.4000, maxLng: 81.0000 },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private districts: DistrictDomainEntity[] = [
    {
      id: 'dist-krishna',
      regionId: 'reg-ap-central',
      code: 'DST-KRN',
      name: 'NTR Krishna Operational District',
      bounds: { minLat: 16.4000, maxLat: 16.6500, minLng: 80.5000, maxLng: 80.8000 },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dist-[#108]',
      regionId: 'reg-ap-central',
      code: 'DST-GNT',
      name: 'Guntur Metro District',
      bounds: { minLat: 16.2500, maxLat: 16.4000, minLng: 80.3500, maxLng: 80.5500 },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private cities: CityDomainEntity[] = [
    {
      id: 'city-vja',
      districtId: 'dist-krishna',
      code: 'VJA',
      name: 'Vijayawada Municipal Corporation',
      isActive: true,
      latitude: 16.5060,
      longitude: 80.6350,
      bounds: { minLat: 16.4800, maxLat: 16.5400, minLng: 80.6000, maxLng: 80.6800 },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'city-gtr',
      districtId: 'dist-gnt',
      code: 'GTR',
      name: 'Guntur Municipal Corporation',
      isActive: true,
      latitude: 16.3067,
      longitude: 80.4365,
      bounds: { minLat: 16.2800, maxLat: 16.3400, minLng: 80.4000, maxLng: 80.4800 },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'city-vzg',
      districtId: 'dist-vsp',
      code: 'VZG',
      name: 'Visakhapatnam Smart City',
      isActive: true,
      latitude: 17.6868,
      longitude: 83.2185,
      bounds: { minLat: 17.6500, maxLat: 17.7200, minLng: 83.1800, maxLng: 83.2600 },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private zones: OperationalZoneDomainEntity[] = [
    { id: 'zone-w12', cityId: 'city-vja', code: 'Z-W12', name: 'Ward 12 (Benz Circle)', wardNumber: '12', bounds: { minLat: 16.5000, maxLat: 16.5150, minLng: 80.6300, maxLng: 80.6450 }, createdAt: new Date(), updatedAt: new Date() },
    { id: 'zone-w14', cityId: 'city-vja', code: 'Z-W14', name: 'Ward 14 (Bandar Road)', wardNumber: '14', bounds: { minLat: 16.5050, maxLat: 16.5200, minLng: 80.6380, maxLng: 80.6550 }, createdAt: new Date(), updatedAt: new Date() },
  ];

  async findCountryById(id: string): Promise<CountryDomainEntity | null> {
    return { id: 'country-ind', code: 'IND', name: 'India', iso2: 'IN', createdAt: new Date(), updatedAt: new Date() };
  }

  async findRegionById(id: string): Promise<RegionDomainEntity | null> {
    return this.regions.find((r) => r.id === id) || this.regions[0];
  }

  async findDistrictById(id: string): Promise<DistrictDomainEntity | null> {
    return this.districts.find((d) => d.id === id) || this.districts[0];
  }

  async findCityById(id: string): Promise<CityDomainEntity | null> {
    return this.cities.find((c) => c.id === id) || this.cities[0];
  }

  async findZoneById(id: string): Promise<OperationalZoneDomainEntity | null> {
    return this.zones.find((z) => z.id === id) || this.zones[0];
  }

  async listRegions(): Promise<RegionDomainEntity[]> {
    return this.regions;
  }

  async listDistricts(regionId?: string): Promise<DistrictDomainEntity[]> {
    if (regionId) return this.districts.filter((d) => d.regionId === regionId);
    return this.districts;
  }

  async listCities(districtId?: string): Promise<CityDomainEntity[]> {
    if (districtId) return this.cities.filter((c) => c.districtId === districtId);
    return this.cities;
  }

  async listZones(cityId?: string): Promise<OperationalZoneDomainEntity[]> {
    if (cityId) return this.zones.filter((z) => z.cityId === cityId);
    return this.zones;
  }
}

export class MemoryRegionalEventRepository implements IRegionalEventRepository {
  private events: RegionalEventDomainEntity[] = [
    {
      id: 'revent-101',
      title: 'Central Sector Urban Flash Flood & Drainage Surge',
      category: 'water',
      severity: 'CRITICAL',
      affectedCities: ['Vijayawada', 'Guntur'],
      affectedDistricts: ['NTR Krishna District', 'Guntur Metro District'],
      incidentIds: ['inc-101', 'inc-102'],
      bounds: { minLat: 16.3000, maxLat: 16.5200, minLng: 80.4300, maxLng: 80.6500 },
      riskScore: 92,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async findById(id: string): Promise<RegionalEventDomainEntity | null> {
    return this.events.find((e) => e.id === id) || null;
  }

  async findActiveEvents(): Promise<RegionalEventDomainEntity[]> {
    return this.events.filter((e) => e.status === 'ACTIVE');
  }

  async save(event: RegionalEventDomainEntity): Promise<RegionalEventDomainEntity> {
    const idx = this.events.findIndex((e) => e.id === event.id);
    if (idx >= 0) {
      this.events[idx] = event;
    } else {
      this.events.push(event);
    }
    return event;
  }
}

export const memoryGeographyRepository = new MemoryGeographyRepository();
export const memoryRegionalEventRepository = new MemoryRegionalEventRepository();
