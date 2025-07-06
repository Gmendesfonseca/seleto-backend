export type SecretType = 'EMAIL' | 'PASSWORD';

export interface SecretInterface {
  id: string;
  secret: string;
  type: SecretType;
  userId: string;
  createdAt: number;
  deletedAt: number;
}
