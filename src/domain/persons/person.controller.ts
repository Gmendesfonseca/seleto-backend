import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PersonServiceInterface } from './interfaces/person.service.interface';
import { PersonQueryDto, CreatePersonDto, UpdatePersonDto } from './dto/person.dto';
import { CreatePersonFormationDto } from './dto/person-formation.dto';
import { CreatePersonExperienceDto } from './dto/person-experience.dto';
import { CreatePersonCompetenceDto } from './dto/person-competence.dto';
import { Request } from 'express';

@Controller('persons')
export class PersonController {
  private readonly logger = new Logger(PersonController.name);

  constructor(private readonly service: PersonServiceInterface) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async store(@Body() dto: CreatePersonDto) {
    this.logger.debug('Store: Called');
    return this.service.create(dto);
  }

  @Get()
  async index(@Query() query: PersonQueryDto) {
    this.logger.debug('Index: Called');
    return this.service.findAll({
      competences: query.competences,
      location: query.location,
    });
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    this.logger.debug('Show: Called');
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePersonDto) {
    this.logger.debug('Update: Called');
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.debug('Remove: Called');
    await this.service.remove(id);
  }

  @Post(':id/competences')
  @HttpCode(HttpStatus.CREATED)
  async addCompetence(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePersonCompetenceDto,
    @Req() req: Request,
  ) {
    this.logger.debug('AddCompetence: Called');
    if (req.auth?.profileId !== id) {
      throw new ForbiddenException('A person can only change their own competences');
    }
    return this.service.addCompetence(id, dto);
  }

  @Delete(':id/competences/:competenceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCompetence(@Param('id') id: string, @Param('competenceId') competenceId: string) {
    this.logger.debug('RemoveCompetence: Called');
    await this.service.removeCompetence(id, competenceId);
  }

  @Post(':id/work-experiences')
  async addWorkExperience(
    @Param('id') id: string,
    @Body() dto: CreatePersonExperienceDto,
    @Req() req: Request,
  ) {
    this.logger.debug('AddWorkExperience: Called');
    return this.service.addWorkExperience(id, {
      ...dto,
      personId: req.auth?.profileId ?? '',
    });
  }

  @Delete(':id/work-experiences/:experienceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeWorkExperience(@Param('id') id: string, @Param('experienceId') experienceId: string) {
    this.logger.debug('RemoveWorkExperience: Called');
    await this.service.removeWorkExperience(id, experienceId);
  }

  @Post(':id/education')
  async addEducation(
    @Param('id') id: string,
    @Body() dto: CreatePersonFormationDto,
    @Req() req: Request,
  ) {
    this.logger.debug('AddEducation: Called');
    return this.service.addEducation(id, { ...dto, personId: req.auth?.profileId ?? '' });
  }

  @Delete(':id/education/:educationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeEducation(@Param('id') id: string, @Param('educationId') educationId: string) {
    this.logger.debug('RemoveEducation: Called');
    await this.service.removeEducation(id, educationId);
  }

  @Get(':id/matching-vacancies')
  async findMatchingVacancies(
    @Param('id') id: string,
    @Query('minScore') minScore?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.debug('FindMatchingVacancies: Called');
    return this.service.findMatchingVacancies(id, minScore, limit);
  }
}
