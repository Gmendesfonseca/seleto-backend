import {
  CandidateVacancyMatch,
  CandidateVacancyMatchFilters,
} from './candidate-vacancy-match.interface';

export abstract class CandidateVacancyMatchRepository {
  abstract create(data: Partial<CandidateVacancyMatch>): Promise<CandidateVacancyMatch>;
  abstract findAll(filters?: CandidateVacancyMatchFilters): Promise<CandidateVacancyMatch[]>;
  abstract findOne(id: string): Promise<CandidateVacancyMatch | null>;
  abstract findByPersonAndVacancy(
    personId: string,
    vacancyId: string,
  ): Promise<CandidateVacancyMatch | null>;
  abstract update(id: string, data: Partial<CandidateVacancyMatch>): Promise<CandidateVacancyMatch>;
  abstract delete(id: string): Promise<void>;
  abstract upsert(data: Partial<CandidateVacancyMatch>): Promise<CandidateVacancyMatch>;
}
