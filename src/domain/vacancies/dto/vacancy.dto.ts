import { IsDate, IsEnum, IsNumber, IsString, IsArray, ValidateIf } from 'class-validator';
import {
  VacancyType,
  ExperienceLevel,
  VacancyStatus,
  ContractType,
  WorkModeType,
} from '../interfaces/vacancy.interface';
import { DateTime } from 'luxon';

export class CreateVacancyDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  companyId: string;

  @IsString()
  location: string;

  @IsNumber()
  @ValidateIf((value) => value !== null)
  salaryMin: number | null;

  @IsNumber()
  @ValidateIf((value) => value !== null)
  salaryMax: number | null;

  @IsString()
  @ValidateIf((value) => value !== null)
  currency: string | null;

  @IsEnum(VacancyType)
  type: VacancyType;

  @IsEnum(WorkModeType)
  workMode: WorkModeType;

  @IsEnum(ContractType)
  contract: ContractType;

  @IsEnum(ExperienceLevel)
  level: ExperienceLevel;

  @IsArray()
  @ValidateIf((value) => value !== null)
  benefits: string[] | null;

  @IsArray()
  requirements: string[];

  @IsArray()
  responsibilities: string[];

  @IsDate()
  @ValidateIf((value) => value !== null)
  publicationDate: DateTime | null;

  @IsDate()
  @ValidateIf((value) => value !== null)
  expirationDate: DateTime | null;
}

export class UpdateVacancyDto {
  title?: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type?: VacancyType;
  level?: ExperienceLevel;
  remote?: boolean;
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
  status?: VacancyStatus;
  expirationDate?: Date;
}

export class VacancyQueryDto {
  companyId?: string;
  title?: string;
  location?: string;
  type?: VacancyType;
  level?: ExperienceLevel;
  remote?: boolean;
  status?: VacancyStatus;
  salaryMin?: number;
  salaryMax?: number;
}

export class VacancyResponseDto {
  id: string;
  title: string;
  description: string;
  companyId: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type: VacancyType;
  level: ExperienceLevel;
  remote: boolean;
  benefits?: string[];
  requirements: string[];
  responsibilities: string[];
  status: VacancyStatus;
  publicationDate: Date;
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
