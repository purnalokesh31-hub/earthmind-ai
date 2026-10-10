// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Evidence Zod Validation Schemas (Zod v4)
// ──────────────────────────────────────────────────────────────

import { z } from 'zod';

const FileTypeEnum = z.enum(['image', 'video', 'document', 'sensor']);
const EvidenceStatusEnum = z.enum(['pending', 'processing', 'analyzed', 'failed']);

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'application/pdf',
  'application/json',
] as const;

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export const CreateEvidenceSchema = z.object({
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name too long'),
  fileType: FileTypeEnum,
  mimeType: z
    .string()
    .min(1, 'MIME type is required')
    .refine((v) => ALLOWED_MIME_TYPES.includes(v as any), {
      message: `MIME type must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`,
    }),
  sizeBytes: z
    .number()
    .int()
    .min(1, 'File size must be greater than 0')
    .max(MAX_FILE_SIZE_BYTES, 'File size cannot exceed 100MB'),
  linkedIncidentId: z.string().optional(),
});

export const UpdateEvidenceSchema = z.object({
  status: EvidenceStatusEnum.optional(),
  linkedIncidentId: z.string().optional(),
  ocrText: z.string().max(50000).optional(),
  aiConfidence: z.number().min(0).max(100).optional(),
  aiTaskLabel: z.string().max(100).optional(),
  damageScore: z.number().min(0).max(100).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

export const LinkEvidenceSchema = z.object({
  incidentId: z.string().min(1, 'Incident ID is required'),
});

export const EvidenceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: EvidenceStatusEnum.optional(),
  fileType: FileTypeEnum.optional(),
  incidentId: z.string().optional(),
});

export type CreateEvidenceInput = z.infer<typeof CreateEvidenceSchema>;
export type UpdateEvidenceInput = z.infer<typeof UpdateEvidenceSchema>;
export type EvidenceQueryInput = z.infer<typeof EvidenceQuerySchema>;
