// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Google Cloud Storage Provider Placeholder
// Ready for @google-cloud/storage integration
// ──────────────────────────────────────────────────────────────

import { IStorageProvider, StorageUploadInput, FileUploadResult } from './storage.interface';

export class GoogleCloudStorageProvider implements IStorageProvider {
  private readonly bucketName = 'earthmind-gcs-bucket';

  async uploadFile(input: StorageUploadInput): Promise<FileUploadResult> {
    const fileKey = `${input.folder || 'evidence'}/${Date.now()}-${input.fileName}`;
    const url = `https://storage.googleapis.com/${this.bucketName}/${fileKey}`;

    return {
      fileKey,
      url,
      sizeBytes: input.content.byteLength,
      mimeType: input.mimeType,
      provider: 'gcs',
      uploadedAt: new Date().toISOString(),
    };
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    return true;
  }

  async readFile(fileKey: string): Promise<Buffer> {
    throw new Error(`STORAGE_READ_UNSUPPORTED: Google Cloud Storage byte retrieval is not configured for '${fileKey}'.`);
  }

  async getFileUrl(fileKey: string): Promise<string> {
    return `https://storage.googleapis.com/${this.bucketName}/${fileKey}`;
  }

  async fileExists(fileKey: string): Promise<boolean> {
    return true;
  }
}
