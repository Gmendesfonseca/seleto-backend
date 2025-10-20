import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    await query.createTable('applications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      applicant_id: {
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
      resume: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'File path or URL to the resume',
      },
      cover_letter: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'reviewing', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await query.addIndex('applications', ['applicant_id']);
    await query.addIndex('applications', ['vacancy_id']);
    await query.addIndex('applications', ['status']);
    await query.addIndex('applications', ['created_at']);
    await query.addIndex('applications', ['deleted_at']);
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('applications');
  },
};
