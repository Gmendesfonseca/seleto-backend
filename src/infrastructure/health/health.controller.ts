import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';
import { Authorized } from 'src/shared/decorators/authorization.decorator';
import { RedisHealthIndicator } from './redis-health.indicator';

@Controller({
  version: VERSION_NEUTRAL,
  path: 'health',
})
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private pg: SequelizeHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  @Get()
  @Authorized()
  @HealthCheck()
  public async check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.pg.pingCheck('database', { timeout: 1500 }),
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
