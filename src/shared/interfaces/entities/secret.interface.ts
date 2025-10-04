export interface Secret {
  id: string;
  key: string;
  email: string;
  type: SecretType;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum SecretType {
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  USER_ACTIVATION = 'user_activation',
}
