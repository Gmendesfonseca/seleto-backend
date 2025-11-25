export interface Jwt {
  sub: string;
  exp: number;
  config: {
    auth2f: boolean;
    default_interface: 'LIGHT' | 'DARK';
    default_language: string;
    default_timezone: string;
    master: boolean;
  };
  profileId: string;
  id: string;
  type: 'COMPANY' | 'PERSON';
  username: string;
  companyId: string | null;
  profile:
    | {
        id: string;
        cnpj: string;
      }
    | {
        id: string;
        cpf: string;
      };
}
