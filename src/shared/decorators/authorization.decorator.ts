import { SetMetadata } from '@nestjs/common';
import { SECURED_KEY } from 'src/shared/utils/constants';

export const Authorized = (secured: boolean = true) => SetMetadata(SECURED_KEY, secured);
