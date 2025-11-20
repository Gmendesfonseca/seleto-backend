import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    await query.createTable('vacancy_competence_requirements', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      vacancy_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'vacancies',
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
        onDelete: 'RESTRICT',
      },
      priority: {
        type: Sequelize.ENUM('required', 'preferred', 'nice_to_have'),
        allowNull: false,
        defaultValue: 'preferred',
      },
      minimum_years_experience: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      weight: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await query.addIndex('vacancy_competence_requirements', ['vacancy_id']);
    await query.addIndex('vacancy_competence_requirements', ['competence_id']);
    await query.addIndex('vacancy_competence_requirements', ['vacancy_id', 'competence_id'], {
      unique: true,
    });
    await query.addIndex('vacancy_competence_requirements', ['priority']);
    await query.addIndex('vacancy_competence_requirements', ['weight']);
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('vacancy_competence_requirements');
  },
};
