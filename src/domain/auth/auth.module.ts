import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceInterface } from './interfaces';
import { UsersModule } from '../users/users.module';
import { SecretsModule } from '../secret/secret.module';
import { MailerModule } from '../mailers/mailer.module';
import { CompanyModule } from '../companies/company.module';
import { PersonModule } from '../persons/person.module';
import { RefreshToken } from './models/refresh-token.model';
import { PasswordResetToken } from './models/password-reset-token.model';
import { RefreshTokenRepository } from './repositories/refresh-token.repository.interface';
import { RefreshTokenSequelizeRepository } from './repositories/refresh-token.sequelize.repository';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository.interface';
import { PasswordResetTokenSequelizeRepository } from './repositories/password-reset-token.sequelize.repository';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    SecretsModule,
    MailerModule,
    CompanyModule,
    PersonModule,
    SequelizeModule.forFeature([RefreshToken, PasswordResetToken]),
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
    {
      provide: RefreshTokenRepository,
      useClass: RefreshTokenSequelizeRepository,
    },
    {
      provide: PasswordResetTokenRepository,
      useClass: PasswordResetTokenSequelizeRepository,
    },
  ],
  exports: [
    {
      provide: AuthServiceInterface,
      useClass: AuthService,
    },
    RefreshTokenRepository,
    PasswordResetTokenRepository,
  ],
})
export class AuthModule {}
