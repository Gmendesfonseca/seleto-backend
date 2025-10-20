import { IsEmail, IsString, IsUUID, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class UpdateUsernameDto {
  @IsString()
  readonly username: string;
}

export class UpdateEmailDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly secret: string;
}

export class UpdatePasswordDto {
  @IsString()
  readonly password: string;

  @IsString()
  readonly secret: string;
}

export class ActivateUserDto {
  @IsString()
  readonly secret: string;

  @IsUUID()
  readonly id: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly username?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'BLOCKED', 'INACTIVE'])
  readonly status?: string;

  @IsOptional()
  @IsBoolean()
  readonly isVerified?: boolean;
}
