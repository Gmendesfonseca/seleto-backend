import { DateTime } from 'luxon';

export interface Competence {
  id: string;
  name: string;
  description: string | null;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface CompetenceFilters {
  name?: string;
}
