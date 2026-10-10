// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AWS S3 Storage Provider Placeholder
// Ready for @aws-sdk/client-s3 integration
// ──────────────────────────────────────────────────────────────

import { IStorageProvider, StorageUploadInput, FileUploadResult } from './storage.interface';
import { envConfig } from '../config';

export class S3StorageProvider implements IStorageProvider {
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.bucket = envConfig.S3_BUCKET_NAME || 'earthmind-pios-assets';
    this.region = envConfig.S3_REGION || 'ap-south-1';
  }

  async uploadFile(input: StorageUploadInput): Promise<FileUploadResult> {
    const fileKey = `${input.folder || 'evidence'}/${Date.now()}-${input.fileName}`;
    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileKey}`;

    return {
      fileKey,
      url,
      sizeBytes: input.content.byteLength,
      mimeType: input.mimeType,
      provider: 's3',
      uploadedAt: new Date().toISOString(),
    };
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    return true;
  }

  async readFile(fileKey: string): Promise<Buffer> {
    throw new Error(`STORAGE_READ_UNSUPPORTED: S3 byte retrieval is not configured for '${fileKey}'.`);
  }

  async getFileUrl(fileKey: string): Promise<string> {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileKey}`;
  }

  async fileExists(fileKey: string): Promise<boolean> {
    return true;
  }
}
