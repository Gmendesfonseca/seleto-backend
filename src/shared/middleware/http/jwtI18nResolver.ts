import { Request } from 'express';
import { I18nResolver } from 'nestjs-i18n';
import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common/interfaces';

@Injectable()
export class JwtI18nResolver implements I18nResolver {
  private readonly logger = new Logger(JwtI18nResolver.name);

  resolve(context: ExecutionContext): string | undefined {
    this.logger.debug('JwtI18nResolver.resolve: Called');
    const request = context.switchToHttp().getRequest<Request>();
    const payload = request.auth;

    if (payload?.config?.default_language) {
      const { default_language } = payload.config;
      this.logger.debug(`JwtI18nResolver.resolve: set default language ${default_language}`);
      return default_language;
    }

    this.logger.debug('JwtI18nResolver.resolve: language settings not found');
    return undefined;
  }
}
