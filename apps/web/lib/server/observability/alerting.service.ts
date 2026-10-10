// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Alerting & Threshold Monitoring Engine
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface AlertNotification {
  alertId: string;
  ruleName: string;
  severity: AlertSeverity;
  metricValue: number;
  threshold: number;
  message: string;
  triggeredAt: Date;
}

export class AlertingEngineService {
  private activeAlerts: AlertNotification[] = [];

  evaluateRule(ruleName: string, metricValue: number, threshold: number, severity: AlertSeverity = 'CRITICAL'): AlertNotification | null {
    if (metricValue > threshold) {
      const alert: AlertNotification = {
        alertId: `alt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ruleName,
        severity,
        metricValue,
        threshold,
        message: `Alert triggered for rule '${ruleName}': Current value ${metricValue} exceeds threshold ${threshold}`,
        triggeredAt: new Date(),
      };

      this.activeAlerts.push(alert);
      logger.error(`[AlertingEngine] ${severity} ALERT: ${alert.message}`);
      return alert;
    }
    return null;
  }

  getActiveAlerts(): AlertNotification[] {
    return [...this.activeAlerts];
  }
}

export const alertingEngineService = new AlertingEngineService();
