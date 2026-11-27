import { Competence, CompetenceFilters } from '../interfaces/competence.interface';
import { CreateCompetenceDto, UpdateCompetenceDto } from '../dto/competence.dto';

export abstract class CompetenceRepository {
  abstract create(createCompetenceDto: CreateCompetenceDto): Promise<Competence>;
  abstract findAll(filters?: CompetenceFilters): Promise<Competence[]>;
  abstract findOne(id: string): Promise<Competence | null>;
  abstract findByName(name: string): Promise<Competence | null>;
  abstract update(id: string, updateCompetenceDto: UpdateCompetenceDto): Promise<Competence>;
  abstract delete(id: string): Promise<void>;
  abstract searchByName(name: string): Promise<Competence[]>;
  abstract countByFilters(filters?: CompetenceFilters): Promise<number>;
}
