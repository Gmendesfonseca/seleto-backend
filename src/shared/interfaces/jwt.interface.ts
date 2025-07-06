export interface Jwt {
  sub: string;
  exp: number;
  user: {
    id: string;
    email: string;
    config: {
      default_language: string;
      default_interface: string;
    };
  };
}
