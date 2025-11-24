import { QueryInterface } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface, Sequelize: any) {
    await queryInterface.addColumn('steps', 'type', {
      type: Sequelize.ENUM(
        'application',
        'screening',
        'interview',
        'technical_test',
        'background_check',
        'offer',
        'onboarding',
        'custom',
      ),
      allowNull: false,
      defaultValue: 'application',
    });

    await queryInterface.addColumn('steps', 'estimated_duration', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'PT1H', // Default to 1 hour in ISO 8601 duration format
    });

    await queryInterface.addColumn('steps', 'template_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'vacancy_templates',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down() {
    console.log('Cannot remove enum value. Manual intervention required if rollback needed.');
  },
};
