export type SecretType = 'EMAIL' | 'PASSWORD';

export interface SecretInterface {
  id: string;
  secret: string;
  type: SecretType;
  userId: string;
  createdAt: Date;
  deletedAt: Date;
}
