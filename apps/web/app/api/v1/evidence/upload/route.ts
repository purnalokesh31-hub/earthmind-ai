// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Evidence Upload Controller
// POST /api/v1/evidence/upload  — Authenticated Multi-Modal Evidence Ingestion
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticateOrPrototypeUser } from '../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../lib/server/container';
import { IStorageProvider } from '../../../../../lib/server/storage/storage.interface';
import { IEvidenceRepository } from '../../../../../lib/server/repositories/evidence.repository';
import { BadRequestError } from '../../../../../lib/server/errors';
import { logger } from '../../../../../lib/server/logger';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
  'image/bmp',
  'application/pdf',
  'text/plain',
  'application/json',
  'text/csv',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function mapMimeToFileType(mime: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'SENSOR' {
  if (mime.startsWith('image/')) return 'IMAGE';
  if (mime.startsWith('video/')) return 'VIDEO';
  if (mime === 'application/json' || mime === 'text/csv') return 'SENSOR';
  return 'DOCUMENT';
}

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () =>
    new Response(
      JSON.stringify({
        success: false,
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST /api/v1/evidence/upload with multipart/form-data.' },
        timestamp: new Date().toISOString(),
      }),
      { status: 405, headers: { 'Content-Type': 'application/json', Allow: 'POST' } }
    )
  );
}

export async function POST(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    // 1. Authenticate Request
    const authUser = await authenticateOrPrototypeUser(req as unknown as NextRequest);

    // 2. Parse Multipart Form Data
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      throw new BadRequestError('Request must be multipart/form-data with a file payload.');
    }

    const file = formData.get('file') as File | null;
    const linkedIncidentId = (formData.get('incidentId') || formData.get('linkedIncidentId')) as string | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      throw new BadRequestError('No valid file payload was provided in the upload request.');
    }

    // 3. Server-Side Validation: File Size & Type
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 25 MB.`);
    }

    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new BadRequestError(`Unsupported file MIME type: '${mimeType}'. Allowed formats: Images, Videos, PDFs, JSON/CSV sensors.`);
    }

    const mappedFileType = mapMimeToFileType(mimeType);

    // 4. Persist to Storage Provider
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    const storageProvider = container.resolve<IStorageProvider>(TOKENS.StorageProvider);
    const uploadResult = await storageProvider.uploadFile({
      fileName: file.name,
      content: fileBuffer,
      mimeType,
      folder: 'evidence',
    });

    // 5. Persist Evidence Entity in Repository
    const evidenceRepo = container.resolve<IEvidenceRepository>(TOKENS.EvidenceRepository);
    const createdEvidence = await evidenceRepo.create({
      fileName: file.name,
      fileType: mappedFileType,
      mimeType,
      sizeBytes: file.size,
      storageUrl: uploadResult.url,
      status: 'PENDING',
      uploadedByUserId: authUser.userId,
      linkedIncidentId: linkedIncidentId || undefined,
    });

    logger.info(`[EvidenceUploadAPI] Persisted evidence '${createdEvidence.id}' (${mappedFileType}, ${file.size} bytes) for user '${authUser.userId}'`);

    return new Response(
      JSON.stringify(
        successResponse({
          evidenceId: createdEvidence.id,
          fileName: createdEvidence.fileName,
          fileType: createdEvidence.fileType,
          mimeType: createdEvidence.mimeType,
          sizeBytes: createdEvidence.sizeBytes,
          storageUrl: createdEvidence.storageUrl,
          status: createdEvidence.status,
          uploadedByUserId: createdEvidence.uploadedByUserId,
          linkedIncidentId: createdEvidence.linkedIncidentId,
          createdAt: createdEvidence.createdAt,
        })
      ),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  });
}
