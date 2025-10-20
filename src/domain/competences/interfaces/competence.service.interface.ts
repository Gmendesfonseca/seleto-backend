import { Competence, CompetenceCategory, CompetenceFilters } from './competence.interface';
import { CreateCompetenceDto, UpdateCompetenceDto } from '../dto/competence.dto';

export abstract class CompetenceServiceInterface {
  abstract create(createCompetenceDto: CreateCompetenceDto): Promise<Competence>;
  abstract findAll(filters?: CompetenceFilters): Promise<Competence[]>;
  abstract findOne(id: string): Promise<Competence | null>;
  abstract update(id: string, updateCompetenceDto: UpdateCompetenceDto): Promise<Competence>;
  abstract remove(id: string): Promise<void>;
  abstract findByCategory(category: CompetenceCategory): Promise<Competence[]>;
  abstract searchByName(name: string): Promise<Competence[]>;
}
