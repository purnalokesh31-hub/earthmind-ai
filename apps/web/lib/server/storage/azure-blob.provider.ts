// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Azure Blob Storage Provider Placeholder
// Ready for @azure/storage-blob integration
// ──────────────────────────────────────────────────────────────

import { IStorageProvider, StorageUploadInput, FileUploadResult } from './storage.interface';

export class AzureBlobProvider implements IStorageProvider {
  private readonly containerName = 'earthmind-container';

  async uploadFile(input: StorageUploadInput): Promise<FileUploadResult> {
    const fileKey = `${input.folder || 'evidence'}/${Date.now()}-${input.fileName}`;
    const url = `https://earthmind.blob.core.windows.net/${this.containerName}/${fileKey}`;

    return {
      fileKey,
      url,
      sizeBytes: input.content.byteLength,
      mimeType: input.mimeType,
      provider: 'azure',
      uploadedAt: new Date().toISOString(),
    };
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    return true;
  }

  async readFile(fileKey: string): Promise<Buffer> {
    throw new Error(`STORAGE_READ_UNSUPPORTED: Azure Blob byte retrieval is not configured for '${fileKey}'.`);
  }

  async getFileUrl(fileKey: string): Promise<string> {
    return `https://earthmind.blob.core.windows.net/${this.containerName}/${fileKey}`;
  }

  async fileExists(fileKey: string): Promise<boolean> {
    return true;
  }
}
