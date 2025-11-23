import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CandidateVacancyMatch } from './candidate-vacancy-match.model';
import { Person } from '../persons/person.model';
import { Vacancy } from '../vacancies/vacancy.model';
import { PersonCompetence } from '../persons/person-competence.model';
import { VacancyCompetenceRequirement } from '../competences/vacancy-competence-requirement.model';
import { PersonExperience } from '../persons/person-experience.model';
import { PersonFormation } from '../persons/person-formation.model';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { CandidateVacancyMatchSequelizeRepository } from './repositories/candidate-vacancy-match.sequelize.repository';
import { CandidateVacancyMatchRepository } from './interfaces/candidate-vacancy-match.repository.interface';
import { MatchingServiceInterface } from './interfaces/matching.service.interface';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CandidateVacancyMatch,
      Person,
      Vacancy,
      PersonCompetence,
      VacancyCompetenceRequirement,
      PersonExperience,
      PersonFormation,
    ]),
  ],
  controllers: [MatchingController],
  providers: [
    {
      provide: CandidateVacancyMatchRepository,
      useClass: CandidateVacancyMatchSequelizeRepository,
    },
    {
      provide: MatchingServiceInterface,
      useClass: MatchingService,
    },
    MatchingService,
  ],
  exports: [MatchingService, MatchingServiceInterface],
})
export class MatchingModule {}
