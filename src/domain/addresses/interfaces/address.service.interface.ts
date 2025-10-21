import { Address, AddressFilters } from './address.interface';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';

export abstract class AddressServiceInterface {
  abstract create(createAddressDto: CreateAddressDto): Promise<Address>;
  abstract findAll(filters?: AddressFilters): Promise<Address[]>;
  abstract findOne(id: string): Promise<Address | null>;
  abstract update(id: string, updateAddressDto: UpdateAddressDto): Promise<Address>;
  abstract remove(id: string): Promise<void>;
  abstract findByPerson(personId: string): Promise<Address[]>;
  abstract findByCompany(companyId: string): Promise<Address[]>;
  abstract setPrimary(
    id: string,
    ownerId: string,
    ownerType: 'person' | 'company',
  ): Promise<Address>;
}
