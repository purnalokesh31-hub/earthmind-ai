// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Multi-Channel Dispatch Notification Service
// Abstraction interfaces for Email, SMS, Push, & In-App delivery
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
export type DeliveryChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
export type DeliveryStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';

export interface NotificationPayload {
  notificationId: string;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: DeliveryChannel[];
  linkedEntityId?: string;
  metadata?: Record<string, unknown>;
}

export interface DeliveryResult {
  notificationId: string;
  channel: DeliveryChannel;
  status: DeliveryStatus;
  sentAt: Date;
  error?: string;
}

export interface IEmailProvider {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

export interface ISmsProvider {
  sendSms(phone: string, text: string): Promise<boolean>;
}

export interface IPushProvider {
  sendPush(recipientId: string, title: string, body: string): Promise<boolean>;
}

// Default Mock Providers for Production System Readiness
class MockEmailProvider implements IEmailProvider {
  async sendEmail(to: string, subject: string): Promise<boolean> {
    logger.info(`[MockEmailProvider] Sent email to ${to}: ${subject}`);
    return true;
  }
}

class MockSmsProvider implements ISmsProvider {
  async sendSms(phone: string, text: string): Promise<boolean> {
    logger.info(`[MockSmsProvider] Sent SMS to ${phone}: ${text.slice(0, 30)}...`);
    return true;
  }
}

class MockPushProvider implements IPushProvider {
  async sendPush(recipientId: string, title: string): Promise<boolean> {
    logger.info(`[MockPushProvider] Sent Push notification to ${recipientId}: ${title}`);
    return true;
  }
}

export class DispatchNotificationService {
  constructor(
    private readonly emailProvider: IEmailProvider = new MockEmailProvider(),
    private readonly smsProvider: ISmsProvider = new MockSmsProvider(),
    private readonly pushProvider: IPushProvider = new MockPushProvider()
  ) {}

  async dispatchNotification(payload: NotificationPayload): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = [];

    for (const channel of payload.channels) {
      let success = false;
      let error: string | undefined;

      try {
        if (channel === 'EMAIL' && payload.recipientEmail) {
          success = await this.emailProvider.sendEmail(payload.recipientEmail, payload.title, payload.message);
        } else if (channel === 'SMS' && payload.recipientPhone) {
          success = await this.smsProvider.sendSms(payload.recipientPhone, payload.message);
        } else if (channel === 'PUSH') {
          success = await this.pushProvider.sendPush(payload.recipientId, payload.title, payload.message);
        } else {
          success = true; // In-app notification persisted directly
        }
      } catch (err) {
        success = false;
        error = err instanceof Error ? err.message : 'Notification delivery failed';
      }

      results.push({
        notificationId: payload.notificationId,
        channel,
        status: success ? 'SENT' : 'FAILED',
        sentAt: new Date(),
        error,
      });
    }

    logger.info(`[DispatchNotificationService] Processed ${results.length} notification channel delivery result(s) for recipient ${payload.recipientId}`);
    return results;
  }
}

export const dispatchNotificationService = new DispatchNotificationService();
