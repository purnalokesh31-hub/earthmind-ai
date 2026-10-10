# Server Config Layer (`lib/server/config`)

## Responsibility
The `config` module is responsible for loading, validating, and exposing strongly-typed environment variables and runtime configurations for the EarthMind PIOS backend server.

## Key Principles
- **Fail Fast**: Validates essential environment variables at server boot time.
- **Immutability**: Exposes read-only configuration objects.
- **Security**: Ensures sensitive secrets (JWT_SECRET, DATABASE_URL) are never exposed to the client bundle.
