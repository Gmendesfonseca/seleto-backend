import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Address as AddressModel } from '../address.model';
import { AddressRepository } from './address.repository.interface';
import { Address, AddressFilters } from '../interfaces/address.interface';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';

@Injectable()
export class AddressSequelizeRepository implements AddressRepository {
  private readonly logger = new Logger(AddressSequelizeRepository.name);

  constructor(
    @InjectModel(AddressModel)
    private readonly addressModel: typeof AddressModel,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    this.logger.debug('AddressSequelizeRepository.create: Called');
    const address = await this.addressModel.create({
      personId: createAddressDto.personId || null,
      companyId: createAddressDto.companyId || null,
      street: createAddressDto.street,
      number: createAddressDto.number,
      complement: createAddressDto.complement || null,
      city: createAddressDto.city,
      state: createAddressDto.state,
      country: createAddressDto.country,
      postalCode: createAddressDto.postalCode,
      isPrimary: createAddressDto.isPrimary || false,
    } as any);

    return this.toInterface(address);
  }

  async findAll(filters?: AddressFilters): Promise<Address[]> {
    this.logger.debug('AddressSequelizeRepository.findAll: Called');
    const where: any = {};

    if (filters?.personId) {
      where.personId = filters.personId;
    }

    if (filters?.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters?.city) {
      where.city = filters.city;
    }

    if (filters?.state) {
      where.state = filters.state;
    }

    if (filters?.country) {
      where.country = filters.country;
    }

    if (filters?.isPrimary !== undefined) {
      where.isPrimary = filters.isPrimary;
    }

    const addresses = await this.addressModel.findAll({ where });
    return addresses.map((address) => this.toInterface(address));
  }

  async findOne(id: string): Promise<Address | null> {
    this.logger.debug('AddressSequelizeRepository.findOne: Called');
    const address = await this.addressModel.findByPk(id);
    return address ? this.toInterface(address) : null;
  }

  async update(id: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    this.logger.debug('AddressSequelizeRepository.update: Called');
    const address = await this.addressModel.findByPk(id);
    if (!address) {
      throw new Error('Address not found');
    }

    await address.update(updateAddressDto);
    return this.toInterface(address);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('AddressSequelizeRepository.delete: Called');
    await this.addressModel.destroy({ where: { id } });
  }

  async findByPerson(personId: string): Promise<Address[]> {
    this.logger.debug('AddressSequelizeRepository.findByPerson: Called');
    const addresses = await this.addressModel.findAll({ where: { personId } });
    return addresses.map((address) => this.toInterface(address));
  }

  async findByCompany(companyId: string): Promise<Address[]> {
    this.logger.debug('AddressSequelizeRepository.findByCompany: Called');
    const addresses = await this.addressModel.findAll({ where: { companyId } });
    return addresses.map((address) => this.toInterface(address));
  }

  async findPrimaryByPerson(personId: string): Promise<Address | null> {
    this.logger.debug('AddressSequelizeRepository.findPrimaryByPerson: Called');
    const address = await this.addressModel.findOne({
      where: { personId, isPrimary: true },
    });
    return address ? this.toInterface(address) : null;
  }

  async findPrimaryByCompany(companyId: string): Promise<Address | null> {
    this.logger.debug('AddressSequelizeRepository.findPrimaryByCompany: Called');
    const address = await this.addressModel.findOne({
      where: { companyId, isPrimary: true },
    });
    return address ? this.toInterface(address) : null;
  }

  private toInterface(address: AddressModel): Address {
    return {
      id: address.id,
      personId: address.personId,
      companyId: address.companyId,
      street: address.street,
      number: address.number,
      complement: address.complement,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      isPrimary: address.isPrimary,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }
}
