import { PhoneType } from '../phone.model';

export class CreatePhoneDto {
  personId: string;
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
  personId: string;
  number: string;
  type: PhoneType;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}
