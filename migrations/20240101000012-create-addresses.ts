import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    await query.createTable('addresses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      street: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      number: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      complement: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      postal_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await query.addIndex('addresses', ['user_id']);
    await query.addIndex('addresses', ['city']);
    await query.addIndex('addresses', ['state']);
    await query.addIndex('addresses', ['postal_code']);
    await query.addIndex('addresses', ['is_primary']);
    await query.addIndex('addresses', ['deleted_at']);
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('addresses');
  },
};
