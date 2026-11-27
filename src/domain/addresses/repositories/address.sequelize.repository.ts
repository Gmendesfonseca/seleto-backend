import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Address } from '../address.model';
import { AddressRepository } from './address.repository.interface';
import { AddressFilters } from '../interfaces/address.interface';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';
import { WhereOptions } from 'sequelize';

@Injectable()
export class AddressSequelizeRepository implements AddressRepository {
  private readonly logger = new Logger(AddressSequelizeRepository.name);

  constructor(
    @InjectModel(Address)
    private readonly addressModel: typeof Address,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    this.logger.debug('AddressSequelizeRepository.create: Called');
    return this.addressModel.create({
      userId: createAddressDto.userId,
      street: createAddressDto.street,
      number: createAddressDto.number,
      complement: createAddressDto.complement || null,
      city: createAddressDto.city,
      state: createAddressDto.state,
      country: createAddressDto.country,
      postalCode: createAddressDto.postalCode,
      isPrimary: createAddressDto.isPrimary || false,
    } as any);
  }

  async findAll(filters?: AddressFilters): Promise<Address[]> {
    this.logger.debug('AddressSequelizeRepository.findAll: Called');
    const where: WhereOptions<Address> = {};

    if (filters?.userId) {
      where.userId = filters.userId;
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

    return this.addressModel.findAll({ where });
  }

  async findOne(id: string): Promise<Address | null> {
    this.logger.debug('AddressSequelizeRepository.findOne: Called');
    return this.addressModel.findByPk(id);
  }

  async update(id: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    this.logger.debug('AddressSequelizeRepository.update: Called');
    const address = await this.addressModel.findByPk(id);
    if (!address) {
      throw new Error('Address not found');
    }

    return address.update(updateAddressDto);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('AddressSequelizeRepository.delete: Called');
    await this.addressModel.destroy({ where: { id } });
  }

  async findByUser(userId: string): Promise<Address[]> {
    this.logger.debug('AddressSequelizeRepository.findByUser: Called');
    return this.addressModel.findAll({ where: { userId } });
  }
}
