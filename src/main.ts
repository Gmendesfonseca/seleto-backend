import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogLevel, ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { applyGlobalPrefix, DEFAULT_API_PREFIX } from './infrastructure/config/global-prefix';
import { createOpenApiDocument } from './infrastructure/config/swagger';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const logLevels = configService.get<LogLevel[]>('LOG_LEVEL');
  const corsOriginsString = configService.get<string>('CORS_ORIGINS') ?? '*';

  const corsOrigins =
    corsOriginsString === '*' ? ['*'] : corsOriginsString.split(',').map((origin) => origin.trim());

  app.useLogger(new ConsoleLogger('Seleto Backend', { logLevels }));

  applyGlobalPrefix(app, configService.get<string>('API_PREFIX') ?? DEFAULT_API_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      errorHttpStatusCode: 422,
      enableDebugMessages: true,
    }),
  );

  SwaggerModule.setup('docs', app, await createOpenApiDocument(app));

  app.use(helmet());
  interface CorsOptions {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => void;
    optionsSuccessStatus: number;
    credentials: boolean;
  }

  const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (corsOrigins.includes('*')) {
        return callback(null, true);
      }

      if (corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    optionsSuccessStatus: 204,
    credentials: true,
  };

  app.enableCors(corsOptions);

  const port = configService.get<number>('PORT') ?? 5000;

  await app.listen(port, '0.0.0.0');
}

bootstrap();
