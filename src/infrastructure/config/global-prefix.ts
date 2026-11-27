import { INestApplication } from '@nestjs/common';

export const DEFAULT_API_PREFIX = 'api/v1';

export function applyGlobalPrefix(app: INestApplication, prefix = DEFAULT_API_PREFIX): void {
  app.setGlobalPrefix(prefix, { exclude: ['/health', '/health/*path'] });
}
