import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
    private readonly registry: Registry;
    public readonly matchingRequestCounter: Counter<string>;
    public readonly matchingDurationHistogram: Histogram<string>;

    constructor() {
        this.registry = new Registry();
        this.registry.setDefaultLabels({
            app: 'matching-core'
        });

        this.matchingRequestCounter = new Counter({
            name: 'matching_requests_total',
            help: 'Total number of matching requests',
            labelNames: ['strategy', 'status'],
            registers: [this.registry]
        });

        this.matchingDurationHistogram = new Histogram({
            name: 'matching_duration_seconds',
            help: 'Duration of matching process in seconds',
            labelNames: ['strategy'],
            buckets: [0.1, 0.5, 1, 2, 5, 10],
            registers: [this.registry]
        });
    }

    async getMetrics(): Promise<string> {
        return this.registry.metrics();
    }
}
