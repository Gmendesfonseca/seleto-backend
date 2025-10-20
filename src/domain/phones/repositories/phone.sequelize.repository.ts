import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Phone as PhoneModel } from '../phone.model';
import { PhoneRepository } from './phone.repository.interface';
import { Phone, PhoneFilters } from '../interfaces/phone.interface';
import { CreatePhoneDto, UpdatePhoneDto } from '../dto/phone.dto';

@Injectable()
export class PhoneSequelizeRepository implements PhoneRepository {
  private readonly logger = new Logger(PhoneSequelizeRepository.name);

  constructor(
    @InjectModel(PhoneModel)
    private readonly phoneModel: typeof PhoneModel,
  ) {}

  async create(createPhoneDto: CreatePhoneDto): Promise<Phone> {
    this.logger.debug('PhoneSequelizeRepository.create: Called');
    const phone = await this.phoneModel.create({
      personId: createPhoneDto.personId,
      number: createPhoneDto.number,
      type: createPhoneDto.type,
      isPrimary: createPhoneDto.isPrimary || false,
    } as any);

    return this.toInterface(phone);
  }

  async findAll(filters?: PhoneFilters): Promise<Phone[]> {
    this.logger.debug('PhoneSequelizeRepository.findAll: Called');
    const where: any = {};

    if (filters?.personId) {
      where.personId = filters.personId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.isPrimary !== undefined) {
      where.isPrimary = filters.isPrimary;
    }

    const phones = await this.phoneModel.findAll({ where });
    return phones.map((phone) => this.toInterface(phone));
  }

  async findOne(id: string): Promise<Phone | null> {
    this.logger.debug('PhoneSequelizeRepository.findOne: Called');
    const phone = await this.phoneModel.findByPk(id);
    return phone ? this.toInterface(phone) : null;
  }

  async update(id: string, updatePhoneDto: UpdatePhoneDto): Promise<Phone> {
    this.logger.debug('PhoneSequelizeRepository.update: Called');
    const phone = await this.phoneModel.findByPk(id);
    if (!phone) {
      throw new Error('Phone not found');
    }

    await phone.update(updatePhoneDto);
    return this.toInterface(phone);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('PhoneSequelizeRepository.delete: Called');
    await this.phoneModel.destroy({ where: { id } });
  }

  async findByPerson(personId: string): Promise<Phone[]> {
    this.logger.debug('PhoneSequelizeRepository.findByPerson: Called');
    const phones = await this.phoneModel.findAll({ where: { personId } });
    return phones.map((phone) => this.toInterface(phone));
  }

  async findPrimaryByPerson(personId: string): Promise<Phone | null> {
    this.logger.debug('PhoneSequelizeRepository.findPrimaryByPerson: Called');
    const phone = await this.phoneModel.findOne({
      where: { personId, isPrimary: true },
    });
    return phone ? this.toInterface(phone) : null;
  }

  private toInterface(phone: PhoneModel): Phone {
    return {
      id: phone.id,
      personId: phone.personId,
      number: phone.number,
      type: phone.type,
      isPrimary: phone.isPrimary,
      createdAt: phone.createdAt,
      updatedAt: phone.updatedAt,
    };
  }
}
