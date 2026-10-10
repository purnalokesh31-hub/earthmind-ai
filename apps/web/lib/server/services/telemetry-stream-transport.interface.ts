// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.3 Streaming Transport Abstraction
// Vendor-Agnostic Transport Contract for WebSockets, MQTT, Kafka, Webhooks
// ──────────────────────────────────────────────────────────────

import { CityTelemetryEvent } from '../domain/digital-twin/telemetry-stream.domain';

export type EventSubscriptionHandler = (event: CityTelemetryEvent) => Promise<void>;

export interface TelemetryStreamTransport {
  readonly transportId: string;
  readonly transportType: 'WEBSOCKET' | 'MQTT' | 'KAFKA' | 'WEBHOOK' | 'IN_MEMORY';

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish(event: CityTelemetryEvent): Promise<boolean>;
  subscribe(topic: string, handler: EventSubscriptionHandler): Promise<string>;
  unsubscribe(subscriptionId: string): Promise<boolean>;
}

export class InMemoryTelemetryStreamTransport implements TelemetryStreamTransport {
  public readonly transportId = 'transport-in-memory-01';
  public readonly transportType = 'IN_MEMORY';
  private subscriptions: Map<string, EventSubscriptionHandler> = new Map();
  private isConnected = false;

  public async connect(): Promise<void> {
    this.isConnected = true;
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
    this.subscriptions.clear();
  }

  public async publish(event: CityTelemetryEvent): Promise<boolean> {
    if (!this.isConnected) return false;
    for (const handler of Array.from(this.subscriptions.values())) {
      try {
        await handler(event);
      } catch (err) {
        // Log isolation error
      }
    }
    return true;
  }

  public async subscribe(topic: string, handler: EventSubscriptionHandler): Promise<string> {
    const subId = `sub-${Math.random().toString(36).substring(2, 9)}`;
    this.subscriptions.set(subId, handler);
    return subId;
  }

  public async unsubscribe(subscriptionId: string): Promise<boolean> {
    return this.subscriptions.delete(subscriptionId);
  }
}
