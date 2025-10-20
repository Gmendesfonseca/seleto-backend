import { QueryInterface } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface, Sequelize: any): Promise<void> => {
    await queryInterface.createTable('addresses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      person_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'persons',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.addIndex('addresses', ['person_id']);
    await queryInterface.addIndex('addresses', ['company_id']);
    await queryInterface.addIndex('addresses', ['city']);
    await queryInterface.addIndex('addresses', ['state']);
    await queryInterface.addIndex('addresses', ['postal_code']);
    await queryInterface.addIndex('addresses', ['is_primary']);
    await queryInterface.addIndex('addresses', ['deleted_at']);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('addresses');
  },
};
