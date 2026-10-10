// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Local Disk Storage Provider
// Fully implemented local disk persistence via Node.js fs/promises
// ──────────────────────────────────────────────────────────────

import fs from 'fs/promises';
import path from 'path';
import { IStorageProvider, StorageUploadInput, FileUploadResult } from './storage.interface';
import { envConfig } from '../config';

export class LocalStorageProvider implements IStorageProvider {
  private readonly baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), envConfig.LOCAL_STORAGE_PATH || './public/uploads');
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private resolveFilePath(fileKey: string): string {
    const normalizedKey = fileKey.replace(/^[/\\]+/, '');
    const filePath = path.resolve(this.baseDir, normalizedKey);
    const basePath = path.resolve(this.baseDir);

    if (filePath !== basePath && !filePath.startsWith(`${basePath}${path.sep}`)) {
      throw new Error('STORAGE_PATH_TRAVERSAL_BLOCKED');
    }

    return filePath;
  }

  async uploadFile(input: StorageUploadInput): Promise<FileUploadResult> {
    const folder = input.folder || 'evidence';
    const targetDir = path.join(this.baseDir, folder);
    await this.ensureDirectoryExists(targetDir);

    const safeFileName = `${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
    const filePath = path.join(targetDir, safeFileName);

    await fs.writeFile(filePath, input.content);

    const fileKey = `${folder}/${safeFileName}`;
    const url = `/uploads/${fileKey}`;

    return {
      fileKey,
      url,
      sizeBytes: input.content.byteLength,
      mimeType: input.mimeType,
      provider: 'local',
      uploadedAt: new Date().toISOString(),
    };
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const filePath = this.resolveFilePath(fileKey);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(fileKey: string): Promise<Buffer> {
    const filePath = this.resolveFilePath(fileKey);
    return fs.readFile(filePath);
  }

  async getFileUrl(fileKey: string): Promise<string> {
    return `/uploads/${fileKey}`;
  }

  async fileExists(fileKey: string): Promise<boolean> {
    try {
      const filePath = this.resolveFilePath(fileKey);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
