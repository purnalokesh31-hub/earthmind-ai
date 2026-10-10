import { IStorageProvider, StorageUploadInput, FileUploadResult } from '../../lib/server/storage/storage.interface';

export class MockStorageProvider implements IStorageProvider {
  private files = new Map<string, StorageUploadInput>();

  async uploadFile(input: StorageUploadInput): Promise<FileUploadResult> {
    const fileKey = `${input.folder || 'mock'}/${Date.now()}-${input.fileName}`;
    this.files.set(fileKey, input);

    return {
      fileKey,
      url: `/mock-uploads/${fileKey}`,
      sizeBytes: input.content.byteLength,
      mimeType: input.mimeType,
      provider: 'local',
      uploadedAt: new Date().toISOString(),
    };
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    return this.files.delete(fileKey);
  }

  async readFile(fileKey: string): Promise<Buffer> {
    const file = this.files.get(fileKey);
    if (!file) throw new Error(`Mock file '${fileKey}' not found`);
    return Buffer.from(file.content);
  }

  async getFileUrl(fileKey: string): Promise<string> {
    return `/mock-uploads/${fileKey}`;
  }

  async fileExists(fileKey: string): Promise<boolean> {
    return this.files.has(fileKey);
  }
}
