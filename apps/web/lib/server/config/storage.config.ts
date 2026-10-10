// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Centralized Multi-Modal File Storage Config
// ──────────────────────────────────────────────────────────────

import envConfig from './env.config';

export interface StorageConfig {
  driver: 'local' | 's3' | 'gcs';
  localPath: string;
  maxFileSizeBytes: number;
  allowedMimeTypes: string[];
  s3?: {
    bucketName?: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
  };
}

export const storageConfig: StorageConfig = {
  driver: envConfig.STORAGE_DRIVER,
  localPath: envConfig.LOCAL_STORAGE_PATH,
  maxFileSizeBytes: 100 * 1024 * 1024, // 100MB max payload
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'application/pdf',
    'application/json',
  ],
  s3: {
    bucketName: envConfig.S3_BUCKET_NAME,
    region: envConfig.S3_REGION,
    accessKeyId: envConfig.S3_ACCESS_KEY_ID,
    secretAccessKey: envConfig.S3_SECRET_ACCESS_KEY,
  },
};

export default storageConfig;
