import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceInterface } from './interfaces';
import { UsersModule } from '../users/users.module';
import { SecretsModule } from '../secret/secret.module';
import { MailerModule } from '../mailers/mailer.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    SecretsModule,
    MailerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          global: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthServiceInterface,
      useClass: AuthService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [
    {
      provide: AuthServiceInterface,
      useClass: AuthService,
    },
  ],
})
export class AuthModule {}
