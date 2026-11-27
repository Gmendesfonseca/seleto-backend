import { QueryInterface } from 'sequelize';

const UNIQUE_GLOBAL_NAME = 'competences_global_name_unique';

export = {
  up: async (query: QueryInterface): Promise<void> => {
    await query.sequelize.query('ALTER TABLE competences ALTER COLUMN company_id DROP NOT NULL');
    await query.sequelize.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS ${UNIQUE_GLOBAL_NAME} ON competences (lower(name)) ` +
        'WHERE company_id IS NULL AND deleted_at IS NULL',
    );
  },

  // Fails while global competences exist: they have no company to fall back to.
  down: async (query: QueryInterface): Promise<void> => {
    await query.sequelize.query(`DROP INDEX IF EXISTS ${UNIQUE_GLOBAL_NAME}`);
    await query.sequelize.query('ALTER TABLE competences ALTER COLUMN company_id SET NOT NULL');
  },
};
