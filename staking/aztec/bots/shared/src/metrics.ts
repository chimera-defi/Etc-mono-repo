/**
 * Prometheus Metrics Utility
 * 
 * Provides Prometheus metrics collection for all bots.
 * Uses prom-client for Prometheus-compatible metrics.
 */

import { Registry, Counter, Gauge, Histogram } from 'prom-client';

export class Metrics {
  private registry: Registry;
  private counters: Map<string, Counter>;
  private gauges: Map<string, Gauge>;
  private histograms: Map<string, Histogram>;

  constructor() {
    this.registry = new Registry();
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
  }

  /**
   * Create or get a counter metric
   */
  counter(name: string, help: string, labelNames: string[] = []): Counter {
    if (!this.counters.has(name)) {
      const counter = new Counter({
        name,
        help,
        labelNames,
        registers: [this.registry],
      });
      this.counters.set(name, counter);
    }
    return this.counters.get(name)!;
  }

  /**
   * Create or get a gauge metric
   */
  gauge(name: string, help: string, labelNames: string[] = []): Gauge {
    if (!this.gauges.has(name)) {
      const gauge = new Gauge({
        name,
        help,
        labelNames,
        registers: [this.registry],
      });
      this.gauges.set(name, gauge);
    }
    return this.gauges.get(name)!;
  }

  /**
   * Create or get a histogram metric
   */
  histogram(name: string, help: string, labelNames: string[] = []): Histogram {
    if (!this.histograms.has(name)) {
      const histogram = new Histogram({
        name,
        help,
        labelNames,
        buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
        registers: [this.registry],
      });
      this.histograms.set(name, histogram);
    }
    return this.histograms.get(name)!;
  }

  /**
   * Get Prometheus metrics output
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Reset all metrics (useful for testing)
   */
  reset(): void {
    this.registry.resetMetrics();
  }
}
