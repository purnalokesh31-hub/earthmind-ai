# Server Logger Layer (`lib/server/logger`)

## Responsibility
The `logger` module provides structured JSON logging, trace correlation IDs, and telemetry stream processing for operational monitoring.

## Key Principles
- **Structured Output**: Emits machine-readable JSON logs (`timestamp`, `level`, `traceId`, `message`, `meta`).
- **Log Levels**: Supports `debug`, `info`, `warn`, `error`, and `fatal`.
- **Trace Context**: Correlates requests across API routes and microservices via trace IDs.
