// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Vision Analysis Zod Validation Schemas (Zod v4)
// ──────────────────────────────────────────────────────────────

import { z } from 'zod';

const SUPPORTED_TASKS = [
  'auto',
  'road_damage',
  'flood',
  'garbage',
  'illegal_dumping',
  'tree_damage',
  'crop_disease',
  'water_leakage',
  'electric_pole_damage',
  'fire',
  'building_damage',
] as const;

export const VisionAnalysisSchema = z.object({
  evidenceId: z
    .string()
    .min(1, 'Evidence ID is required'),
  modelTask: z
    .string()
    .min(1, 'Model task is required')
    .refine((v) => SUPPORTED_TASKS.includes(v as any), {
      message: `Model task must be one of: ${SUPPORTED_TASKS.join(', ')}`,
    }),
  priority: z.enum(['normal', 'high', 'critical']).default('normal'),
});

export const BoundingBoxSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().min(1),
  height: z.number().min(1),
});

export type VisionAnalysisInput = z.infer<typeof VisionAnalysisSchema>;
export type BoundingBoxInput = z.infer<typeof BoundingBoxSchema>;
