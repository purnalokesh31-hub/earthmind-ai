// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — File Storage Provider Interface Contract
// ──────────────────────────────────────────────────────────────

export interface FileUploadResult {
  fileKey: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  provider: 'local' | 's3' | 'azure' | 'gcs';
  uploadedAt: string;
}

export interface StorageUploadInput {
  fileName: string;
  content: Buffer | Uint8Array;
  mimeType: string;
  folder?: string;
}

export interface IStorageProvider {
  uploadFile(input: StorageUploadInput): Promise<FileUploadResult>;
  readFile(fileKey: string): Promise<Buffer>;
  deleteFile(fileKey: string): Promise<boolean>;
  getFileUrl(fileKey: string): Promise<string>;
  fileExists(fileKey: string): Promise<boolean>;
}
