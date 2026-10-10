// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Backup & Recovery Interface Layer
// ──────────────────────────────────────────────────────────────

export interface BackupMetadata {
  backupId: string;
  filename: string;
  sizeBytes: number;
  provider: 'local' | 's3' | 'gcs';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
  checksum?: string;
  tableCounts?: Record<string, number>;
}

export interface BackupOptions {
  includeAuditLogs?: boolean;
  includeEvidenceMetadata?: boolean;
  compression?: boolean;
  storageProvider?: 'local' | 's3' | 'gcs';
}

export interface RestoreOptions {
  backupId: string;
  targetDatabaseUrl?: string;
  dropExisting?: boolean;
}

export interface IBackupProvider {
  createBackup(options?: BackupOptions): Promise<BackupMetadata>;
  listBackups(): Promise<BackupMetadata[]>;
  deleteBackup(backupId: string): Promise<boolean>;
}

export interface IRestoreProvider {
  restoreFromBackup(options: RestoreOptions): Promise<boolean>;
}

export interface IExportProvider {
  exportDatabaseJson(): Promise<Record<string, any[]>>;
  exportTableCsv(tableName: string): Promise<string>;
}

export interface IImportProvider {
  importDatabaseJson(data: Record<string, any[]>): Promise<{ importedCount: number }>;
}

export interface IAuditBackupProvider {
  backupAuditLogs(from?: Date, to?: Date): Promise<BackupMetadata>;
}
