import { Observable } from 'rxjs';

export interface MessageClient {
  send<TResult = unknown, TInput = unknown>(pattern: string, data: TInput): Observable<TResult>;
}
