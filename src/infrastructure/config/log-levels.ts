import { LogLevel } from '@nestjs/common';

// ConfigService returns the raw process.env string, not the array the Joi schema produces.
export function toLogLevels(value: string | LogLevel[] | undefined): LogLevel[] | undefined {
  if (value === undefined || Array.isArray(value)) return value;
  return value
    .split(',')
    .map((level) => level.trim())
    .filter(Boolean) as LogLevel[];
}
