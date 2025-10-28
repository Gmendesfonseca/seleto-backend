import { QueryInterface } from 'sequelize';

export = {
  up: async (query: QueryInterface, Sequelize: any): Promise<void> => {
    // Add status column to users table
    await query.addColumn('users', 'status', {
      type: Sequelize.ENUM('ACTIVE', 'BLOCKED'),
      allowNull: false,
      defaultValue: 'BLOCKED',
    });

    // Add type column to users table
    await query.addColumn('users', 'type', {
      type: Sequelize.ENUM('PERSON', 'COMPANY'),
      allowNull: false,
      defaultValue: 'PERSON',
    });

    // Add is_verified column to users table
    await query.addColumn('users', 'is_verified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    // Add indexes for the new columns
    await query.addIndex('users', ['status']);
    await query.addIndex('users', ['type']);
    await query.addIndex('users', ['is_verified']);
  },

  down: async (query: QueryInterface): Promise<void> => {
    // Remove indexes
    await query.removeIndex('users', ['status']);
    await query.removeIndex('users', ['type']);
    await query.removeIndex('users', ['is_verified']);

    // Remove columns
    await query.removeColumn('users', 'status');
    await query.removeColumn('users', 'type');
    await query.removeColumn('users', 'is_verified');
  },
};
