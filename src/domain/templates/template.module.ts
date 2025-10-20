import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VacancyTemplate } from './vacancy-template.model';
import { VacancyTemplateController } from './vacancy-template.controller';
import { VacancyTemplateServiceImpl } from './vacancy-template.service';
import { VacancyTemplateSequelizeRepository } from './repositories/vacancy-template.sequelize.repository';
import { VacancyTemplateRepository } from './repositories/vacancy-template.repository.interface';
import { VacancyTemplateService } from './interfaces/vacancy-template.service.interface';

@Module({
  imports: [SequelizeModule.forFeature([VacancyTemplate])],
  controllers: [VacancyTemplateController],
  providers: [
    {
      provide: VacancyTemplateRepository,
      useClass: VacancyTemplateSequelizeRepository,
    },
    {
      provide: VacancyTemplateService,
      useClass: VacancyTemplateServiceImpl,
    },
  ],
  exports: [VacancyTemplateService],
})
export class TemplateModule {}
