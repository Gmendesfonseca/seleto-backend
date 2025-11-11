import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    await query.createTable('person_formations', {
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
      institution_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      degree: {
        type: Sequelize.ENUM(
          'HIGH_SCHOOL',
          'TECHNICAL',
          'ASSOCIATE',
          'BACHELOR',
          'MASTER',
          'DOCTORATE',
          'POSTGRADUATE',
          'MBA',
          'CERTIFICATE',
          'OTHER',
        ),
        allowNull: false,
      },
      field_of_study: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_current: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      grade: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
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
    await query.addIndex('person_formations', ['person_id']);
    await query.addIndex('person_formations', ['degree']);
    await query.addIndex('person_formations', ['is_current']);
    await query.addIndex('person_formations', ['start_date']);
    await query.addIndex('person_formations', ['end_date']);
    await query.addIndex('person_formations', ['deleted_at']);
  },

  down: async (query: QueryInterface): Promise<void> => {
    await query.dropTable('person_formations');
  },
};
