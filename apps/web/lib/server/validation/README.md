# Server Validation Layer (`lib/server/validation`)

## Responsibility
The `validation` module validates request payloads, query parameters, and headers before passing them to the service layer.

## Key Principles
- **Schema Driven**: Uses Zod / JSON Schema validation schemas.
- **Fail Fast**: Rejects malformed requests with `400 Bad Request` before invoking business services.
- **Sanitization**: Strips unknown keys and sanitizes string inputs against XSS/SQL injection.
