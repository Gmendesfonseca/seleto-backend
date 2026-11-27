import { Injectable, Inject, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { MessageClient } from './message-client.interface';
import { SECURED_KEY } from '../../utils/constants';
import { UserInterface } from 'src/domain/users/interfaces';

interface TokenDecodeResponse {
  data?: {
    userId: string;
  };
  message?: string;
  status?: number;
}

interface UserServiceResponse {
  user?: UserInterface;
  message?: string;
  status?: number;
}

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: MessageClient,
    @Inject('USER_SERVICE') private readonly userServiceClient: MessageClient,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const secured = this.reflector.get<string[]>(SECURED_KEY, context.getHandler());

    if (!secured) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      throw new HttpException(
        {
          message: 'Authorization header is required',
          data: null,
          errors: null,
        },
        401,
      );
    }

    try {
      const userTokenInfo = (await firstValueFrom(
        this.tokenServiceClient.send('token_decode', {
          token: request.headers.authorization,
        }),
      )) as TokenDecodeResponse;

      if (!userTokenInfo || !userTokenInfo.data) {
        throw new HttpException(
          {
            message: userTokenInfo?.message || 'Invalid token',
            data: null,
            errors: null,
          },
          userTokenInfo?.status || 401,
        );
      }

      const userInfo = (await firstValueFrom(
        this.userServiceClient.send('user_get_by_id', userTokenInfo.data.userId),
      )) as UserServiceResponse;

      if (!userInfo || !userInfo.user) {
        throw new HttpException(
          {
            message: 'User not found',
            data: null,
            errors: null,
          },
          404,
        );
      }

      request.user = userInfo.user;
      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Authentication failed',
          data: null,
          errors: null,
        },
        401,
      );
    }
  }
}
