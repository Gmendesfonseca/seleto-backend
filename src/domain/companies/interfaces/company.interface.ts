import { DateTime } from 'luxon';
export interface Company {
  id: string;
  cnpj: string;
  user_id: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}
