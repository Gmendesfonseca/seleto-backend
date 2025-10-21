import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogLevel, ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const logLevels = configService.get<LogLevel[]>('LOG_LEVEL');
  const corsOriginsString = configService.get<string>('CORS_ORIGINS') ?? '*';

  const corsOrigins =
    corsOriginsString === '*' ? ['*'] : corsOriginsString.split(',').map((origin) => origin.trim());

  console.log('CORS Origins configured:', corsOrigins);

  app.useLogger(new ConsoleLogger('Chat Backend', { logLevels }));

  // Set global prefix for all routes except health checks
  const apiPrefix = configService.get<string>('API_PREFIX') ?? 'api/v1';
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/health', '/health/(.*)'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      errorHttpStatusCode: 422,
      enableDebugMessages: true,
    }),
  );

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
      console.log('CORS request from origin:', origin);

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
  console.log(`Server starting on port ${port}`);

  await app.listen(port, '0.0.0.0');
}

bootstrap();
