import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigProperties } from './config.module';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ConfigProperties>) => {
        return {
          models: [],
          logging: configService.get('DB_LOGGING'),
          autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
          dialect: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          database: configService.get('DB_DATABASE'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
