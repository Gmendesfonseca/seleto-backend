import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    await query.createTable('person_competences', {
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
      proficiency_level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
        allowNull: false,
        defaultValue: 'intermediate',
      },
      years_of_experience: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      source_experience_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'person_experiences',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      source_formation_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'person_formations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await query.addIndex('person_competences', ['person_id']);
    await query.addIndex('person_competences', ['competence_id']);
    await query.addIndex('person_competences', ['person_id', 'competence_id'], { unique: true });
    await query.addIndex('person_competences', ['proficiency_level']);
    await query.addIndex('person_competences', ['source_experience_id']);
    await query.addIndex('person_competences', ['source_formation_id']);
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('person_competences');
  },
};
