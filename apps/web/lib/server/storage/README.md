# Server Storage Layer (`lib/server/storage`)

## Responsibility
The `storage` module decouples file storage drivers (Local Filesystem, AWS S3, Google Cloud Storage) for multi-modal evidence assets.

## Key Principles
- **Strategy Pattern**: Implements `IStorageProvider` interface enabling driver swapping via `STORAGE_DRIVER` config.
- **Pre-signed URLs**: Generates secure pre-signed upload/download URLs for client direct uploads.
- **Path Isolation**: Organizes evidence files under isolated buckets by tenant and incident ID.
