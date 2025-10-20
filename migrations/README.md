# Sequelize Migrations

This directory contains Sequelize migration files for the TG recruitment and selection system database.

## Quick Start

1. Install dependencies:
```bash
npm install --save sequelize pg pg-hstore
npm install --save-dev sequelize-cli
```

2. Configure database connection in `config/config.json`

3. Run migrations:
```bash
npx sequelize-cli db:migrate
```

## Migration Files

All migration files are prefixed with timestamps to ensure correct execution order:

1. **20240101000001-create-companies.js** - Creates companies table
2. **20240101000002-create-permissions.js** - Creates permissions table
3. **20240101000003-create-roles.js** - Creates roles table
4. **20240101000004-create-persons.js** - Creates persons table
5. **20240101000005-create-users.js** - Creates users table
6. **20240101000006-create-refresh-tokens.js** - Creates refresh_tokens table
7. **20240101000007-create-password-reset-tokens.js** - Creates password_reset_tokens table
8. **20240101000008-create-user-roles.js** - Creates user_roles junction table
9. **20240101000009-create-user-permissions.js** - Creates user_permissions junction table
10. **20240101000010-create-role-permissions.js** - Creates role_permissions junction table
11. **20240101000011-create-phones.js** - Creates phones table
12. **20240101000012-create-addresses.js** - Creates addresses table
13. **20240101000013-create-vacancies.js** - Creates vacancies table
14. **20240101000014-create-steps.js** - Creates steps table
15. **20240101000015-create-competences.js** - Creates competences table
16. **20240101000016-create-vacancy-steps.js** - Creates vacancy_steps junction table
17. **20240101000017-create-vacancy-responsibles.js** - Creates vacancy_responsibles junction table
18. **20240101000018-create-step-competences.js** - Creates step_competences junction table
19. **20240101000019-create-applications.js** - Creates applications table
20. **20240101000020-create-vacancy-templates.js** - Creates vacancy_templates table

## Features

### All migrations include:

- **UUID primary keys** - Using Sequelize.UUIDV4
- **Timestamps** - created_at, updated_at (automatic)
- **Soft deletes** - deleted_at column (where applicable)
- **Foreign key constraints** - CASCADE on update/delete
- **Indexes** - On foreign keys and frequently queried columns
- **Comments** - JSDoc for clarity

### Database Support

These migrations are compatible with:
- PostgreSQL (recommended)
- MySQL/MariaDB
- SQLite (with minor modifications for UUID and ENUM types)

## Common Commands

### Run migrations
```bash
npx sequelize-cli db:migrate
```

### Check migration status
```bash
npx sequelize-cli db:migrate:status
```

### Rollback last migration
```bash
npx sequelize-cli db:migrate:undo
```

### Rollback all migrations
```bash
npx sequelize-cli db:migrate:undo:all
```

### Rollback to specific migration
```bash
npx sequelize-cli db:migrate:undo:all --to 20240101000010-create-role-permissions.js
```

## Documentation

For detailed information, see:
- [MODEL_ANALYSIS.md](../docs/MODEL_ANALYSIS.md) - Complete model documentation
- [SEQUELIZE_MIGRATION_GUIDE.md](../docs/SEQUELIZE_MIGRATION_GUIDE.md) - Step-by-step migration guide
- [DATABASE_ERD.md](../docs/DATABASE_ERD.md) - Entity relationship diagram

## Notes

- **Do not modify** migration files after they've been run in production
- **Always backup** your database before running migrations in production
- **Test migrations** in development environment first
- Migrations are executed in filename order (timestamp prefix ensures correct order)
- All foreign keys use CASCADE for updates and appropriate cascade/set null for deletes

## Schema Version

**Current Version**: 1.0.0
**Total Tables**: 20
**Last Updated**: 2024-01-01
