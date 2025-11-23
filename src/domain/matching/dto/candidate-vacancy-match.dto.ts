import { IsUUID, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CalculateMatchDto {
  @IsUUID()
  personId: string;

  @IsUUID()
  vacancyId: string;
}

export class FindMatchesDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}
