export abstract class AuthServiceInterface {
  abstract signIn(username: string, password: string): Promise<any>;
  abstract signUp(username: string, password: string): Promise<void>;
  abstract forgotPassword(email: string): Promise<void>;
  abstract checkSecretKey(secretKey: string): Promise<boolean>;
  abstract resetPassword(secretKey: string, newPassword: string): Promise<void>;
  abstract refreshToken(refreshToken: string): Promise<any>;
}
