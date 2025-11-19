import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    await query.createTable('password_reset_tokens', {
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
      used: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await query.addIndex('password_reset_tokens', ['token']);
    await query.addIndex('password_reset_tokens', ['user_id']);
    await query.addIndex('password_reset_tokens', ['expires_at']);
    await query.addIndex('password_reset_tokens', ['used']);
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('password_reset_tokens');
  },
};
