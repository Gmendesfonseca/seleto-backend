import { IsString, IsNotEmpty } from 'class-validator';

export class CheckSecretKeyDto {
  @IsString()
  @IsNotEmpty()
  secretKey: string;
}
