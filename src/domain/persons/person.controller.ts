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
} from '@nestjs/common';
import { PersonServiceInterface } from './interfaces/person.service.interface';
import {
  CreatePersonDto,
  UpdatePersonDto,
  PersonQueryDto,
  AddCompetenceDto,
  AddWorkExperienceDto,
  AddEducationDto,
} from './dto/person.dto';

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
  async addCompetence(@Param('id') id: string, @Body() dto: AddCompetenceDto) {
    this.logger.debug('AddCompetence: Called');
    return this.service.addCompetence(id, dto);
  }

  @Delete(':id/competences/:competenceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCompetence(@Param('id') id: string, @Param('competenceId') competenceId: string) {
    this.logger.debug('RemoveCompetence: Called');
    await this.service.removeCompetence(id, competenceId);
  }

  @Post(':id/work-experiences')
  async addWorkExperience(@Param('id') id: string, @Body() dto: AddWorkExperienceDto) {
    this.logger.debug('AddWorkExperience: Called');
    return this.service.addWorkExperience(id, dto);
  }

  @Delete(':id/work-experiences/:experienceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeWorkExperience(@Param('id') id: string, @Param('experienceId') experienceId: string) {
    this.logger.debug('RemoveWorkExperience: Called');
    await this.service.removeWorkExperience(id, experienceId);
  }

  @Post(':id/education')
  async addEducation(@Param('id') id: string, @Body() dto: AddEducationDto) {
    this.logger.debug('AddEducation: Called');
    return this.service.addEducation(id, dto);
  }

  @Delete(':id/education/:educationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeEducation(@Param('id') id: string, @Param('educationId') educationId: string) {
    this.logger.debug('RemoveEducation: Called');
    await this.service.removeEducation(id, educationId);
  }
}
