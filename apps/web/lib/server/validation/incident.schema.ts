// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incident Zod Validation Schemas (Zod v4)
// ──────────────────────────────────────────────────────────────

import { z } from 'zod';

const SeverityEnum = z.enum(['critical', 'high', 'medium', 'low', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
const StatusEnum = z.string().min(2);

export const CreateIncidentSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  category: z
    .string()
    .min(2, 'Category is required'),
  subcategory: z.string().optional(),
  severity: SeverityEnum.optional(),
  department: z.string().optional(),
  departmentId: z.string().optional(),
  locationName: z
    .string()
    .min(2, 'Location name is required'),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
  evidenceId: z.string().optional(),
  evidenceIds: z.array(z.string()).optional(),
  aiSummary: z.string().max(1000).optional(),
  repairCostEstimate: z.number().min(0).optional(),
});

export const UpdateIncidentSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().min(10).max(2000).optional(),
  category: z.string().min(2).optional(),
  subcategory: z.string().optional(),
  status: StatusEnum.optional(),
  severity: SeverityEnum.optional(),
  department: z.string().optional(),
  departmentId: z.string().optional(),
  locationName: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  assignedOfficerId: z.string().optional(),
  aiSummary: z.string().max(1000).optional(),
  repairCostEstimate: z.number().min(0).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

export const AssignOfficerSchema = z.object({
  officerId: z.string().min(1, 'Officer ID is required'),
  note: z.string().max(500).optional(),
});

export const UpdateIncidentStatusSchema = z.object({
  status: StatusEnum,
  note: z.string().max(500).optional(),
});

export const MergeIncidentSchema = z.object({
  duplicateIncidentId: z.string().min(1, 'Duplicate Incident ID is required'),
});

export const ArchiveIncidentSchema = z.object({
  reason: z.string().max(500).optional(),
  note: z.string().max(500).optional(),
}).optional();

export const RestoreIncidentSchema = z.object({
  reason: z.string().max(500).optional(),
  note: z.string().max(500).optional(),
}).optional();

export const IncidentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  query: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  severity: z.union([z.string(), z.array(z.string())]).optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  department: z.string().optional(),
  departmentId: z.string().optional(),
  assignedOfficerId: z.string().optional(),
  createdById: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  minRiskScore: z.coerce.number().min(0).max(100).optional(),
  maxRiskScore: z.coerce.number().min(0).max(100).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(0.1).max(1000).optional(),
});

export type CreateIncidentInput = z.infer<typeof CreateIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof UpdateIncidentSchema>;
export type AssignOfficerInput = z.infer<typeof AssignOfficerSchema>;
export type UpdateIncidentStatusInput = z.infer<typeof UpdateIncidentStatusSchema>;
export type MergeIncidentInput = z.infer<typeof MergeIncidentSchema>;
export type ArchiveIncidentInput = z.infer<typeof ArchiveIncidentSchema>;
export type RestoreIncidentInput = z.infer<typeof RestoreIncidentSchema>;
export type IncidentQueryInput = z.infer<typeof IncidentQuerySchema>;
