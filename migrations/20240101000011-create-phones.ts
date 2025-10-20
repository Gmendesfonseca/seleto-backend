import { QueryInterface } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface, Sequelize: any): Promise<void> => {
    await queryInterface.createTable('phones', {
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
      number: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('mobile', 'home', 'work'),
        allowNull: false,
        defaultValue: 'mobile',
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
    await queryInterface.addIndex('phones', ['person_id']);
    await queryInterface.addIndex('phones', ['number']);
    await queryInterface.addIndex('phones', ['is_primary']);
    await queryInterface.addIndex('phones', ['deleted_at']);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('phones');
  },
};
