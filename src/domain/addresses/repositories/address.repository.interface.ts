import { Address, AddressFilters } from '../interfaces/address.interface';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';

export abstract class AddressRepository {
  abstract findAll(filters?: AddressFilters): Promise<Address[]>;
  abstract findOne(id: string): Promise<Address | null>;
  abstract create(createAddressDto: CreateAddressDto): Promise<Address>;
  abstract update(id: string, updateAddressDto: UpdateAddressDto): Promise<Address>;
  abstract delete(id: string): Promise<void>;
}
