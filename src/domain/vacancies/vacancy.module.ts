import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vacancy } from './vacancy.model';
import { VacancyController } from './vacancy.controller';
import { VacancyService } from './vacancy.service';
import { VacancySequelizeRepository } from './repositories/vacancy.sequelize.repository';
import { VacancyRepository } from './repositories/vacancy.repository.interface';
import { VacancyServiceInterface } from './interfaces/vacancy.service.interface';
import { CompanyContextMiddleware } from '../../shared/middlewares/company-context.middleware';
import { VacancyBenefitRepository } from './repositories/vacancy-benefit.repository.interface';
import { VacancyBenefitSequelizeRepository } from './repositories/vacancy-benefit.sequelize.repository';
import { VacancyRequirementRepository } from './repositories/vacancy-requirement.repository.interface';
import { VacancyRequirementSequelizeRepository } from './repositories/vacancy-requirement.sequelize.repository';
import { VacancyResponsibilityRepository } from './repositories/vacancy-responsibility.repository.interface';
import { VacancyResponsibilitySequelizeRepository } from './repositories/vacancy-responsibility.sequelize.repository';
import { VacancyResponsibility } from './vacancy-responsibility.model';
import { VacancyRequirement } from './vacancy-requirement.model';
import { VacancyBenefit } from './vacancy-benefit.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Vacancy,
      VacancyBenefit,
      VacancyRequirement,
      VacancyResponsibility,
    ]),
  ],
  controllers: [VacancyController],
  providers: [
    {
      provide: VacancyRepository,
      useClass: VacancySequelizeRepository,
    },
    {
      provide: VacancyServiceInterface,
      useClass: VacancyService,
    },
    {
      provide: VacancyBenefitRepository,
      useClass: VacancyBenefitSequelizeRepository,
    },
    {
      provide: VacancyRequirementRepository,
      useClass: VacancyRequirementSequelizeRepository,
    },
    {
      provide: VacancyResponsibilityRepository,
      useClass: VacancyResponsibilitySequelizeRepository,
    },
  ],
  exports: [
    {
      provide: VacancyServiceInterface,
      useClass: VacancyService,
    },
  ],
})
export class VacancyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CompanyContextMiddleware).forRoutes(VacancyController);
  }
}
