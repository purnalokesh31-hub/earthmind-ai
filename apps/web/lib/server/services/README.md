# Server Domain Services Layer (`lib/server/services`)

## Responsibility
The `services` module contains all **Domain Business Logic** for EarthMind PIOS. It orchestrates repository calls, dispatches events, logs audit trails, and invokes external AI / GIS services.

## Key Principles
- **SOLID Principles**: Single Responsibility (SRP) per service domain (Incident, Evidence, Vision, Auth).
- **Zero UI Dependency**: Completely decoupled from React or Next.js HTTP controllers.
- **Orchestration**: Combines repository data access with cross-cutting infrastructure services (Notifications, Audit, Storage).
