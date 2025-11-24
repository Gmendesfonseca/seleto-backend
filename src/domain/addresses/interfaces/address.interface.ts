import { DateTime } from 'luxon';

export interface Address {
  id: string;
  userId: string;
  street: string;
  number: string;
  complement?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isPrimary: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface AddressFilters {
  userId?: string;
  city?: string;
  state?: string;
  country?: string;
  isPrimary?: boolean;
}
