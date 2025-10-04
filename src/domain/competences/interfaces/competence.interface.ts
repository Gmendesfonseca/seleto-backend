export interface Competence {
  id: string;
  name: string;
  category: CompetenceCategory;
  description?: string;
  level?: CompetenceLevel;
  createdAt: Date;
  updatedAt: Date;
}

export enum CompetenceCategory {
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  LANGUAGE = 'language',
  CERTIFICATION = 'certification',
  OTHER = 'other',
}

export enum CompetenceLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export interface CompetenceFilters {
  name?: string;
  category?: CompetenceCategory;
  level?: CompetenceLevel;
}
