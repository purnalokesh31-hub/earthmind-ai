# Server Interfaces Layer (`lib/server/interfaces`)

## Responsibility
The `interfaces` module defines abstract contracts for integration with external third-party systems, microservices, AI inference engines, and GIS spatial processors.

## Key Principles
- **Dependency Inversion**: High-level domain services depend on abstract interfaces rather than low-level HTTP clients.
- **Microservices Compatibility**: Enables swapping mock engines with production YOLOv8 / PostGIS REST APIs seamlessly.
