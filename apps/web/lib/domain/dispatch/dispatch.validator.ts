// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Dispatch Request Validation Schemas (Zod)
// ──────────────────────────────────────────────────────────────

import { z } from 'zod';

export const CreateDispatchSchema = z.object({
  incidentId: z.string().uuid({ message: 'Valid incident ID required' }),
  departmentId: z.string().optional(),
  assignedOfficerId: z.string().optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  dispatchReason: z.string().min(5, { message: 'Dispatch reason must be at least 5 characters' }),
});

export const AcknowledgeDispatchSchema = z.object({
  dispatchId: z.string().uuid(),
  notes: z.string().optional(),
});

export const EscalateDispatchSchema = z.object({
  dispatchId: z.string().uuid(),
  escalationReason: z.string().min(5),
  targetLevel: z.number().int().min(1).max(4).optional(),
});

export const ReassignDispatchSchema = z.object({
  dispatchId: z.string().uuid(),
  newOfficerId: z.string().uuid(),
  reassignReason: z.string().min(5),
});

export type CreateDispatchInput = z.infer<typeof CreateDispatchSchema>;
export type AcknowledgeDispatchInput = z.infer<typeof AcknowledgeDispatchSchema>;
export type EscalateDispatchInput = z.infer<typeof EscalateDispatchSchema>;
export type ReassignDispatchInput = z.infer<typeof ReassignDispatchSchema>;
