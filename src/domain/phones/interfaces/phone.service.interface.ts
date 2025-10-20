import { Phone, PhoneFilters } from './phone.interface';
import { CreatePhoneDto, UpdatePhoneDto } from '../dto/phone.dto';

export abstract class PhoneService {
  abstract create(createPhoneDto: CreatePhoneDto): Promise<Phone>;
  abstract findAll(filters?: PhoneFilters): Promise<Phone[]>;
  abstract findOne(id: string): Promise<Phone | null>;
  abstract update(id: string, updatePhoneDto: UpdatePhoneDto): Promise<Phone>;
  abstract remove(id: string): Promise<void>;
  abstract findByPerson(personId: string): Promise<Phone[]>;
  abstract setPrimary(id: string, personId: string): Promise<Phone>;
}
