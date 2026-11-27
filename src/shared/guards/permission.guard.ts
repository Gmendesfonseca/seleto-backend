import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../utils/constants';

export interface PermissionCheckResult {
  status: number;
  message?: string;
}

export interface PermissionServiceInterface {
  check(input: {
    permission: string | string[];
    user: unknown;
  }): Promise<PermissionCheckResult | null | undefined>;
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionServiceInterface,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<string[]>(PERMISSION_KEY, context.getHandler());

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const permissionInfo = await this.permissionService.check({
      permission,
      user: request.user,
    });

    if (!permissionInfo || permissionInfo.status !== HttpStatus.OK) {
      throw new UnauthorizedException({
        message: permissionInfo?.message,
        data: null,
        errors: null,
      });
    }

    return true;
  }
}
