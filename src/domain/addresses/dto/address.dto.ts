export class CreateAddressDto {
  personId?: string;
  companyId?: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isPrimary?: boolean;
}

export class UpdateAddressDto {
  street?: string;
  number?: string;
  complement?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isPrimary?: boolean;
}

export class AddressResponseDto {
  id: string;
  personId?: string;
  companyId?: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isPrimary: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}
