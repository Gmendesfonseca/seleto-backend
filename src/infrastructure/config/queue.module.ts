import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigProperties } from './config.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ConfigProperties>) => {
        return {
          connection: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
          defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: 1000,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000 * 60,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class QueueModule {}
