import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    await query.createTable('vacancies', {
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
    await query.addIndex('vacancies', ['company_id']);
    await query.addIndex('vacancies', ['status']);
    await query.addIndex('vacancies', ['area']);
    await query.addIndex('vacancies', ['title']);
    await query.addIndex('vacancies', ['deleted_at']);
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('vacancies');
  },
};
