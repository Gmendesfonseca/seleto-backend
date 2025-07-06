import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogLevel, ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const logLevels = configService.get<LogLevel[]>('LOG_LEVEL');
  const corsOrigins = configService.get<string[]>('CORS_ORIGINS') ?? [];

  app.useLogger(new ConsoleLogger('Chat Backend', { logLevels }));

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
      if (corsOrigins.indexOf(origin ?? '') !== -1 || corsOrigins.indexOf('*') !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    optionsSuccessStatus: 204,
    credentials: true,
  };

  app.enableCors(corsOptions);
  await app.listen(configService.get<number>('PORT') ?? 3337);
}
bootstrap();
