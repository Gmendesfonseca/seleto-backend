import { Controller, Get, Post, Param, Query, Logger, ParseUUIDPipe } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { CandidateVacancyMatch } from './interfaces/candidate-vacancy-match.interface';

@Controller('matching')
export class MatchingController {
  private readonly logger = new Logger(MatchingController.name);

  constructor(private readonly matchingService: MatchingService) {}

  @Post('calculate/:personId/:vacancyId')
  async calculateMatch(
    @Param('personId', ParseUUIDPipe) personId: string,
    @Param('vacancyId', ParseUUIDPipe) vacancyId: string,
  ): Promise<CandidateVacancyMatch> {
    this.logger.debug('MatchingController.calculateMatch: Called');
    return this.matchingService.calculateMatch(personId, vacancyId);
  }

  @Post('recalculate/:matchId')
  async recalculateMatch(
    @Param('matchId', ParseUUIDPipe) matchId: string,
  ): Promise<CandidateVacancyMatch> {
    this.logger.debug('MatchingController.recalculateMatch: Called');
    return this.matchingService.recalculateMatch(matchId);
  }

  @Get('vacancy/:vacancyId')
  async findMatchesForVacancy(
    @Param('vacancyId', ParseUUIDPipe) vacancyId: string,
    @Query('minScore') minScore?: number,
    @Query('limit') limit?: number,
  ): Promise<CandidateVacancyMatch[]> {
    this.logger.debug('MatchingController.findMatchesForVacancy: Called');
    return this.matchingService.findMatchesForVacancy(vacancyId, minScore, limit);
  }

  @Get('person/:personId')
  async findMatchesForPerson(
    @Param('personId', ParseUUIDPipe) personId: string,
    @Query('minScore') minScore?: number,
    @Query('limit') limit?: number,
  ): Promise<CandidateVacancyMatch[]> {
    this.logger.debug('MatchingController.findMatchesForPerson: Called');
    return this.matchingService.findMatchesForPerson(personId, minScore, limit);
  }

  @Get('vacancy/:vacancyId/best')
  async getBestMatchForVacancy(
    @Param('vacancyId', ParseUUIDPipe) vacancyId: string,
  ): Promise<CandidateVacancyMatch | null> {
    this.logger.debug('MatchingController.getBestMatchForVacancy: Called');
    return this.matchingService.getBestMatchForVacancy(vacancyId);
  }
}
