import { QueryInterface } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface, Sequelize: any): Promise<void> => {
    await queryInterface.createTable('vacancy_steps', {
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
      order: {
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

    // Add indexes and unique constraint
    await queryInterface.addIndex('vacancy_steps', ['vacancy_id']);
    await queryInterface.addIndex('vacancy_steps', ['step_id']);
    await queryInterface.addIndex('vacancy_steps', ['vacancy_id', 'step_id'], {
      unique: true,
      name: 'unique_vacancy_step',
    });
    await queryInterface.addIndex('vacancy_steps', ['vacancy_id', 'order']);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('vacancy_steps');
  },
};
