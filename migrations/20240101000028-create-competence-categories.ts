import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    await query.createTable('competence_categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.ENUM(
          'technical_skill',
          'soft_skill',
          'language',
          'certification',
          'tool',
          'framework',
          'methodology',
          'domain_knowledge',
        ),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await query.addIndex('competence_categories', ['name']);
    await query.addIndex('competence_categories', ['type']);
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('competence_categories');
  },
};
