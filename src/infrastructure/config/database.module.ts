import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigProperties } from './config.module';

import { User } from '../../domain/users/user.model';
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
import { Company } from 'src/domain/companies/models/company.model';
import { Person } from 'src/domain/persons/models/person.model';

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
