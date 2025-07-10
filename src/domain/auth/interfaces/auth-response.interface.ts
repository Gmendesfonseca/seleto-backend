export interface SignInResponse {
  token: string;
  expiration: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiration: number;
}
