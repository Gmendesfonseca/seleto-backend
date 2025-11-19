import { Phone } from 'src/domain/phones';
import {
  Address,
  PersonCompetence,
  WorkExperience,
  Education,
} from '../interfaces/person.interface';

export class CreatePersonDto {
  cpf: string;
  userId: string;
  bio?: string;
  dateOfBirth?: Date;
  linkedinProfile?: string;
  githubProfile?: string;
  portfolioUrl?: string;
}

export class UpdatePersonDto {
  cnpj?: string;
  bio?: string;
  dateOfBirth?: Date;
  linkedinProfile?: string;
  githubProfile?: string;
  portfolioUrl?: string;
}

export class PersonQueryDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  competences?: string[];
  location?: string;
}

export class PersonResponseDto {
  id: string;
  userId: string;
  cpf: string;
  cnpj?: string;
  dateOfBirth?: Date;
  bio?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  portfolioUrl?: string;
  phone?: Phone;
  address?: Address;
  competences?: PersonCompetence[];
  experiences?: WorkExperience[];
  education?: Education[];
  createdAt: Date;
  updatedAt: Date;
}

export class AddCompetenceDto {
  competenceId: string;
  level: string;
  experience?: number;
}

export class AddWorkExperienceDto {
  company: string;
  position: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
}

export class AddEducationDto {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  gpa?: number;
}
