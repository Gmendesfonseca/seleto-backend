import { QueryInterface } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface, Sequelize: any) {
    await queryInterface.addColumn('vacancy_templates', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('vacancy_templates', 'is_default', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down() {
    console.log('Cannot remove enum value. Manual intervention required if rollback needed.');
  },
};
