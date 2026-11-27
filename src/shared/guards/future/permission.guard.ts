import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { MessageClient } from './message-client.interface';
import { PERMISSION_KEY } from '../../utils/constants';

interface PermissionCheckResponse {
  status?: number;
  message?: string;
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('PERMISSION_SERVICE')
    private readonly permissionServiceClient: MessageClient,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<string[]>(PERMISSION_KEY, context.getHandler());

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const permissionInfo = await firstValueFrom(
      this.permissionServiceClient.send<PermissionCheckResponse | null | undefined>(
        'permission_check',
        { permission, user: request.user },
      ),
    );

    if (!permissionInfo || permissionInfo.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: permissionInfo?.message,
          data: null,
          errors: null,
        },
        permissionInfo?.status ?? HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
