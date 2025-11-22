import { QueryInterface } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    // Check if 'published' value already exists, if not add it
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'published' 
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_applications_status'
          )
        ) THEN
          ALTER TYPE enum_applications_status ADD VALUE 'interview';
          ALTER TYPE enum_applications_status ADD VALUE 'withdrawn';
        END IF;
      END$$;
    `);
  },

  async down() {
    // Cannot remove enum values in PostgreSQL
    // Would need to recreate the enum and all dependent columns
    console.log('Cannot remove enum value. Manual intervention required if rollback needed.');
  },
};
