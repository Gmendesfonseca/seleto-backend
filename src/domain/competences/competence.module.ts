import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompetenceController } from './competence.controller';
import { Competence } from './competence.model';
import { CompetenceService } from './competence.service';
import { CompetenceSequelizeRepository } from './repositories/competence.sequelize.repository';
import { CompetenceRepository } from './repositories/competence.repository.interface';
import { CompetenceServiceInterface } from './interfaces/competence.service.interface';
import { VacancyCompetenceRequirement } from './vacancy-competence-requirement.model';

@Module({
  imports: [SequelizeModule.forFeature([Competence, VacancyCompetenceRequirement])],
  controllers: [CompetenceController],
  providers: [
    {
      provide: CompetenceRepository,
      useClass: CompetenceSequelizeRepository,
    },
    {
      provide: CompetenceServiceInterface,
      useClass: CompetenceService,
    },
  ],
  exports: [CompetenceServiceInterface, SequelizeModule],
})
export class CompetenceModule {}
