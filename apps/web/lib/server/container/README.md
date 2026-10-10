# Server Container & Dependency Injection Layer (`lib/server/container`)

## Responsibility
The `container` module provides the **Inversion of Control (IoC) Container** for EarthMind PIOS. It manages service lifecycles, dependency registration, and constructor injection.

## Architectural Flow
```
[Next.js API Controller]
         │ (resolves via container)
         ▼
[Service Interface (e.g. IIncidentService)]
         │ (injected constructor dependency)
         ▼
[Repository Interface (e.g. IIncidentRepository)]
         │ (bound in container)
         ▼
[Prisma Repository Implementation]
```

## Key Principles
- **Dependency Inversion (DIP)**: High-level modules depend on abstractions (interfaces), never concrete classes.
- **Single Source of Wiring**: All dependencies are registered in `container.ts`.
- **Zero Direct Instantiation**: Controllers and services never use `new PrismaIncidentRepository()` directly.
