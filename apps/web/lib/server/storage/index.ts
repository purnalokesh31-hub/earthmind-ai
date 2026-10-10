// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — File Storage Layer Barrel Export
// ──────────────────────────────────────────────────────────────

export * from './storage.interface';
export * from './local-storage.provider';
export * from './s3-storage.provider';
export * from './azure-blob.provider';
export * from './gcs-storage.provider';

import { IStorageProvider } from './storage.interface';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';
import { GoogleCloudStorageProvider } from './gcs-storage.provider';
import { envConfig } from '../config';

export function getStorageProvider(): IStorageProvider {
  switch (envConfig.STORAGE_DRIVER) {
    case 's3':
      return new S3StorageProvider();
    case 'gcs':
      return new GoogleCloudStorageProvider();
    case 'local':
    default:
      return new LocalStorageProvider();
  }
}

export const defaultStorageProvider = getStorageProvider();
export default defaultStorageProvider;
