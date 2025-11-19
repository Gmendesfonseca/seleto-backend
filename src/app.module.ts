import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import { AuthModule } from './domain/auth/auth.module';
import { UsersModule } from './domain/users/users.module';
import { SecretsModule } from './domain/secret/secret.module';
import { RoleModule } from './domain/roles/role.module';
import { ApplicationModule } from './domain/applications/application.module';
import { CompetenceModule } from './domain/competences/competence.module';
import { StepModule } from './domain/steps/step.module';
import { VacancyModule } from './domain/vacancies/vacancy.module';
import { PermissionModule } from './domain/permissions/permission.module';
import { TemplateModule } from './domain/templates/template.module';
import { CompanyModule } from './domain/companies/company.module';
import { PersonModule } from './domain/persons/person.module';
import { DashboardModule } from './domain/dashboard/dashboard.module';
import { RecruitmentModule } from './domain/recruitment/recruitment.module';
import { AddressModule } from './domain/addresses/address.module';
import { PhoneModule } from './domain/phones/phone.module';

import { I18nModule } from './infrastructure/config/i18n.module';
import { LimitModule } from './infrastructure/config/limit.module';
import { QueueModule } from './infrastructure/config/queue.module';
import { HealthModule } from './infrastructure/health/health.module';
import { DatabaseModule } from './infrastructure/config/database.module';

import { PaginationMiddleware } from './shared/middleware/pagination/pagination.middleware';
import { MailerModule } from './domain/mailers/mailer.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    DatabaseModule,
    LimitModule,
    HealthModule,
    QueueModule,
    I18nModule,
    UsersModule,
    MailerModule,
    SecretsModule,
    RoleModule,
    ApplicationModule,
    CompetenceModule,
    StepModule,
    VacancyModule,
    PermissionModule,
    TemplateModule,
    CompanyModule,
    PersonModule,
    DashboardModule,
    RecruitmentModule,
    AddressModule,
    PhoneModule,
  ],
  providers: [JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PaginationMiddleware).forRoutes({ path: '*path', method: RequestMethod.GET });
  }
}
