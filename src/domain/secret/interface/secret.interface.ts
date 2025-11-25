import { DateTime } from 'luxon';

export type SecretType = 'EMAIL' | 'PASSWORD';

export interface SecretInterface {
  id: string;
  secret: string;
  type: SecretType;
  userId: string;
  createdAt: DateTime;
  deletedAt: DateTime | null;
}
