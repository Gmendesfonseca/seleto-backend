import { IsEmail, IsString, IsUUID } from 'class-validator';

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
