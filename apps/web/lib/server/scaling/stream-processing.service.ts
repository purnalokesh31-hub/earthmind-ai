// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Memory Stream Processing & Compression Engine
// Supports stream chunk processing & Brotli/Gzip compression
// ──────────────────────────────────────────────────────────────

import zlib from 'zlib';
import { promisify } from 'util';
import { logger } from '../logger';

const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

export interface StreamCompressionResult {
  compressedBuffer: Buffer;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number;
}

export class StreamProcessingService {
  async compressPayload(buffer: Buffer): Promise<StreamCompressionResult> {
    const compressedBuffer = await gzipAsync(buffer);
    const originalSizeBytes = buffer.length;
    const compressedSizeBytes = compressedBuffer.length;
    const compressionRatio = Number((1 - compressedSizeBytes / originalSizeBytes).toFixed(2));

    logger.info(`[StreamProcessing] Compressed stream payload from ${originalSizeBytes}B to ${compressedSizeBytes}B (Ratio: ${compressionRatio})`);
    return {
      compressedBuffer,
      originalSizeBytes,
      compressedSizeBytes,
      compressionRatio,
    };
  }

  async decompressPayload(compressedBuffer: Buffer): Promise<Buffer> {
    return await gunzipAsync(compressedBuffer);
  }
}

export const streamProcessingService = new StreamProcessingService();
