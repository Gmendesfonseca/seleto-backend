import { CandidateVacancyMatch } from './candidate-vacancy-match.interface';

export abstract class MatchingServiceInterface {
  abstract calculateMatch(personId: string, vacancyId: string): Promise<CandidateVacancyMatch>;
  abstract recalculateMatch(matchId: string): Promise<CandidateVacancyMatch>;
  abstract findMatchesForVacancy(
    vacancyId: string,
    minScore?: number,
    limit?: number,
  ): Promise<CandidateVacancyMatch[]>;
  abstract findMatchesForPerson(
    personId: string,
    minScore?: number,
    limit?: number,
  ): Promise<CandidateVacancyMatch[]>;
  abstract getBestMatchForVacancy(vacancyId: string): Promise<CandidateVacancyMatch | null>;
}
