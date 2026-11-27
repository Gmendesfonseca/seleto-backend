import { DateTime } from 'luxon';
import { PhoneType } from '../phone.model';

export class CreatePhoneDto {
  userId: string;
  number: string;
  type: PhoneType;
  isPrimary?: boolean;
}

export class UpdatePhoneDto {
  number?: string;
  type?: PhoneType;
  isPrimary?: boolean;
}

export class PhoneResponseDto {
  id: string;
  userId: string;
  number: string;
  type: PhoneType;
  isPrimary: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}
