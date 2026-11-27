import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vacancy } from './vacancy.model';
import { VacancyController } from './vacancy.controller';
import { VacancyService } from './vacancy.service';
import { VacancySequelizeRepository } from './repositories/vacancy.sequelize.repository';
import { VacancyRepository } from './interfaces/vacancy.repository.interface';
import { VacancyServiceInterface } from './interfaces/vacancy.service.interface';
import { CompanyContextMiddleware } from '../../shared/middlewares/company-context.middleware';
import { VacancyBenefitRepository } from './interfaces/vacancy-benefit.repository.interface';
import { VacancyBenefitSequelizeRepository } from './repositories/vacancy-benefit.sequelize.repository';
import { VacancyRequirementRepository } from './interfaces/vacancy-requirement.repository.interface';
import { VacancyRequirementSequelizeRepository } from './repositories/vacancy-requirement.sequelize.repository';
import { VacancyResponsibilityRepository } from './interfaces/vacancy-responsibility.repository.interface';
import { VacancyResponsibilitySequelizeRepository } from './repositories/vacancy-responsibility.sequelize.repository';
import { VacancyResponsibility } from './vacancy-responsibility.model';
import { VacancyRequirement } from './vacancy-requirement.model';
import { VacancyBenefit } from './vacancy-benefit.model';
import { VacancyStepRepository } from './interfaces/vacancy-step.repository.interface';
import { VacancyStepSequelizeRepository } from './repositories/vacancy-step.sequelize.repository';
import { VacancyStep } from './vacancy-step.model';
import { MatchingModule } from '../matching/matching.module';
import { Competence } from '../competences/competence.model';
import { VacancyCompetenceRequirement } from '../competences/vacancy-competence-requirement.model';
import { VacancyCompetenceRequirementController } from './vacancy-competence-requirement.controller';
import { VacancyCompetenceRequirementService } from './vacancy-competence-requirement.service';
import { VacancyCompetenceRequirementRepository } from './interfaces/vacancy-competence-requirement.repository.interface';
import { VacancyCompetenceRequirementServiceInterface } from './interfaces/vacancy-competence-requirement.service.interface';
import { VacancyCompetenceRequirementSequelizeRepository } from './repositories/vacancy-competence-requirement.sequelize.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Vacancy,
      VacancyStep,
      VacancyBenefit,
      VacancyRequirement,
      VacancyResponsibility,
      VacancyCompetenceRequirement,
      Competence,
    ]),
    MatchingModule,
  ],
  controllers: [VacancyController, VacancyCompetenceRequirementController],
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
    {
      provide: VacancyStepRepository,
      useClass: VacancyStepSequelizeRepository,
    },
    {
      provide: VacancyCompetenceRequirementRepository,
      useClass: VacancyCompetenceRequirementSequelizeRepository,
    },
    {
      provide: VacancyCompetenceRequirementServiceInterface,
      useClass: VacancyCompetenceRequirementService,
    },
  ],
  exports: [
    {
      provide: VacancyServiceInterface,
      useClass: VacancyService,
    },
    SequelizeModule,
  ],
})
export class VacancyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CompanyContextMiddleware).forRoutes(VacancyController);
  }
}
