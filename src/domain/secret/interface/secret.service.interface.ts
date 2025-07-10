import { SecretType } from './secret.interface';

export interface ValidateSecretInput {
  secret: string;
  type: SecretType;
}

export interface CreateSecretInput {
  secret: string;
  type: SecretType;
  userId: string;
}

export abstract class SecretServiceInterface {
  abstract generateSecret(): string;
  abstract validateSecret(input: ValidateSecretInput): Promise<boolean>;
  abstract createSecret(input: CreateSecretInput): Promise<void>;
  abstract deleteSecret(secret: string): Promise<void>;
  abstract getUserIdBySecret(secret: string, type: SecretType): Promise<string | null>;
}
