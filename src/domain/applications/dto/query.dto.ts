import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../interfaces/application.interface';

export class ApplicationQueryDto {
  @IsOptional()
  @IsString()
  applicantId?: string;

  @IsOptional()
  @IsString()
  vacancyId?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
