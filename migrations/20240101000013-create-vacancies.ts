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
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      salary_min: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      salary_max: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: true,
        defaultValue: 'BRL',
      },
      type: {
        type: Sequelize.ENUM(
          'contract',
          'full_time',
          'part_time',
          'temporary',
          'internship',
          'apprenticeship',
        ),
        allowNull: false,
      },
      contract: {
        type: Sequelize.ENUM('clt', 'pj', 'freelance', 'intern', 'apprenticeship', 'temporary'),
        allowNull: false,
      },
      work_mode: {
        type: Sequelize.ENUM('onsite', 'remote', 'hybrid'),
        allowNull: false,
      },
      level: {
        type: Sequelize.ENUM('entry', 'junior', 'mid', 'senior', 'lead'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'paused', 'closed', 'expired'),
        allowNull: false,
        defaultValue: 'draft',
      },
      publication_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      expiration_date: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await query.addIndex('vacancies', ['location']);
    await query.addIndex('vacancies', ['type']);
    await query.addIndex('vacancies', ['level']);
    await query.addIndex('vacancies', ['deleted_at']);
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('vacancies');
  },
};
