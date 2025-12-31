import { Alerter, ALERT_CONDITIONS } from '../alerting';
import { createLogger } from '@aztec-staking/shared';

describe('Alerter', () => {
  const logger = createLogger('test');
  let alerter: Alerter;

  beforeEach(() => {
    alerter = new Alerter({}, logger);
  });

  it('sends alerts successfully', async () => {
    await alerter.sendAlert('critical', 'Test alert');

    const alerts = alerter.getRecentAlerts();
    expect(alerts.length).toBe(1);
    expect(alerts[0].severity).toBe('critical');
    expect(alerts[0].message).toBe('Test alert');
  });

  it('tracks multiple alerts', async () => {
    await alerter.sendAlert('info', 'Info alert');
    await alerter.sendAlert('warning', 'Warning alert');
    await alerter.sendAlert('critical', 'Critical alert');

    const alerts = alerter.getRecentAlerts();
    expect(alerts.length).toBe(3);
  });

  it('respects cooldown for duplicate alerts', async () => {
    await alerter.sendAlert('warning', 'Same alert');
    await alerter.sendAlert('warning', 'Same alert'); // Should be suppressed

    const alerts = alerter.getRecentAlerts();
    expect(alerts.length).toBe(1);
  });

  it('allows different alerts', async () => {
    await alerter.sendAlert('warning', 'Alert 1');
    await alerter.sendAlert('warning', 'Alert 2');

    const alerts = alerter.getRecentAlerts();
    expect(alerts.length).toBe(2);
  });

  it('has correct alert conditions', () => {
    expect(ALERT_CONDITIONS.validatorOffline.severity).toBe('critical');
    expect(ALERT_CONDITIONS.tvlDropPercent.severity).toBe('warning');
    expect(ALERT_CONDITIONS.queueBacklog.severity).toBe('warning');
    expect(ALERT_CONDITIONS.exchangeRateDrop.severity).toBe('critical');
  });
});
