import { Person, PersonFilters } from '../interfaces/person.interface';
import { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto';
import { Person as Model } from '../person.model';

export abstract class PersonRepository {
  abstract create(createPersonDto: CreatePersonDto): Promise<Person>;
  abstract findAll(filters?: PersonFilters): Promise<Person[]>;
  abstract findOne(data: { id?: string; user_id?: string }): Promise<Model | null>;
  abstract update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person>;
  abstract delete(id: string): Promise<void>;
  abstract countByFilters(filters?: PersonFilters): Promise<number>;
}
