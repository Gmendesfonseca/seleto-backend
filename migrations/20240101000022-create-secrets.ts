import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    await query.createTable('secrets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      secret: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('EMAIL', 'PASSWORD'),
        allowNull: true,
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await query.addIndex('secrets', ['user_id']);
    await query.addIndex('secrets', ['type']);
    await query.addIndex('secrets', ['deleted_at']);
    await query.addIndex('secrets', ['created_at']);
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('secrets');
  },
};
