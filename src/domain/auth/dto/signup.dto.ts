import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsEnum(['PERSON', 'COMPANY'])
  type: 'PERSON' | 'COMPANY';

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
