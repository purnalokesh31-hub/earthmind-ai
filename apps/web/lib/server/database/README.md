# Server Database Layer (`lib/server/database`)

## Responsibility
The `database` module manages database connectivity, Prisma ORM connection pooling, soft-disconnection hooks, and PostGIS spatial extensions.

## Key Principles
- **Singleton Client**: Ensures a single PrismaClient instance across hot-reloading serverless environments.
- **Connection Management**: Graceful shutdown and connection pool monitoring.
- **Geospatial Support**: Provides PostGIS spatial query capabilities for GIS radius calculations.
