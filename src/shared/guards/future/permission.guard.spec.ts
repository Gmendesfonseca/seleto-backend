import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { PermissionGuard } from './permission.guard';
import { MessageClient } from './message-client.interface';
import { PERMISSION_KEY } from '../../utils/constants';

describe('future PermissionGuard', () => {
  const reflector = { get: jest.fn() };
  const client = { send: jest.fn() };
  const handler = jest.fn();
  const user = { id: 'user-1' };

  const context = {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => handler,
  } as unknown as ExecutionContext;

  let guard: PermissionGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new PermissionGuard(reflector as unknown as Reflector, client as MessageClient);
  });

  it('allows handlers without a declared permission', async () => {
    reflector.get.mockReturnValue(undefined);

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(reflector.get).toHaveBeenCalledWith(PERMISSION_KEY, handler);
    expect(client.send).not.toHaveBeenCalled();
  });

  it('sends the permission and user to the permission service and allows on HTTP 200', async () => {
    reflector.get.mockReturnValue(['vacancies.read']);
    client.send.mockReturnValue(of({ status: 200 }));

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(client.send).toHaveBeenCalledWith('permission_check', {
      permission: ['vacancies.read'],
      user,
    });
  });

  it('rejects with the status and message returned by the service', async () => {
    reflector.get.mockReturnValue(['vacancies.read']);
    client.send.mockReturnValue(of({ status: 403, message: 'No access' }));

    const error = await guard.canActivate(context).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(403);
    expect((error as HttpException).getResponse()).toEqual({
      message: 'No access',
      data: null,
      errors: null,
    });
  });

  it('rejects with 403 instead of crashing when the service returns nothing', async () => {
    reflector.get.mockReturnValue(['vacancies.read']);
    client.send.mockReturnValue(of(undefined));

    const error = await guard.canActivate(context).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(403);
  });
});
