import { SetMetadata } from '@nestjs/common';
import { PERMISSION_KEY } from 'src/shared/utils/constants';

export const Permission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);
