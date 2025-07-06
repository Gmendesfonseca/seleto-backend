import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigProperties } from '../../infraestructure/config/config.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/domain/auth/guard/auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ConfigProperties>) => {
        return {
          secret: configService.get('JWT_SECRET'),
          global: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
