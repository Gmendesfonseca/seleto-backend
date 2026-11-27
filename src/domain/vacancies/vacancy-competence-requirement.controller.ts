import { Body, Controller, Get, Param, ParseUUIDPipe, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { ReplaceCompetenceRequirementsDto } from './dto/vacancy-competence-requirement.dto';
import { VacancyCompetenceRequirementServiceInterface } from './interfaces/vacancy-competence-requirement.service.interface';

@Controller('vacancies/:vacancyId/competence-requirements')
export class VacancyCompetenceRequirementController {
  constructor(private readonly service: VacancyCompetenceRequirementServiceInterface) {}

  @Get()
  index(@Param('vacancyId', ParseUUIDPipe) vacancyId: string, @Req() req: Request) {
    return this.service.list(vacancyId, req.auth?.companyId ?? null);
  }

  @Put()
  replace(
    @Param('vacancyId', ParseUUIDPipe) vacancyId: string,
    @Body() dto: ReplaceCompetenceRequirementsDto,
    @Req() req: Request,
  ) {
    return this.service.replace(vacancyId, req.auth?.companyId ?? null, dto);
  }
}
