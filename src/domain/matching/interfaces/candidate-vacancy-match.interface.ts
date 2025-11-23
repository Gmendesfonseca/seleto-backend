export interface CandidateVacancyMatch {
  id: string;
  personId: string;
  vacancyId: string;
  matchScore: number;
  scoreBreakdown: {
    competence_match: number;
    experience_match: number;
    education_match: number;
    location_match: number;
    salary_match: number;
  };
  matchedCompetencesCount: number;
  requiredCompetencesCount: number;
  totalCompetencesCount: number;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateVacancyMatchFilters {
  personId?: string;
  vacancyId?: string;
  minScore?: number;
  limit?: number;
  offset?: number;
}
