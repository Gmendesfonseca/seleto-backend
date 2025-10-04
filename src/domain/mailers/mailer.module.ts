import { MailerModule as NestMailer } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ReactAdapter } from '@webtre/nestjs-mailer-react-adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    NestMailer.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: configService.get<string>('SMTP_SECURE') === 'true',
          ignoreTLS: configService.get<string>('SMTP_SECURE') !== 'false',
          auth: {
            user: configService.get<string>('SMTP_USERNAME'),
            pass: configService.get<string>('SMTP_PASSWORD'),
          },
        },
        template: {
          dir: `${process.cwd()}/mailers/templates/`,
          adapter: new ReactAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MailerModule {}
