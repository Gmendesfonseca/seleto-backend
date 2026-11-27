import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard, PermissionServiceInterface } from './permission.guard';
import { PERMISSION_KEY } from '../utils/constants';

describe('PermissionGuard', () => {
  const reflector = { get: jest.fn() };
  const permissionService = { check: jest.fn() };
  const handler = jest.fn();
  const user = { id: 'user-1' };

  const context = {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => handler,
  } as unknown as ExecutionContext;

  let guard: PermissionGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new PermissionGuard(
      reflector as unknown as Reflector,
      permissionService as PermissionServiceInterface,
    );
  });

  it('allows handlers that declare no permission without calling the service', async () => {
    reflector.get.mockReturnValue(undefined);

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(reflector.get).toHaveBeenCalledWith(PERMISSION_KEY, handler);
    expect(permissionService.check).not.toHaveBeenCalled();
  });

  it('checks the declared permission for the request user and allows on HTTP 200', async () => {
    reflector.get.mockReturnValue(['vacancies.read']);
    permissionService.check.mockResolvedValue({ status: 200 });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(permissionService.check).toHaveBeenCalledWith({
      permission: ['vacancies.read'],
      user,
    });
  });

  it('denies with the service message when the check is not OK', async () => {
    reflector.get.mockReturnValue(['vacancies.read']);
    permissionService.check.mockResolvedValue({ status: 403, message: 'No access' });

    const error = await guard.canActivate(context).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect((error as UnauthorizedException).getResponse()).toMatchObject({
      message: 'No access',
      data: null,
      errors: null,
    });
  });

  it('denies instead of crashing when the service returns nothing', async () => {
    reflector.get.mockReturnValue(['vacancies.read']);
    permissionService.check.mockResolvedValue(undefined);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
