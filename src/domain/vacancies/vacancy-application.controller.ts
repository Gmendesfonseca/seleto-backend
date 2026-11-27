import { Controller, Get, Param, ParseUUIDPipe, Req } from '@nestjs/common';
import { Request } from 'express';
import { VacancyApplicationServiceInterface } from './interfaces/vacancy-application.service.interface';

@Controller('vacancies/:vacancyId')
export class VacancyApplicationController {
  constructor(private readonly service: VacancyApplicationServiceInterface) {}

  @Get('applications')
  applications(@Param('vacancyId', ParseUUIDPipe) vacancyId: string, @Req() req: Request) {
    return this.service.list(vacancyId, req.auth?.companyId ?? null);
  }

  @Get('stats')
  stats(@Param('vacancyId', ParseUUIDPipe) vacancyId: string, @Req() req: Request) {
    return this.service.stats(vacancyId, req.auth?.companyId ?? null);
  }
}
