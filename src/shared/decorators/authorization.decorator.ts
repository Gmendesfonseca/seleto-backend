import { SetMetadata } from '@nestjs/common';
import { SECURED_KEY } from 'src/shared/utils/constants';

/**
 * Authorization Decorators
 *
 * Default behavior: All routes require JWT authentication via AuthGuard
 *
 * @Public() - Use this decorator to mark routes that don't need JWT authentication
 * @Authorized() - Explicitly marks routes that need JWT authentication (redundant, as this is default)
 */

// Decorator to mark routes that don't need JWT authentication
export const Public = () => SetMetadata(SECURED_KEY, true);

// Decorator to explicitly mark routes that need JWT authentication (this is the default behavior)
export const Authorized = () => SetMetadata(SECURED_KEY, false);
