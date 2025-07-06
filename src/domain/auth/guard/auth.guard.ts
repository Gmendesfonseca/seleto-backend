import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Jwt } from 'src/shared/interfaces/jwt.interface';
import { SECURED_KEY } from 'src/shared/utils/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('AuthGuard.canActivate: called');

    const isSecured = this.reflector.getAllAndOverride<boolean>(SECURED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isSecured) {
      this.logger.debug('AuthGuard.canActivate: secured endpoint');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.debug('AuthGuard.canActivate: no token found');
      throw new UnauthorizedException({
        code: 401,
        icTrace: 'T001',
        message: 'Auth?',
      });
    }
    try {
      const payload = await this.jwtService.verifyAsync<Jwt>(token);
      request.auth = payload;
      this.logger.debug('AuthGuard.canActivate: authenticated');
    } catch {
      this.logger.debug('AuthGuard.canActivate: token invalid');
      throw new UnauthorizedException({
        code: 401,
        icTrace: 'T002',
        message: 'Token Invalid',
      });
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.get('authorization')?.split(' ') ?? [];
    this.logger.debug(`AuthGuard.extractTokenFromHeader: type=${type}, token=${token}`);
    return type === 'Bearer' ? token : undefined;
  }
}
