export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
    type: string;
    status: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiration: number;
}
