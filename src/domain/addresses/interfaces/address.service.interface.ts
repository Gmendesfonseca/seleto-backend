import { Address, AddressFilters } from './address.interface';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';
import { PaginatedList } from 'src/shared/interfaces';

export abstract class AddressServiceInterface {
  abstract findOne(id: string): Promise<Address | null>;
  abstract findAll(filters?: AddressFilters): Promise<PaginatedList<Address>>;
  abstract create(createAddressDto: CreateAddressDto): Promise<Address>;
  abstract update(id: string, updateAddressDto: UpdateAddressDto): Promise<Address>;
  abstract remove(id: string): Promise<void>;
  abstract setPrimary(
    id: string,
    ownerId: string,
    ownerType: 'person' | 'company',
  ): Promise<Address>;
}
