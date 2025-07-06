import * as Joi from 'joi';
import { LogLevel, Module } from '@nestjs/common';
import { ConfigModule as NestConfig } from '@nestjs/config';
import { join } from 'path';

const logLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose', 'fatal'];

type ApplicationProperties = {
  DRIVE_DISK: string;
  PORT: number;
  NODE_ENV: string;
  LOG_LEVEL: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  AWS_REGION: string;
  AWS_BUCKET: string;
  CORS_ORIGINS: string;
  JWT_SECRET: string;
  SMTP_PORT: number;
  SMTP_HOST: string;
  SMTP_USERNAME: string;
  SMTP_PASSWORD: string;
  FROM_EMAIL: string;
  FROM_HOST: string;
  FRONTEND_URL: string;
};

type DatabaseProperties = {
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_LOGGING: boolean;
  DB_AUTO_LOAD_MODELS: boolean;
};

type QueueProperties = {
  REDIS_HOST: string;
  REDIS_PORT: number;
};

export type ConfigProperties = DatabaseProperties & ApplicationProperties & QueueProperties;

const configSchema: Joi.StrictSchemaMap<ConfigProperties> = {
  DRIVE_DISK: Joi.string().valid('local', 's3').default('local'),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  LOG_LEVEL: Joi.string()
    .custom((value: string, helpers) => {
      const levels = value.split(',').map((level) => level.trim()) as LogLevel[];
      const invalidLevels = levels.filter((level) => !logLevels.includes(level));
      if (invalidLevels.length > 0) {
        return helpers.error('any.invalid', {
          levels: invalidLevels.join(', '),
        });
      }
      return levels;
    }, 'custom log level validation')
    .default('log,error,warn')
    .messages({
      'any.invalid': 'LOG_LEVEL contains invalid values: {{#levels}}',
    })
    .description('Allowed log levels: log, error, warn, debug, verbose'),
  CORS_ORIGINS: Joi.string()
    .required()
    .custom((value: string) => {
      return value.split(',').map((origin) => origin.trim());
    })
    .default(['*'])
    .description('Array of allowed origins'),
  PORT: Joi.number().port().default(3337),
  DB_HOST: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_PORT: Joi.number().integer().required(),
  DB_LOGGING: Joi.boolean().default(false),
  DB_AUTO_LOAD_MODELS: Joi.boolean().default(true),
  JWT_SECRET: Joi.string().required(),
  AWS_BUCKET: Joi.string().when('DRIVE_DISK', {
    is: 's3',
    then: Joi.required(),
  }),
  AWS_REGION: Joi.string().when('DRIVE_DISK', {
    is: 's3',
    then: Joi.required(),
  }),
  AWS_ACCESS_KEY: Joi.string().when('DRIVE_DISK', {
    is: 's3',
    then: Joi.required(),
  }),
  AWS_SECRET_KEY: Joi.string().when('DRIVE_DISK', {
    is: 's3',
    then: Joi.required(),
  }),
  SMTP_PORT: Joi.number().port().required(),
  SMTP_HOST: Joi.string().required(),
  SMTP_USERNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  FROM_EMAIL: Joi.string().email().required(),
  FROM_HOST: Joi.string().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().integer().required(),
};

@Module({
  imports: [
    NestConfig.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), '.env'), '.env'],
      validationSchema: Joi.object(configSchema),
    }),
  ],
})
export class ConfigModule {}
