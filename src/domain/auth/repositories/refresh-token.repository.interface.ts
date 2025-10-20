import { RefreshToken } from '../models/refresh-token.model';

export abstract class RefreshTokenRepository {
  abstract create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken>;
  abstract findByToken(token: string): Promise<RefreshToken | null>;
  abstract findByUserId(userId: string): Promise<RefreshToken[]>;
  abstract delete(id: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
  abstract deleteExpired(): Promise<void>;
  abstract isTokenValid(token: string): Promise<boolean>;
}
