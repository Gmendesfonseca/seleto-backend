import { QueryInterface } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface, Sequelize: any): Promise<void> => {
    await queryInterface.createTable('vacancies', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('open', 'closed', 'draft'),
        allowNull: false,
        defaultValue: 'draft',
      },
      area: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'companies',
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
    await queryInterface.addIndex('vacancies', ['company_id']);
    await queryInterface.addIndex('vacancies', ['status']);
    await queryInterface.addIndex('vacancies', ['area']);
    await queryInterface.addIndex('vacancies', ['title']);
    await queryInterface.addIndex('vacancies', ['deleted_at']);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('vacancies');
  },
};
