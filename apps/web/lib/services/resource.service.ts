// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Resource Service
// ──────────────────────────────────────────────────────────────
// Manages personnel, departments, vehicles, and field units.
// Current: Mock data. Future: REST / GraphQL.
// ──────────────────────────────────────────────────────────────

import type { User, UserRole, Category } from '../../types';

const mockDelay = (ms = 100): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ──────────────────────────────────────────────────────────────
// Data Types
// ──────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  code: string;
  category: Category;
  headOfficer: string;
  contactEmail: string;
  contactPhone: string;
  activeUnits: number;
  jurisdiction: string;
}

export interface FieldUnit {
  id: string;
  name: string;
  departmentId: string;
  status: 'available' | 'deployed' | 'off_duty' | 'standby';
  members: string[];
  vehicleId?: string;
  currentLocation?: { lat: number; lng: number };
}

export interface Vehicle {
  id: string;
  registration: string;
  type: 'patrol' | 'ambulance' | 'fire_truck' | 'excavator' | 'utility' | 'drone';
  status: 'available' | 'in_use' | 'maintenance';
  departmentId: string;
  currentLocation?: { lat: number; lng: number };
}

// ──────────────────────────────────────────────────────────────
// Mock Data
// ──────────────────────────────────────────────────────────────

const MOCK_DEPARTMENTS: Department[] = [
  { id: 'dept-pwd', name: 'Public Works Department', code: 'PWD', category: 'infrastructure', headOfficer: 'Ravi Kumar', contactEmail: 'pwd@earthmind.gov', contactPhone: '+91-9876543210', activeUnits: 8, jurisdiction: 'Municipal Limits' },
  { id: 'dept-water', name: 'Water Supply Board', code: 'WSB', category: 'water', headOfficer: 'Sita Ram', contactEmail: 'wsb@earthmind.gov', contactPhone: '+91-9876543211', activeUnits: 5, jurisdiction: 'District Wide' },
  { id: 'dept-agri', name: 'Agriculture Department', code: 'AGR', category: 'agriculture', headOfficer: 'Lakshmi Devi', contactEmail: 'agri@earthmind.gov', contactPhone: '+91-9876543212', activeUnits: 6, jurisdiction: 'Rural Division' },
  { id: 'dept-forest', name: 'Forest Department', code: 'FRD', category: 'environment', headOfficer: 'Arjun Singh', contactEmail: 'forest@earthmind.gov', contactPhone: '+91-9876543213', activeUnits: 4, jurisdiction: 'Forest Reserves' },
  { id: 'dept-elec', name: 'Electricity Board', code: 'ELB', category: 'energy', headOfficer: 'Priya Sharma', contactEmail: 'elec@earthmind.gov', contactPhone: '+91-9876543214', activeUnits: 7, jurisdiction: 'State Grid' },
  { id: 'dept-fire', name: 'Fire & Emergency Services', code: 'FES', category: 'disaster', headOfficer: 'Vikram Patel', contactEmail: 'fire@earthmind.gov', contactPhone: '+91-9876543215', activeUnits: 10, jurisdiction: 'City Limits' },
  { id: 'dept-mc', name: 'Municipal Corporation', code: 'MCO', category: 'urban', headOfficer: 'Anita Reddy', contactEmail: 'mc@earthmind.gov', contactPhone: '+91-9876543216', activeUnits: 12, jurisdiction: 'Municipal Limits' },
  { id: 'dept-met', name: 'Meteorological Department', code: 'MET', category: 'climate', headOfficer: 'Suresh Babu', contactEmail: 'met@earthmind.gov', contactPhone: '+91-9876543217', activeUnits: 3, jurisdiction: 'Regional' },
  { id: 'dept-wildlife', name: 'Wildlife Protection', code: 'WLP', category: 'wildlife', headOfficer: 'Meera Nair', contactEmail: 'wildlife@earthmind.gov', contactPhone: '+91-9876543218', activeUnits: 3, jurisdiction: 'Wildlife Sanctuaries' },
];

const MOCK_OFFICERS: Array<User & { departmentId: string; available: boolean }> = [
  { id: 'off-001', name: 'Ravi Kumar', email: 'ravi@earthmind.gov', organization: 'EarthMind', department: 'Public Works Department', role: 'Field Officer', region: 'Ward 12', emailVerified: true, departmentId: 'dept-pwd', available: true },
  { id: 'off-002', name: 'Sita Ram', email: 'sita@earthmind.gov', organization: 'EarthMind', department: 'Water Supply Board', role: 'Field Officer', region: 'Zone B', emailVerified: true, departmentId: 'dept-water', available: true },
  { id: 'off-003', name: 'Lakshmi Devi', email: 'lakshmi@earthmind.gov', organization: 'EarthMind', department: 'Agriculture Department', role: 'Supervisor', region: 'Rural Division', emailVerified: true, departmentId: 'dept-agri', available: false },
  { id: 'off-004', name: 'Arjun Singh', email: 'arjun@earthmind.gov', organization: 'EarthMind', department: 'Forest Department', role: 'Field Officer', region: 'Forest Reserve A', emailVerified: true, departmentId: 'dept-forest', available: true },
  { id: 'off-005', name: 'Priya Sharma', email: 'priya@earthmind.gov', organization: 'EarthMind', department: 'Electricity Board', role: 'Supervisor', region: 'Grid Sector 7', emailVerified: true, departmentId: 'dept-elec', available: true },
  { id: 'off-006', name: 'Vikram Patel', email: 'vikram@earthmind.gov', organization: 'EarthMind', department: 'Fire & Emergency Services', role: 'Field Officer', region: 'Station Alpha', emailVerified: true, departmentId: 'dept-fire', available: true },
  { id: 'off-007', name: 'Anita Reddy', email: 'anita@earthmind.gov', organization: 'EarthMind', department: 'Municipal Corporation', role: 'Department Officer', region: 'HQ', emailVerified: true, departmentId: 'dept-mc', available: true },
  { id: 'off-008', name: 'Suresh Babu', email: 'suresh@earthmind.gov', organization: 'EarthMind', department: 'Meteorological Department', role: 'Environmental Analyst', region: 'Regional Center', emailVerified: true, departmentId: 'dept-met', available: true },
];

const MOCK_UNITS: FieldUnit[] = [
  { id: 'unit-alpha', name: 'Team Alpha', departmentId: 'dept-pwd', status: 'available', members: ['off-001'], vehicleId: 'vh-001', currentLocation: { lat: 16.5062, lng: 80.648 } },
  { id: 'unit-bravo', name: 'Team Bravo', departmentId: 'dept-water', status: 'deployed', members: ['off-002'], vehicleId: 'vh-002', currentLocation: { lat: 16.512, lng: 80.623 } },
  { id: 'unit-charlie', name: 'Team Charlie', departmentId: 'dept-fire', status: 'available', members: ['off-006'], vehicleId: 'vh-003', currentLocation: { lat: 16.508, lng: 80.640 } },
  { id: 'unit-delta', name: 'Team Delta', departmentId: 'dept-forest', status: 'standby', members: ['off-004'], currentLocation: { lat: 16.520, lng: 80.615 } },
  { id: 'unit-echo', name: 'Team Echo', departmentId: 'dept-elec', status: 'available', members: ['off-005'], vehicleId: 'vh-004', currentLocation: { lat: 16.495, lng: 80.655 } },
];

const MOCK_VEHICLES: Vehicle[] = [
  { id: 'vh-001', registration: 'AP-09-AB-1234', type: 'utility', status: 'available', departmentId: 'dept-pwd', currentLocation: { lat: 16.506, lng: 80.648 } },
  { id: 'vh-002', registration: 'AP-09-CD-5678', type: 'utility', status: 'in_use', departmentId: 'dept-water', currentLocation: { lat: 16.512, lng: 80.623 } },
  { id: 'vh-003', registration: 'AP-09-EF-9012', type: 'fire_truck', status: 'available', departmentId: 'dept-fire', currentLocation: { lat: 16.508, lng: 80.640 } },
  { id: 'vh-004', registration: 'AP-09-GH-3456', type: 'utility', status: 'available', departmentId: 'dept-elec', currentLocation: { lat: 16.495, lng: 80.655 } },
  { id: 'vh-005', registration: 'AP-09-IJ-7890', type: 'drone', status: 'available', departmentId: 'dept-forest' },
  { id: 'vh-006', registration: 'AP-09-KL-1122', type: 'ambulance', status: 'available', departmentId: 'dept-fire', currentLocation: { lat: 16.510, lng: 80.635 } },
];

// ──────────────────────────────────────────────────────────────
// Department Operations
// ──────────────────────────────────────────────────────────────

export async function listDepartments(): Promise<Department[]> {
  await mockDelay();
  return MOCK_DEPARTMENTS;
}

export async function getDepartmentById(id: string): Promise<Department | undefined> {
  await mockDelay(50);
  return MOCK_DEPARTMENTS.find((d) => d.id === id);
}

export async function getDepartmentsByCategory(category: Category): Promise<Department[]> {
  await mockDelay();
  return MOCK_DEPARTMENTS.filter((d) => d.category === category);
}

// ──────────────────────────────────────────────────────────────
// Officer / Personnel Operations
// ──────────────────────────────────────────────────────────────

export async function listOfficers(filters?: {
  departmentId?: string;
  available?: boolean;
  role?: UserRole;
}): Promise<Array<User & { departmentId: string; available: boolean }>> {
  await mockDelay();
  let list = MOCK_OFFICERS;
  if (filters?.departmentId) list = list.filter((o) => o.departmentId === filters.departmentId);
  if (filters?.available !== undefined) list = list.filter((o) => o.available === filters.available);
  if (filters?.role) list = list.filter((o) => o.role === filters.role);
  return list;
}

export async function getOfficerById(id: string): Promise<(User & { departmentId: string; available: boolean }) | undefined> {
  await mockDelay(50);
  return MOCK_OFFICERS.find((o) => o.id === id);
}

// ──────────────────────────────────────────────────────────────
// Field Unit Operations
// ──────────────────────────────────────────────────────────────

export async function listFieldUnits(filters?: {
  departmentId?: string;
  status?: FieldUnit['status'];
}): Promise<FieldUnit[]> {
  await mockDelay();
  let list = MOCK_UNITS;
  if (filters?.departmentId) list = list.filter((u) => u.departmentId === filters.departmentId);
  if (filters?.status) list = list.filter((u) => u.status === filters.status);
  return list;
}

export async function getAvailableUnits(): Promise<FieldUnit[]> {
  return listFieldUnits({ status: 'available' });
}

// ──────────────────────────────────────────────────────────────
// Vehicle Operations
// ──────────────────────────────────────────────────────────────

export async function listVehicles(filters?: {
  departmentId?: string;
  type?: Vehicle['type'];
  status?: Vehicle['status'];
}): Promise<Vehicle[]> {
  await mockDelay();
  let list = MOCK_VEHICLES;
  if (filters?.departmentId) list = list.filter((v) => v.departmentId === filters.departmentId);
  if (filters?.type) list = list.filter((v) => v.type === filters.type);
  if (filters?.status) list = list.filter((v) => v.status === filters.status);
  return list;
}

export async function getAvailableVehicles(): Promise<Vehicle[]> {
  return listVehicles({ status: 'available' });
}

// ──────────────────────────────────────────────────────────────
// Resource Summary (for dashboards)
// ──────────────────────────────────────────────────────────────

export interface ResourceSummary {
  totalDepartments: number;
  totalOfficers: number;
  availableOfficers: number;
  totalUnits: number;
  availableUnits: number;
  totalVehicles: number;
  availableVehicles: number;
}

export async function getResourceSummary(): Promise<ResourceSummary> {
  await mockDelay();
  return {
    totalDepartments: MOCK_DEPARTMENTS.length,
    totalOfficers: MOCK_OFFICERS.length,
    availableOfficers: MOCK_OFFICERS.filter((o) => o.available).length,
    totalUnits: MOCK_UNITS.length,
    availableUnits: MOCK_UNITS.filter((u) => u.status === 'available').length,
    totalVehicles: MOCK_VEHICLES.length,
    availableVehicles: MOCK_VEHICLES.filter((v) => v.status === 'available').length,
  };
}
