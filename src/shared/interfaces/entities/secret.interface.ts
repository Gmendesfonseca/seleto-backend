import { DateTime } from 'luxon';
export interface Secret {
  id: string;
  key: string;
  email: string;
  type: SecretType;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export enum SecretType {
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  USER_ACTIVATION = 'user_activation',
}
