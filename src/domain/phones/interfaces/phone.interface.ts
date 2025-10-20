import { PhoneType } from '../phone.model';

export interface Phone {
  id: string;
  personId: string;
  number: string;
  type: PhoneType;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhoneFilters {
  personId?: string;
  type?: PhoneType;
  isPrimary?: boolean;
}
