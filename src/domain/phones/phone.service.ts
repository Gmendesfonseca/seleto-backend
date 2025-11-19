import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { PhoneServiceInterface } from './interfaces/phone.service.interface';
import { PhoneRepository } from './repositories/phone.repository.interface';
import { Phone, PhoneFilters } from './interfaces/phone.interface';
import { CreatePhoneDto, UpdatePhoneDto } from './dto/phone.dto';

@Injectable()
export class PhoneService implements PhoneServiceInterface {
  private readonly logger = new Logger(PhoneService.name);

  constructor(
    @Inject(PhoneRepository)
    private readonly phoneRepository: PhoneRepository,
  ) {}

  async create(createPhoneDto: CreatePhoneDto): Promise<Phone> {
    this.logger.debug('PhoneService.create: Called');
    return this.phoneRepository.create(createPhoneDto);
  }

  async findAll(filters?: PhoneFilters): Promise<Phone[]> {
    this.logger.debug('PhoneService.findAll: Called');
    return this.phoneRepository.findAll(filters);
  }

  async findOne(id: string): Promise<Phone | null> {
    this.logger.debug('PhoneService.findOne: Called');
    return this.phoneRepository.findOne(id);
  }

  async update(id: string, updatePhoneDto: UpdatePhoneDto): Promise<Phone> {
    this.logger.debug('PhoneService.update: Called');
    const phone = await this.phoneRepository.findOne(id);
    if (!phone) {
      throw new NotFoundException(`Phone with id ${id} not found`);
    }
    return this.phoneRepository.update(id, updatePhoneDto);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('PhoneService.remove: Called');
    const phone = await this.phoneRepository.findOne(id);
    if (!phone) {
      throw new NotFoundException(`Phone with id ${id} not found`);
    }
    await this.phoneRepository.delete(id);
  }

  async findByPerson(personId: string): Promise<Phone[]> {
    this.logger.debug('PhoneService.findByPerson: Called');
    return this.phoneRepository.findByPerson(personId);
  }

  async setPrimary(id: string, personId: string): Promise<Phone> {
    this.logger.debug('PhoneService.setPrimary: Called');
    const phone = await this.phoneRepository.findOne(id);
    if (!phone) {
      throw new NotFoundException(`Phone with id ${id} not found`);
    }

    // First, unset all other phones for this person as primary
    const allPhones = await this.phoneRepository.findByPerson(personId);
    for (const p of allPhones) {
      if (p.id !== id && p.isPrimary) {
        await this.phoneRepository.update(p.id, { isPrimary: false });
      }
    }

    // Set this phone as primary
    return this.phoneRepository.update(id, { isPrimary: true });
  }
}
