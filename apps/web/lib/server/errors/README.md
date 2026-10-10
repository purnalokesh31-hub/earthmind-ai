# Server Errors Layer (`lib/server/errors`)

## Responsibility
The `errors` module defines custom, domain-specific HTTP exception classes mapped to standard RFC 7807 problem details.

## Key Principles
- **Base Class**: All errors extend `AppError` containing `statusCode`, `errorCode`, and `message`.
- **Predefined Errors**: Provides `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ValidationError` (400), and `ConflictError` (409).
- **Safety**: Hides internal stack traces in production environments.
