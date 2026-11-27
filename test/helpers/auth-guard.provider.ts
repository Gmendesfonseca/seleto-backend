import { Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../../src/domain/auth/guard/auth.guard';

// AuthModule registers this guard globally; specs that mount controllers alone must add it themselves.
export const authGuardProvider: Provider = { provide: APP_GUARD, useClass: AuthGuard };
