import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import { AuthModule } from './domain/auth/auth.module';
import { UsersModule } from './domain/users/users.module';
import { SecretsModule } from './domain/secret/secret.module';

import { I18nModule } from './infrastructure/config/i18n.module';
import { LimitModule } from './infrastructure/config/limit.module';
import { QueueModule } from './infrastructure/config/queue.module';
import { HealthModule } from './infrastructure/health/health.module';
import { DatabaseModule } from './infrastructure/config/database.module';

import { PaginationMiddleware } from './shared/middleware/pagination/pagination.middleware';
import { MailerModule } from './domain/mailers/mailer.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    DatabaseModule,
    LimitModule,
    HealthModule,
    QueueModule,
    I18nModule,
    UsersModule,
    MailerModule,
    SecretsModule,
  ],
  providers: [JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PaginationMiddleware).forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
