export interface Person {
  id: string;
  cpf: string;
  user_id: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: Address;
  profilePicture?: string;
  bio?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  portfolioUrl?: string;
  competences?: PersonCompetence[];
  experiences?: WorkExperience[];
  education?: Education[];
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface PersonCompetence {
  competenceId: string;
  level: string;
  experience?: number; // years of experience
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  gpa?: number;
}

export interface PersonFilters {
  cpf?: string;
  competences?: string[];
  location?: string;
}
