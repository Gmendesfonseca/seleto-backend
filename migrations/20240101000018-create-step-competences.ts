import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    await query.createTable('step_competences', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      step_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'steps',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      competence_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'competences',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    // Add indexes and unique constraint
    await query.addIndex('step_competences', ['step_id']);
    await query.addIndex('step_competences', ['competence_id']);
    await query.addIndex('step_competences', ['step_id', 'competence_id'], {
      unique: true,
      name: 'unique_step_competence',
    });
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('step_competences');
  },
};
