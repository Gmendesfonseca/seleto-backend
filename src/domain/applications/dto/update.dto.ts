import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../interfaces/application.interface';

export class UpdateApplicationDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  resume?: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;
}
