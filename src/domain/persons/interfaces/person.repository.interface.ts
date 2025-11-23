import { Person, PersonFilters } from '../interfaces/person.interface';
import { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto';

export abstract class PersonRepository {
  abstract create(createPersonDto: CreatePersonDto): Promise<Person>;
  abstract findAll(filters?: PersonFilters): Promise<Person[]>;
  abstract findOne(data: { id?: string; user_id?: string }): Promise<Person | null>;
  abstract update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person>;
  abstract delete(id: string): Promise<void>;
  abstract countByFilters(filters?: PersonFilters): Promise<number>;
}
