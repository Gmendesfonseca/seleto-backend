import { DateTime } from 'luxon';
import { PasswordResetToken } from '../models/password-reset-token.model';

export abstract class PasswordResetTokenRepository {
  abstract findByToken(token: string): Promise<PasswordResetToken | null>;
  abstract findByUserId(userId: string): Promise<PasswordResetToken[]>;
  abstract isTokenValid(token: string): Promise<boolean>;
  abstract create(userId: string, token: string, expiresAt: DateTime): Promise<PasswordResetToken>;
  abstract markAsUsed(id: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
  abstract deleteExpired(): Promise<void>;
}
