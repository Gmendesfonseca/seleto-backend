import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, throwError } from 'rxjs';
import { AuthorizationGuard } from './authorization.guard';
import { MessageClient } from './message-client.interface';
import { SECURED_KEY } from '../../utils/constants';

describe('future AuthorizationGuard', () => {
  const reflector = { get: jest.fn() };
  const tokenClient = { send: jest.fn() };
  const userClient = { send: jest.fn() };
  const handler = jest.fn();
  let request: { headers: Record<string, string>; user?: unknown };

  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => handler,
  } as unknown as ExecutionContext;

  let guard: AuthorizationGuard;

  const failure = async () => {
    const error = await guard.canActivate(context).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpException);
    return error as HttpException;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    request = { headers: { authorization: 'Bearer abc' } };
    reflector.get.mockReturnValue(['secured']);
    guard = new AuthorizationGuard(
      reflector as unknown as Reflector,
      tokenClient as MessageClient,
      userClient as MessageClient,
    );
  });

  it('skips routes without secured metadata', async () => {
    reflector.get.mockReturnValue(undefined);

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(reflector.get).toHaveBeenCalledWith(SECURED_KEY, handler);
    expect(tokenClient.send).not.toHaveBeenCalled();
  });

  it('rejects with 401 when the authorization header is missing', async () => {
    request.headers = {};

    const error = await failure();

    expect(error.getStatus()).toBe(401);
    expect(error.getResponse()).toEqual({
      message: 'Authorization header is required',
      data: null,
      errors: null,
    });
  });

  it('resolves the token owner and attaches the user to the request', async () => {
    const user = { id: 'user-1' };
    tokenClient.send.mockReturnValue(of({ data: { userId: 'user-1' } }));
    userClient.send.mockReturnValue(of({ user }));

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(tokenClient.send).toHaveBeenCalledWith('token_decode', { token: 'Bearer abc' });
    expect(userClient.send).toHaveBeenCalledWith('user_get_by_id', 'user-1');
    expect(request.user).toBe(user);
  });

  it('forwards the status and message of a rejected token', async () => {
    tokenClient.send.mockReturnValue(of({ message: 'Expired', status: 419 }));

    const error = await failure();

    expect(error.getStatus()).toBe(419);
    expect(error.getResponse()).toMatchObject({ message: 'Expired' });
  });

  it('rejects with 404 when the token owner does not exist', async () => {
    tokenClient.send.mockReturnValue(of({ data: { userId: 'user-1' } }));
    userClient.send.mockReturnValue(of({}));

    const error = await failure();

    expect(error.getStatus()).toBe(404);
    expect(request.user).toBeUndefined();
  });

  it('rejects with 401 when a service call fails', async () => {
    tokenClient.send.mockReturnValue(throwError(() => new Error('down')));

    const error = await failure();

    expect(error.getStatus()).toBe(401);
    expect(error.getResponse()).toMatchObject({ message: 'Authentication failed' });
  });
});
