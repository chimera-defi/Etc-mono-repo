import { Logger } from '@aztec-staking/shared';
import { AlertConfig, ALERT_CONDITIONS } from './config';

export type Severity = 'critical' | 'warning' | 'info';

export interface Alert {
  severity: Severity;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
}

export class Alerter {
  private recentAlerts: Alert[] = [];
  private alertCooldowns: Map<string, number> = new Map();
  private readonly cooldownMs = 5 * 60 * 1000; // 5 minutes

  constructor(
    private config: AlertConfig,
    private logger: Logger
  ) {}

  async sendAlert(severity: Severity, message: string, details?: Record<string, unknown>): Promise<void> {
    const alert: Alert = {
      severity,
      message,
      details,
      timestamp: Date.now(),
    };

    // Check cooldown to avoid alert spam
    const alertKey = `${severity}:${message}`;
    const lastAlert = this.alertCooldowns.get(alertKey);
    if (lastAlert && Date.now() - lastAlert < this.cooldownMs) {
      this.logger.debug('Alert suppressed due to cooldown', { alertKey });
      return;
    }

    this.alertCooldowns.set(alertKey, Date.now());
    this.recentAlerts.push(alert);

    // Keep only last 100 alerts
    if (this.recentAlerts.length > 100) {
      this.recentAlerts = this.recentAlerts.slice(-100);
    }

    // Log the alert
    if (severity === 'critical') {
      this.logger.error(`Alert: ${message}`, new Error(message), details);
    } else if (severity === 'warning') {
      this.logger.warn(`Alert: ${message}`, details);
    } else {
      this.logger.info(`Alert: ${message}`, details);
    }

    // Send to configured channels
    await this.sendToChannels(alert);
  }

  private async sendToChannels(alert: Alert): Promise<void> {
    const promises: Promise<void>[] = [];

    if (this.config.telegram) {
      promises.push(this.sendTelegram(alert));
    }

    if (this.config.slack) {
      promises.push(this.sendSlack(alert));
    }

    if (this.config.pagerduty && alert.severity === 'critical') {
      promises.push(this.sendPagerDuty(alert));
    }

    await Promise.allSettled(promises);
  }

  private async sendTelegram(alert: Alert): Promise<void> {
    if (!this.config.telegram) return;

    const emoji = alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';
    const message = `${emoji} *${alert.severity.toUpperCase()}*\n\n${alert.message}`;

    try {
      // In production, use actual Telegram API
      // const response = await fetch(`https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     chat_id: this.config.telegram.chatId,
      //     text: message,
      //     parse_mode: 'Markdown',
      //   }),
      // });
      this.logger.info('Telegram alert sent (mock)', { message });
    } catch (error) {
      this.logger.error('Failed to send Telegram alert', error as Error);
    }
  }

  private async sendSlack(alert: Alert): Promise<void> {
    if (!this.config.slack) return;

    const color = alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'good';

    try {
      // In production, use actual Slack webhook
      // const response = await fetch(this.config.slack.webhookUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     attachments: [{
      //       color,
      //       title: `${alert.severity.toUpperCase()}: stAZTEC Alert`,
      //       text: alert.message,
      //       ts: Math.floor(alert.timestamp / 1000),
      //     }],
      //   }),
      // });
      this.logger.info('Slack alert sent (mock)', { severity: alert.severity });
    } catch (error) {
      this.logger.error('Failed to send Slack alert', error as Error);
    }
  }

  private async sendPagerDuty(alert: Alert): Promise<void> {
    if (!this.config.pagerduty) return;

    try {
      // In production, use actual PagerDuty Events API v2
      // const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     routing_key: this.config.pagerduty.serviceKey,
      //     event_action: 'trigger',
      //     payload: {
      //       summary: alert.message,
      //       severity: 'critical',
      //       source: 'aztec-staking-monitoring',
      //     },
      //   }),
      // });
      this.logger.info('PagerDuty alert sent (mock)', { severity: alert.severity });
    } catch (error) {
      this.logger.error('Failed to send PagerDuty alert', error as Error);
    }
  }

  getRecentAlerts(): Alert[] {
    return [...this.recentAlerts];
  }
}

export { ALERT_CONDITIONS };
