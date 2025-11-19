import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

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

  @IsString()
  cnpj?: string;

  @IsString()
  cpf?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
