import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { SECURED_KEY } from 'src/shared/utils/constants';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let request: { headers: Record<string, string | undefined>; auth?: unknown };

  const jwtService = { verifyAsync: jest.fn() };
  const reflector = { getAllAndOverride: jest.fn() };
  const handler = jest.fn();
  class TestController {}

  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getClass: () => TestController,
    getHandler: () => handler,
  } as unknown as ExecutionContext;

  const rejection = async () => {
    const error = await authGuard.canActivate(context).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(UnauthorizedException);
    return (error as UnauthorizedException).getResponse();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    request = { headers: {} };
    reflector.getAllAndOverride.mockReturnValue(false);
    authGuard = new AuthGuard(
      reflector as unknown as Reflector,
      jwtService as unknown as JwtService,
    );
  });

  afterEach(() => jest.restoreAllMocks());

  it('attaches the verified payload to the request when the bearer token is valid', async () => {
    const payload = { sub: 'user-1', companyId: 'company-1' };
    request.headers.authorization = 'Bearer valid-token';
    jwtService.verifyAsync.mockResolvedValueOnce(payload);

    await expect(authGuard.canActivate(context)).resolves.toBe(true);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(request.auth).toEqual(payload);
  });

  it('skips authentication for routes flagged as public', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(authGuard.canActivate(context)).resolves.toBe(true);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(SECURED_KEY, [
      handler,
      TestController,
    ]);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    expect(request.auth).toBeUndefined();
  });

  it('rejects with T001 when the authorization header is missing', async () => {
    expect(await rejection()).toEqual({ code: 401, icTrace: 'T001', message: 'Auth?' });
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects with T001 when the scheme is not Bearer', async () => {
    request.headers.authorization = 'Basic abc123';

    expect(await rejection()).toEqual({ code: 401, icTrace: 'T001', message: 'Auth?' });
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects with T002 when the token cannot be verified', async () => {
    request.headers.authorization = 'Bearer invalid-token';
    jwtService.verifyAsync.mockRejectedValueOnce(new Error('Invalid token'));

    expect(await rejection()).toEqual({ code: 401, icTrace: 'T002', message: 'Token Invalid' });
    expect(request.auth).toBeUndefined();
  });

  it('rejects with T002 when the token is expired', async () => {
    request.headers.authorization = 'Bearer expired-token';
    const expired = new Error('jwt expired');
    expired.name = 'TokenExpiredError';
    jwtService.verifyAsync.mockRejectedValueOnce(expired);

    expect(await rejection()).toEqual({ code: 401, icTrace: 'T002', message: 'Token Invalid' });
  });
});
