import { PhoneType } from '../phone.model';

export interface Phone {
  id: string;
  userId: string;
  number: string;
  type: PhoneType;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhoneFilters {
  userId?: string;
  type?: PhoneType;
  isPrimary?: boolean;
}
