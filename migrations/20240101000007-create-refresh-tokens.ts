import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    await query.createTable('refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
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
      token: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true,
      },
      expires_at: {
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

    // Add indexes
    await query.addIndex('refresh_tokens', ['token']);
    await query.addIndex('refresh_tokens', ['user_id']);
    await query.addIndex('refresh_tokens', ['expires_at']);
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('refresh_tokens');
  },
};
