import { Jwt } from './jwt.interface';

declare module 'express' {
  export interface Request {
    auth?: Jwt;
  }
}
