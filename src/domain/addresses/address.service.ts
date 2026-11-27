import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { AddressServiceInterface } from './interfaces/address.service.interface';
import { AddressRepository } from './repositories/address.repository.interface';
import { Address, AddressFilters } from './interfaces/address.interface';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { PaginatedList } from 'src/shared/interfaces';

@Injectable()
export class AddressService implements AddressServiceInterface {
  private readonly logger = new Logger(AddressService.name);

  constructor(
    @Inject(AddressRepository)
    private readonly addressRepository: AddressRepository,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    this.logger.debug('AddressService.create: Called');
    return this.addressRepository.create(createAddressDto);
  }

  async findAll(filters?: AddressFilters): Promise<PaginatedList<Address>> {
    this.logger.debug('AddressService.findAll: Called');
    const models = await this.addressRepository.findAll(filters);
    return {
      data: models,
      meta: { total: models.length, currentPage: 1, lastPage: 1, perPage: models.length },
    };
  }

  async findOne(id: string): Promise<Address | null> {
    this.logger.debug('AddressService.findOne: Called');
    return this.addressRepository.findOne(id);
  }

  async update(id: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    this.logger.debug('AddressService.update: Called');
    const address = await this.addressRepository.findOne(id);
    if (!address) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }
    return this.addressRepository.update(id, updateAddressDto);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('AddressService.remove: Called');
    const address = await this.addressRepository.findOne(id);
    if (!address) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }
    await this.addressRepository.delete(id);
  }

  async findByUser(userId: string): Promise<Address[]> {
    this.logger.debug('AddressService.findByUser: Called');
    return this.addressRepository.findByUser(userId);
  }

  async setPrimary(id: string): Promise<Address> {
    this.logger.debug('AddressService.setPrimary: Called');
    const address = await this.addressRepository.findOne(id);
    if (!address) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }

    const userAddresses = await this.addressRepository.findByUser(address.userId);
    for (const addr of userAddresses) {
      if (addr.id !== id && addr.isPrimary) {
        await this.addressRepository.update(addr.id, { isPrimary: false });
      }
    }

    return this.addressRepository.update(id, { isPrimary: true });
  }
}
