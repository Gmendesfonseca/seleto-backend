import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { VacancyType, ExperienceLevel, VacancyStatus } from '../interfaces/vacancy.interface';
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
  @IsOptional()
  salaryMin?: number;

  @IsNumber()
  @IsOptional()
  salaryMax?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(VacancyType)
  type: VacancyType;

  @IsEnum(ExperienceLevel)
  level: ExperienceLevel;

  @IsBoolean()
  remote: boolean;

  @IsOptional()
  @IsArray()
  benefits?: string[];

  @IsArray()
  requirements: string[];

  @IsArray()
  responsibilities: string[];

  @IsOptional()
  @IsDate()
  expirationDate?: DateTime;
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
