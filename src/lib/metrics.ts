interface MetricLabels {
  [key: string]: string | number;
}

interface MetricData {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  labels?: MetricLabels;
  timestamp: Date;
}

class MetricsCollector {
  private metrics: MetricData[] = [];
  private maxSize = 10000; // Keep last 10k metrics in memory

  recordCounter(name: string, value: number = 1, labels?: MetricLabels): void {
    this.addMetric({
      name,
      type: 'counter',
      value,
      labels,
      timestamp: new Date(),
    });
  }

  recordGauge(name: string, value: number, labels?: MetricLabels): void {
    this.addMetric({
      name,
      type: 'gauge',
      value,
      labels,
      timestamp: new Date(),
    });
  }

  recordHistogram(name: string, value: number, labels?: MetricLabels): void {
    this.addMetric({
      name,
      type: 'histogram',
      value,
      labels,
      timestamp: new Date(),
    });
  }

  private addMetric(metric: MetricData): void {
    this.metrics.push(metric);

    // Keep only recent metrics to avoid memory issues
    if (this.metrics.length > this.maxSize) {
      this.metrics = this.metrics.slice(-this.maxSize);
    }

    // In production, this would be sent to a metrics backend (Prometheus, DataDog, etc.)
    if (process.env.NODE_ENV === 'development' && process.env.LOG_METRICS === 'true') {
      console.log(`[METRIC] ${metric.type}:${metric.name} = ${metric.value}`, metric.labels || {});
    }
  }

  getMetrics(since?: Date): MetricData[] {
    if (!since) return [...this.metrics];
    return this.metrics.filter(m => m.timestamp >= since);
  }

  getMetricsByName(name: string): MetricData[] {
    return this.metrics.filter(m => m.name === name);
  }

  clear(): void {
    this.metrics = [];
  }
}

export const metrics = new MetricsCollector();

// Convenience functions for common metrics
export const recordSessionStart = () =>
  metrics.recordCounter('sessions.started');

export const recordSessionEnd = (durationMs: number) => {
  metrics.recordCounter('sessions.ended');
  metrics.recordHistogram('session.duration_ms', durationMs);
};

export const recordMessage = (role: 'user' | 'ai') =>
  metrics.recordCounter('messages.sent', 1, { role });

export const recordSafetyFlag = (severity: string) =>
  metrics.recordCounter('safety.flags', 1, { severity });

export const recordJournalGeneration = (success: boolean) =>
  metrics.recordCounter('journal.generated', 1, { success: success ? 'true' : 'false' });

export const recordGoalCreated = () =>
  metrics.recordCounter('goals.created');

export const recordExerciseCompleted = (type: string) =>
  metrics.recordCounter('exercises.completed', 1, { type });

export const recordMoodLogged = (score: number) => {
  metrics.recordCounter('mood.logged');
  metrics.recordHistogram('mood.score', score);
};

export default metrics;
