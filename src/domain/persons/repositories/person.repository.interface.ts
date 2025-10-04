import { Person, PersonFilters } from '../interfaces/person.interface';
import { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto';

export abstract class PersonRepository {
  abstract create(createPersonDto: CreatePersonDto): Promise<Person>;
  abstract findAll(filters?: PersonFilters): Promise<Person[]>;
  abstract findOne(id: string): Promise<Person | null>;
  abstract update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person>;
  abstract delete(id: string): Promise<void>;
  abstract findByUser(userId: string): Promise<Person | null>;
  abstract findByEmail(email: string): Promise<Person | null>;
  abstract countByFilters(filters?: PersonFilters): Promise<number>;
}
