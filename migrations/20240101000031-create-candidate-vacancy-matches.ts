import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    await query.createTable('candidate_vacancy_matches', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      person_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'persons',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      match_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      score_breakdown: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      matched_competences_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      required_competences_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_competences_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      calculated_at: {
        type: Sequelize.DATE,
        allowNull: false,
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

    // Add indexes for performance
    await query.addIndex('candidate_vacancy_matches', ['person_id']);
    await query.addIndex('candidate_vacancy_matches', ['vacancy_id']);
    await query.addIndex('candidate_vacancy_matches', ['person_id', 'vacancy_id'], {
      unique: true,
    });
    await query.addIndex('candidate_vacancy_matches', ['match_score']);
    await query.addIndex('candidate_vacancy_matches', ['calculated_at']);

    // Composite indexes for common queries
    await query.addIndex('candidate_vacancy_matches', ['vacancy_id', 'match_score']);
    await query.addIndex('candidate_vacancy_matches', ['person_id', 'match_score']);
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('candidate_vacancy_matches');
  },
};
