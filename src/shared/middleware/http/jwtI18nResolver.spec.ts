import { ExecutionContext } from '@nestjs/common';
import { JwtI18nResolver } from './jwtI18nResolver';

describe('JwtI18nResolver', () => {
  const resolver = new JwtI18nResolver();

  const contextWith = (request: object) =>
    ({ switchToHttp: () => ({ getRequest: () => request }) }) as unknown as ExecutionContext;

  it('returns the default language stored in the JWT config', () => {
    const request = { auth: { sub: 'user-1', config: { default_language: 'en' } } };

    expect(resolver.resolve(contextWith(request))).toBe('en');
  });

  it('returns undefined when the request is not authenticated', () => {
    expect(resolver.resolve(contextWith({}))).toBeUndefined();
  });

  it('returns undefined when the JWT carries no language preference', () => {
    const request = { auth: { sub: 'user-1', config: {} } };

    expect(resolver.resolve(contextWith(request))).toBeUndefined();
  });
});
