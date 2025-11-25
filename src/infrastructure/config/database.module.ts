import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigProperties } from './config.module';

// Import all models
import { User } from '../../domain/users/user.model';
import { Company } from '../../domain/companies/company.model';
import { Person } from '../../domain/persons/person.model';
import { Role } from '../../domain/roles/role.model';
import { Permission } from '../../domain/permissions/permission.model';
import { Secret } from '../../domain/secret/secret.model';
import { Application } from '../../domain/applications/application.model';
import { Step } from '../../domain/steps/step.model';
import { Competence } from '../../domain/competences/competence.model';
import { Vacancy } from '../../domain/vacancies/vacancy.model';
import { VacancyTemplate } from '../../domain/templates/vacancy-template.model';
import { Address } from '../../domain/addresses/address.model';
import { Phone } from '../../domain/phones/phone.model';
import { RefreshToken } from '../../domain/auth/models/refresh-token.model';
import { PasswordResetToken } from '../../domain/auth/models/password-reset-token.model';
import { UserRole } from '../../domain/users/user-role.model';
import { UserPermission } from '../../domain/users/user-permission.model';
import { RolePermission } from '../../domain/roles/role-permission.model';
import { PersonExperience } from '../../domain/persons/person-experience.model';
import { PersonFormation } from '../../domain/persons/person-formation.model';
import { VacancyStep } from '../../domain/vacancies/vacancy-step.model';
import { VacancyResponsible } from '../../domain/vacancies/vacancy-responsible.model';
import { StepCompetence } from '../../domain/steps/step-competence.model';
import { VacancyBenefit } from 'src/domain/vacancies/vacancy-benefit.model';
import { VacancyRequirement } from 'src/domain/vacancies/vacancy-requirement.model';
import { VacancyResponsibility } from 'src/domain/vacancies/vacancy-responsibility.model';
import { CandidateVacancyMatch } from 'src/domain/matching/candidate-vacancy-match.model';
import { PersonCompetence } from 'src/domain/persons/person-competence.model';
import { VacancyCompetenceRequirement } from 'src/domain/competences/vacancy-competence-requirement.model';

const models = [
  User,
  Company,
  Person,
  Role,
  Permission,
  Secret,
  Application,
  Step,
  Competence,
  Vacancy,
  VacancyTemplate,
  Address,
  Phone,
  RefreshToken,
  PasswordResetToken,
  UserRole,
  UserPermission,
  RolePermission,
  PersonExperience,
  PersonFormation,
  PersonCompetence,
  VacancyStep,
  VacancyResponsible,
  StepCompetence,
  VacancyBenefit,
  VacancyRequirement,
  VacancyResponsibility,
  CandidateVacancyMatch,
  VacancyCompetenceRequirement,
];

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ConfigProperties>) => {
        const isLoggingEnabled = configService.get('DB_LOGGING');
        return {
          models,
          logging: isLoggingEnabled ? console.log : false,
          autoLoadModels: false,
          dialect: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          database: configService.get('DB_DATABASE'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
