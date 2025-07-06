import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    @Inject('REDIS') private readonly redis: Redis,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    try {
      const result = await this.redis.ping();
      if (result === 'PONG') {
        return indicator.up();
      } else {
        return indicator.down();
      }
    } catch {
      return indicator.down('Unable to retrieve dogs');
    }
  }
}
