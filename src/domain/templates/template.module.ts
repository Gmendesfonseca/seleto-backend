import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VacancyTemplate } from './vacancy-template.model';
import { VacancyTemplateController } from './vacancy-template.controller';
import { VacancyTemplateService } from './vacancy-template.service';
import { ProcessTemplateController } from './process-template.controller';
import { ProcessTemplateService } from './process-template.service';
import { VacancyTemplateSequelizeRepository } from './repositories/vacancy-template.sequelize.repository';
import { VacancyTemplateRepository } from './repositories/vacancy-template.repository.interface';
import { VacancyTemplateServiceInterface } from './interfaces/vacancy-template.service.interface';
import { ProcessTemplateServiceInterface } from './interfaces/process-template.service.interface';
import { ProcessTemplatesRepository } from './repositories/process-templates.repository.interface';
import { ProcessTemplateSequelizeRepository } from './repositories/process-template.sequelize.repository';
import { StepModule } from '../steps/step.module';

@Module({
  imports: [SequelizeModule.forFeature([VacancyTemplate]), StepModule],
  controllers: [VacancyTemplateController, ProcessTemplateController],
  providers: [
    {
      provide: VacancyTemplateRepository,
      useClass: VacancyTemplateSequelizeRepository,
    },
    {
      provide: VacancyTemplateServiceInterface,
      useClass: VacancyTemplateService,
    },
    {
      provide: ProcessTemplateServiceInterface,
      useClass: ProcessTemplateService,
    },
    {
      provide: ProcessTemplatesRepository,
      useClass: ProcessTemplateSequelizeRepository,
    },
  ],
  exports: [VacancyTemplateServiceInterface, ProcessTemplateServiceInterface],
})
export class TemplateModule {}
