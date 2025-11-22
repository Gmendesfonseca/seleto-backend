import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Phone as PhoneModel } from '../phone.model';
import { PhoneRepository } from './phone.repository.interface';
import { Phone, PhoneFilters } from '../interfaces/phone.interface';
import { CreatePhoneDto, UpdatePhoneDto } from '../dto/phone.dto';
import { WhereOptions } from 'sequelize';

@Injectable()
export class PhoneSequelizeRepository implements PhoneRepository {
  private readonly logger = new Logger(PhoneSequelizeRepository.name);

  constructor(
    @InjectModel(PhoneModel)
    private readonly model: typeof PhoneModel,
  ) {}

  async create(createPhoneDto: CreatePhoneDto): Promise<Phone> {
    this.logger.debug('PhoneSequelizeRepository.create: Called');
    const phone = await this.model.create({
      userId: createPhoneDto.userId,
      number: createPhoneDto.number,
      type: createPhoneDto.type,
      isPrimary: createPhoneDto.isPrimary || false,
    } as PhoneModel);

    return this.toInterface(phone);
  }

  async findAll(filters?: PhoneFilters): Promise<Phone[]> {
    this.logger.debug('PhoneSequelizeRepository.findAll: Called');
    const where: WhereOptions<PhoneModel> = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.isPrimary !== undefined) {
      where.isPrimary = filters.isPrimary;
    }

    const phones = await this.model.findAll({ where });
    return phones.map((phone) => this.toInterface(phone));
  }

  async findOne(id: string): Promise<Phone | null> {
    this.logger.debug('PhoneSequelizeRepository.findOne: Called');
    const phone = await this.model.findByPk(id);
    return phone ? this.toInterface(phone) : null;
  }

  async update(id: string, updatePhoneDto: UpdatePhoneDto): Promise<Phone> {
    this.logger.debug('PhoneSequelizeRepository.update: Called');
    const phone = await this.model.findByPk(id);
    if (!phone) {
      throw new Error('Phone not found');
    }

    await phone.update(updatePhoneDto);
    return this.toInterface(phone);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('PhoneSequelizeRepository.delete: Called');
    await this.model.destroy({ where: { id } });
  }

  async findByPerson(userId: string): Promise<Phone[]> {
    this.logger.debug('PhoneSequelizeRepository.findByPerson: Called');
    const phones = await this.model.findAll({ where: { userId } });
    return phones.map((phone) => this.toInterface(phone));
  }

  async findPrimaryByPerson(userId: string): Promise<Phone | null> {
    this.logger.debug('PhoneSequelizeRepository.findPrimaryByPerson: Called');
    const phone = await this.model.findOne({
      where: { userId, isPrimary: true },
    });
    return phone ? this.toInterface(phone) : null;
  }

  private toInterface(phone: PhoneModel): Phone {
    return {
      id: phone.id,
      userId: phone.userId,
      number: phone.number,
      type: phone.type,
      isPrimary: phone.isPrimary,
      createdAt: phone.createdAt,
      updatedAt: phone.updatedAt,
    };
  }
}
