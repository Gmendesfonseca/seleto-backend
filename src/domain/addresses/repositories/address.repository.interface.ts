import { Address, AddressFilters } from '../interfaces/address.interface';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';

export abstract class AddressRepository {
  abstract create(createAddressDto: CreateAddressDto): Promise<Address>;
  abstract findAll(filters?: AddressFilters): Promise<Address[]>;
  abstract findOne(id: string): Promise<Address | null>;
  abstract update(id: string, updateAddressDto: UpdateAddressDto): Promise<Address>;
  abstract delete(id: string): Promise<void>;
  abstract findByPerson(personId: string): Promise<Address[]>;
  abstract findByCompany(companyId: string): Promise<Address[]>;
  abstract findPrimaryByPerson(personId: string): Promise<Address | null>;
  abstract findPrimaryByCompany(companyId: string): Promise<Address | null>;
}
