export interface Competence {
  id: string;
  name: string;
  category: CompetenceCategory;
  description?: string;
  level?: CompetenceLevel;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export const CompetenceCategory = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  RESULT: 'result',
  CULTURAL_FIT: 'cultural-fit',
} as const;
export type CompetenceCategory = (typeof CompetenceCategory)[keyof typeof CompetenceCategory];

export const CompetenceLevel = {
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const;
export type CompetenceLevel = (typeof CompetenceLevel)[keyof typeof CompetenceLevel];

export interface CompetenceFilters {
  name?: string;
  category?: CompetenceCategory;
  level?: CompetenceLevel;
}
