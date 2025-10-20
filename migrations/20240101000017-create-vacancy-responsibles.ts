import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    await query.createTable('vacancy_responsibles', {
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
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
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
    await query.addIndex('vacancy_responsibles', ['vacancy_id']);
    await query.addIndex('vacancy_responsibles', ['user_id']);
    await query.addIndex('vacancy_responsibles', ['vacancy_id', 'user_id'], {
      unique: true,
      name: 'unique_vacancy_responsible',
    });
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('vacancy_responsibles');
  },
};
