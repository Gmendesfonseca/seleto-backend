import { Module } from '@nestjs/common';
import { AcceptLanguageResolver, I18nModule as I18n } from 'nestjs-i18n';
import * as path from 'path';
import { JwtI18nResolver } from 'src/shared/middleware/http/jwtI18nResolver';

@Module({
  imports: [
    I18n.forRoot({
      disableMiddleware: true,
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'src/shared/i18n/'),
        watch: true,
      },
      resolvers: [JwtI18nResolver, AcceptLanguageResolver],
    }),
  ],
  providers: [JwtI18nResolver],
})
export class I18nModule {}
