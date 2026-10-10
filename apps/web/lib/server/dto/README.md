# Server DTO Layer (`lib/server/dto`)

## Responsibility
The `dto` (Data Transfer Objects) module defines strict request/response data contracts exchanged between client consumers and backend API controllers.

## Key Principles
- **Decoupling**: Prevents direct exposure of internal database entities or ORM models.
- **Contract Stability**: Ensures API backwards-compatibility even if database schema changes.
- **Type Safety**: Provides shared TypeScript types for frontend and backend consumers.
