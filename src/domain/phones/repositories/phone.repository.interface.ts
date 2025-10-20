import { Phone, PhoneFilters } from '../interfaces/phone.interface';
import { CreatePhoneDto, UpdatePhoneDto } from '../dto/phone.dto';

export abstract class PhoneRepository {
  abstract create(createPhoneDto: CreatePhoneDto): Promise<Phone>;
  abstract findAll(filters?: PhoneFilters): Promise<Phone[]>;
  abstract findOne(id: string): Promise<Phone | null>;
  abstract update(id: string, updatePhoneDto: UpdatePhoneDto): Promise<Phone>;
  abstract delete(id: string): Promise<void>;
  abstract findByPerson(personId: string): Promise<Phone[]>;
  abstract findPrimaryByPerson(personId: string): Promise<Phone | null>;
}
