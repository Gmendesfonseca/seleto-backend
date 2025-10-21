import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';

export class QueryUserDto {
  @IsOptional()
  @IsString()
  readonly email?: string;

  @IsOptional()
  @IsString()
  readonly username?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'BLOCKED', 'INACTIVE'])
  readonly status?: string;

  @IsOptional()
  @IsEnum(['PERSON', 'COMPANY'])
  readonly type?: string;

  @IsOptional()
  @IsString()
  readonly companyId?: string;

  @IsOptional()
  @IsBoolean()
  readonly isVerified?: boolean;

  @IsOptional()
  @IsString()
  readonly page?: string;

  @IsOptional()
  @IsString()
  readonly limit?: string;
}
