import { getAttributes } from 'sequelize-typescript';
import { Vacancy } from './vacancy.model';

describe('Vacancy model timestamps', () => {
  it.each(['created_at', 'updated_at'])(
    'evaluates the %s default per insert instead of once at class load',
    (column) => {
      const attributes = getAttributes(Vacancy.prototype);

      expect(typeof attributes[column].defaultValue).toBe('function');
    },
  );
});
