import { IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  applicantId: string;

  @IsString()
  vacancyId: string;

  @IsOptional()
  @IsString()
  resume?: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;
}
