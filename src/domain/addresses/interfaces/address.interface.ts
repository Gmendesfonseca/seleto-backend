export interface Address {
  id: string;
  personId?: string | null;
  companyId?: string | null;
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
  personId?: string;
  companyId?: string;
  city?: string;
  state?: string;
  country?: string;
  isPrimary?: boolean;
}
